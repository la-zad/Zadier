interface EventEstimation {
    msg: 'estimation';
    rank: number;
    queue_size: number;
    avg_event_process_time: number;
    avg_event_concurrent_process_time: number;
    rank_eta: number;
    queue_eta: number;
}
interface EventSendData {
    msg: 'send_data';
    event_id: string;
}
interface EventProcessStart {
    msg: 'process_starts';
}
interface EventProcessCompleted {
    msg: 'process_completed';
    output?: Output;
    success: boolean;
}

type Event = EventEstimation | EventSendData | EventProcessStart | EventProcessCompleted;

interface Input {
    session_hash: string;

    prompt: string;
    strength: number;
    steps: number;
    seed: number;
}

interface Output {
    data: OutputData[];
    is_generating: boolean;
    duration: number;
    average_duration: number;
}

interface OutputData {
    path: string;
    url: string | null;
    size: number | null;
    orig_name: string;
    mime_type: string | null;
}

async function send_data<T>(event_id: string, session_hash: string, data: T): Promise<boolean> {
    const res = await fetch('https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/queue/data', {
        method: 'POST',
        body: JSON.stringify({
            data,
            event_id,
            event_data: null,
            fn_index: 1,
            trigger_id: 5,
            session_hash,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.status == 200;
}

interface Attachment {
    name: string;
    attachment: Buffer;
}

async function getRoot(): Promise<Option<string>> {
    const res = await fetch('https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/?__theme=light', {
        method: 'GET',
    });
    if (res.status != 200) {
        return null;
    }
    const html = await res.text();

    const reg = /(https:\/\/diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space\/--replicas\/\w+)/s.exec(html);
    if (!reg?.[1]) {
        return null;
    }
    return reg[1];
}

let ROOT: Option<string> = await getRoot();

async function getFileFromRoot(path: string, force: boolean = true): Promise<Option<ArrayBuffer>> {
    if (!ROOT) {
        await getRoot();
        if (!ROOT) {
            return null;
        }
    }
    const res = await fetch(`${ROOT}/file=${path}`);
    if (res.status == 404 && !force) {
        ROOT = null;
        return getFileFromRoot(path, false);
    } else if (res.status != 200) {
        return null;
    }
    return res.arrayBuffer();
}

function intoEvent(value_string: string): Event | null {
    const reg = /data: (.*)/.exec(value_string);
    if (!reg?.[1]) {
        return null;
    }
    const data = reg[1];
    const parsed = JSON.parse(data) as Event;
    return parsed;
}

export class EventReader {
    private img: Option<Attachment> = null;
    public constructor(
        private reader: ReadableStreamDefaultReader<Uint8Array>,
        private data: Input,
    ) {}
    public image(): Option<typeof this.img> {
        return this.img;
    }

    public async process(): Promise<void> {
        for (;;) {
            const evt = await this.reader.read();
            if (evt.done) {
                return;
            }
            const value_string = new TextDecoder('utf-8').decode(evt.value);
            for (const line of value_string.split('\n')) {
                if (line === '') {
                    continue;
                }
                const evt = intoEvent(line);
                if (!evt) {
                    continue;
                }
                if (!(await this.processEvent(evt))) {
                    return;
                }
            }
        }
    }
    private async processEvent(evt: Event): Promise<boolean> {
        switch (evt.msg) {
            // case "estimation":
            //     break;
            case 'send_data':
                if (
                    !(await send_data(evt.event_id, this.data.session_hash, [
                        null,
                        this.data.prompt,
                        this.data.strength,
                        this.data.steps,
                        this.data.seed,
                    ]))
                ) {
                    return false;
                }
                break;
            // case "process_starts":
            //     break;
            case 'process_completed':
                if (evt.success) {
                    const data = evt.output?.data[0];
                    if (!data) {
                        return false;
                    }
                    const res = await getFileFromRoot(data.path);
                    if (!res) {
                        return false;
                    }
                    this.img = {
                        name: data.orig_name,
                        attachment: Buffer.from(res),
                    };
                }
                break;
        }
        return true;
    }
}
