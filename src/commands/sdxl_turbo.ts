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
        output?: ProcessOutput
        success: boolean
    }

    export type Event = EventEstimation | EventSendData | EventProcessStart | EventProcessCompleted;
    
    export interface ProcessOutput {
        data: ProcessData[]
        is_generating: boolean
        duration: number
        average_duration: number
    }
    
    export interface ProcessData {
        path: string
        url: string | null
        size: number | null
        orig_name: string
        mime_type: string | null
    }

    export async function send_data<T>(event_id: string, data: T): Promise<boolean> {
        const res = await fetch("https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/queue/data", {
            method: "POST",
            body: JSON.stringify({
                data,
                event_id: event_id,
                event_data: null,
                fn_index: 1,
                trigger_id: 5,
                session_hash: "sd58xc984e"
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

function intoValue(evt: EventStream): hugging_face.Event | null {
    const tstring = new TextDecoder("utf-8").decode(evt.value);
    const reg = /data: (.*)/.exec(tstring);
    if (!(reg && reg[1])) {
        return null;
    }
    const data = reg[1];
    const parsed = JSON.parse(data);
    return parsed
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
            .setDescription('La force du bruitage')
            .setRequired(false)
        )
        .addNumberOption((option) => option
            .setName('steps')
            .setDescription('Le nombre d\'étapes')
            .setRequired(false)
        )
        .addNumberOption((option) => option
            .setName('seed')
            .setDescription('La graine')
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

        const response = await fetch("https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/queue/join?__theme=light&fn_index=1&session_hash=sd58xc984e", {
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
        const reader = response.body.getReader();
        let img = null;
        while (reader && !img) {
            const evt = await reader?.read() as EventStream;
            if (!evt) {
                console.log("No event");
                continue;
            }
            if (evt.done) {
                console.log("Done");
                break;
            };
            const value = intoValue(evt);
            console.log("New chunk:", value);
            if (!value) {
                console.log("No value");
                break;
            }
            switch (value.msg) {
                case "estimation":
                    console.log(`Rank: ${value.rank}, Queue size: ${value.queue_size}, ETA: ${value.rank_eta}, Queue ETA: ${value.queue_eta}`);
                    break;
                case "send_data":

                    if (!await hugging_face.send_data(value.event_id, [null, prompt, strength, steps, seed])) {
                        console.log("Send data failed");
                        replyError("Send data failed");
                        return;
                    } else {
                        console.log("Send data success");
                    }
                    break;
                case "process_starts":
                    console.log("Process starts");
                    break;
                case "process_completed":
                    console.log("Process completed");
                    if (value.success) {
                        const data = value.output?.data[0];
                        if (data) {
                            const res = await fetch(`https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/--replicas/5miuw/file=${data.path}`);
                            if (res.status != 200) {
                                console.log("Fetch failed");
                                replyError("Fetch failed");
                                return;
                            }
                            img = {
                                name: data.orig_name,
                                attachment: Buffer.from(await res.arrayBuffer())
                            };

                        }
                    }
                    break;
            }
        }
        console.log("response: ", response)

        await reply;
        
        if (img) {
            await interaction.editReply({
                files: [img]
            });
        } else {
            await interaction.editReply("No image found");
        }

    },
};
