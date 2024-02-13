import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';


namespace hugging_face {
    export interface HuggingFacePayload<T> {
        data: T
        event_data: null
        fn_index: number
        trigger_id: number
        session_hash: string
        event_id: string
    }
    export interface EventEstimation {
        msg: "estimation",
        rank: number
        queue_size: number
        avg_event_process_time: number
        avg_event_concurrent_process_time: number
        rank_eta: number
        queue_eta: number
    }
    export interface EventSendData {
        msg: "send_data"
        event_id: string
    }
    export interface EventProcessStart {
        msg: "process_starts"
    }
    export interface EventProcessCompleted {
        msg: "process_completed"
        output?: Output
        success: boolean
    }

    export type Event = EventEstimation | EventSendData | EventProcessStart | EventProcessCompleted;
    
    export interface Input {
        session_hash: string

        prompt: string
        strength: number
        steps: number
        seed: number
    }

    export interface Output {
        data: OutputData[]
        is_generating: boolean
        duration: number
        average_duration: number
    }
    
    export interface OutputData {
        path: string
        url: string | null
        size: number | null
        orig_name: string
        mime_type: string | null
    }

    export async function send_data<T>(event_id: string, session_hash: string, data: T): Promise<boolean> {
        const res = await fetch("https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/queue/data", {
            method: "POST",
            body: JSON.stringify({
                data,
                event_id: event_id,
                event_data: null,
                fn_index: 1,
                trigger_id: 5,
                session_hash
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return res.status == 200;
    }
}
interface EventStream {
    done: boolean
    value: Uint8Array
}

interface Attachment {
    name: string,
    attachment: Buffer
}

function bufferToStream(buffer: Uint8Array): string {
    return new TextDecoder("utf-8").decode(buffer);
}

async function getRoot(): Promise<Option<string>> {
    const res = await fetch("https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/?__theme=light", {
        method: "GET"
    });
    if (res.status != 200) {
        return null;
    }
    const html = await res.text();

    const reg = /(https:\/\/diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space\/--replicas\/\w+)/s.exec(html);
    if (!(reg && reg[1])) {
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
        ROOT = null
        return getFileFromRoot(path, false);
    } else if (res.status != 200) {
        return null;
    }
    return res.arrayBuffer();
}

function intoEvent(value_string: string): hugging_face.Event | null {
    const reg = /data: (.*)/.exec(value_string);
    if (!(reg && reg[1])) {
        return null;
    }
    const data = reg[1];
    const parsed = JSON.parse(data);
    return parsed
}

class EventReader {
    private img: Option<Attachment> = null;
    public constructor(private reader: ReadableStreamDefaultReader<Uint8Array>, private data: hugging_face.Input) 
    {}
    public image(): Option<typeof this.img> {
        return this.img;
    }

    public async process(): Promise<void> {
        while (true) {
            const evt = await this.reader.read();
            if (evt.done) {
                return;
            }
            const value_string = bufferToStream(evt.value);
            for (const line of value_string.split("\n")) {
                if (line === "") {
                    continue;
                }
                const evt = intoEvent(line);
                if (!evt) {
                    continue;
                }
                if (!await this.processEvent(evt)) {
                    return; 
                }
            }
            // const val = intoValue(evt.value);
        }
    }
    private async processEvent(evt: hugging_face.Event): Promise<boolean> {
        switch (evt.msg) {
            // case "estimation":
            //     break;
            case "send_data":
                if (!await hugging_face.send_data(evt.event_id, this.data.session_hash, [null, this.data.prompt, this.data.strength, this.data.steps, this.data.seed])) {
                    return false;
                }
                break;
            // case "process_starts":
            //     break;
            case "process_completed":
                if (evt.success) {
                    const data = evt.output?.data[0];
                    if (data) {
                        const res = await getFileFromRoot(data.path)
                        if (!res) {
                            return false;
                        }
                        this.img = {
                            name: data.orig_name,
                            attachment: Buffer.from(res)
                        };

                    }
                }
                break;
        }
        return true;
    }
}


/*
 * @command     - sdxl_turbo
 * @description - Génère des images avec SDLXL Turbo!
 * @permission  - None
 */
export const SDXL_TURBO: Command = {
    data: new SlashCommandBuilder()
        .setName('sdxl_turbo')
        .setDescription('Génère des images avec SDLXL Turbo!')
        .addStringOption((option) => option
            .setName('prompt')
            .setDescription('Le prompt')
            .setRequired(true)
        )
        .addNumberOption((option) => option
            .setName('strength')
            .setDescription('La force du bruitage (0.7 par défaut)')
            .setRequired(false)
        )
        .addNumberOption((option) => option
            .setName('steps')
            .setDescription('Le nombre d\'étapes (2 par défaut)')
            .setRequired(false)
        )
        .addNumberOption((option) => option
            .setName('seed')
            .setDescription('La graine (aléatoire par défaut)')
            .setRequired(false)
        ),
    async execute(interaction) {
        const reply = interaction.deferReply();
        const replyError = async (msgError: string) => {
            await reply;
            await interaction.editReply(msgError);
        }

        // Discord slash command parameters
        const prompt = interaction.options.get('prompt')?.value as string;
        if (!prompt) {
            replyError("No prompt provided");
            return;
        }
        const seed = interaction.options.get('seed')?.value as number || Math.floor(Math.random()*12013012031030);
        const strength = interaction.options.get('strength')?.value as number || 0.7;
        const steps = interaction.options.get('steps')?.value as number || 2;
        const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
        let session_hash = "";
        for(let i = 0; i < 10; i++) {
            session_hash += CHARS[Math.floor(Math.random()*CHARS.length)];
        }
        const response = await fetch(`https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/queue/join?__theme=light&fn_index=1&session_hash=${session_hash}`, {
            headers: {
                "Accept": "text/event-stream"
            },
            method: "GET",
            keepalive: true,
            timeout: false
        });
        if (!response.body) {
            replyError("fetch has no body")
            return;
        }
        const reader = response.body.getReader() as ReadableStreamDefaultReader<Uint8Array>;

        const event_reader = new EventReader(reader, {
            session_hash,
            prompt,
            strength,
            steps,
            seed
        })

        await event_reader.process();

        await reply;
        const image = event_reader.image();
        if (image) {
            await interaction.editReply({
                files: [image]
            });
        } else {
            await interaction.editReply("Un problème est survenu...");
        }

    },
};
