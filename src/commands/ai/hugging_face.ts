const BASE_URL = 'https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space';

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

export interface Input {
    prompt: string;
    strength: number;
    steps: number;
    seed: number;
}
interface InputData {
    session_hash: string;
    input: Input;
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
    const res = await fetch(`${BASE_URL}/queue/data`, {
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

export interface Attachment {
    name: string;
    attachment: Buffer;
}

export function randomString(
    length: number,
    characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function getRoot(): Promise<Option<string>> {
    const res = await fetch(`${BASE_URL}/?__theme=light`, {
        method: 'GET',
    });
    if (res.status != 200) {
        return null;
    }
    const html = await res.text();

    const reg = new RegExp(`(${BASE_URL.replace('/', '\\/')}\\/--replicas\\/\\w+)`).exec(html);
    if (!reg?.[1]) {
        return null;
    }
    return reg[1];
}

let ROOT: Option<string> = await getRoot();

async function getFileFromRoot(path: string, force: boolean = true): Promise<Option<ArrayBuffer>> {
    if (!ROOT) {
        ROOT = await getRoot();
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
        private data: InputData,
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
    public static async generateImage(input: Input): Promise<Option<Attachment>> {
        const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyz';

        const session_hash = randomString(10, CHARSET);
        const response = await fetch(`${BASE_URL}/queue/join?__theme=light&fn_index=1&session_hash=${session_hash}`, {
            headers: {
                Accept: 'text/event-stream',
            },
            method: 'GET',
        });
        if (!response.body) {
            return null;
        }
        const reader = response.body.getReader() as ReadableStreamDefaultReader<Uint8Array>;

        const event_reader = new EventReader(reader, {
            session_hash,
            input,
        });

        await event_reader.process();

        return event_reader.image();
    }
    private async processEvent(evt: Event): Promise<boolean> {
        switch (evt.msg) {
            // case "estimation":
            //     break;
            case 'send_data':
                if (
                    !(await send_data(evt.event_id, this.data.session_hash, [
                        null,
                        this.data.input.prompt,
                        this.data.input.strength,
                        this.data.input.steps,
                        this.data.input.seed,
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

export const MAX_SEED_API = 12013012031030;

export const DEFAULT_VALUE = {
    strength: 0.7,
    steps: 2,
    get seed(): number {
        return Math.floor(Math.random() * MAX_SEED_API);
    },
};
