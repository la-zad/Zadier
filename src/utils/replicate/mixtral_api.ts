import { partition_text, PARTITIONING_PATTERNS } from '@utils/text';
import type { CacheType, CommandInteraction, Message } from 'discord.js';
import type { Prediction } from 'replicate';

import { REPLICATE } from '.';

const MODEL = 'mistralai/mixtral-8x7b-instruct-v0.1';

const MAX_MESSAGE_LENGTH = 2000;

export const DEFAULT_MIXTRAL_VALUES = {
    max_new_tokens: 512,
    temperature: 0.6,
    top_p: 0.9,
    top_k: 50,
    presence_penalty: 0,
    frequency_penalty: 0,
    prompt_template: '<s>[INST] {prompt} [/INST] ',
};

export interface InputType {
    prompt: string;
    max_new_tokens: number;
    temperature: number;
    top_p: number;
    top_k: number;
    presence_penalty: number;
    frequency_penalty: number;
    prompt_template: string;
}

function isCommandInteraction(value: unknown): value is CommandInteraction {
    return (value as CommandInteraction).editReply !== undefined;
}

class Sender {
    static TICK_MILLISECONDS = 500;
    private last_time = Date.now();
    private msg: string = '';
    private defer_await: Promise<Message<boolean>> | null = null;
    constructor(public sender: CommandInteraction | Message) {}
    public append(text: string): void {
        this.msg += text;
    }
    public async send_deferred(now = false): Promise<void> {
        if (now || Date.now() - this.last_time > Sender.TICK_MILLISECONDS) {
            this.last_time = Date.now();
            if (this.msg === '') return;

            if (this.defer_await) await this.defer_await;
            this.send_message();

            await this.manage_overflow();
        }
    }
    private send_message(): void {
        this.defer_await = isCommandInteraction(this.sender)
            ? this.sender.editReply(this.msg)
            : this.sender.edit(this.msg);
    }
    async manage_overflow(): Promise<void> {
        while (this.msg.length > MAX_MESSAGE_LENGTH) {
            const [message, shrunk] = partition_text(
                this.msg,
                MAX_MESSAGE_LENGTH,
                PARTITIONING_PATTERNS.END_OF_SENTENCE,
            );
            this.msg = message;
            if (this.defer_await) await this.defer_await;
            this.send_message();
            this.defer_await = null;
            this.msg = shrunk;
            //prevent sending empty message
            const shrunk_sendable = shrunk === '' ? '.' : shrunk;
            this.sender = await (isCommandInteraction(this.sender)
                ? this.sender.followUp(shrunk_sendable)
                : this.sender.reply(shrunk_sendable));
            this.last_time = Date.now();
        }
    }
}

async function createPrediction(input: InputType): Promise<Prediction> {
    return REPLICATE.predictions.create({
        input,
        model: MODEL,
        stream: true,
    });
}

export async function execute(interaction: CommandInteraction<CacheType>, input: InputType): Promise<void> {
    const BASE_URL = 'https://api.replicate.com/v1';
    const replier = new Sender(interaction);
    const ID = Date.now();
    console.log(`New request (ID: ${ID})`);
    // const stream = REPLICATE.stream(MODEL, { input })
    try {
        const prediction = await createPrediction(input);
        // const res = await fetch(`${BASE_URL}/models/${MODEL}/predictions`, {
        //     method: 'POST',
        //     headers: {
        //         Authorization: `Token ${REPLICATE.auth}`,
        //         'Content-Type': 'text/event-stream',
        //         'User-Agent': `Zadier/1.0.0`,
        //     },
        //     body: JSON.stringify({ input }),
        // });
        if (!prediction.urls?.stream) throw 'Error Replicate - No stream';

        const stream = await fetch(prediction.urls.stream, {
            headers: {
                Accept: 'text/event-stream',
            },
        });
        const reader = stream.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>;
        if (!reader) throw 'Error Replicate - No stream';
        let last_event_id = '';
        let event = '';
        let quit = false;
        for (; !quit; ) {
            const evt = await reader.read();
            if (evt.done) return;

            const value_string = new TextDecoder('utf-8').decode(evt.value);
            for (const line of value_string.split('\n')) {
                if (line === '') continue;

                const [field, value] = line.split(': ');
                if (!(field && value)) continue;

                switch (field) {
                    case 'event':
                        event = value;
                        break;
                    case 'id':
                        last_event_id = value;
                        break;
                    case 'data':
                        switch (event) {
                            case 'error':
                                throw `Error Replicate (ID: ${ID} at ${last_event_id}) - ${value}`;
                            case 'done':
                                quit = true;
                                break;
                            default:
                                replier.append(value);
                                await replier.send_deferred();
                                break;
                        }
                        break;
                }

                if (quit) break;
            }
        }
    } catch (error) {
        console.error(`Error Replicate (ID: ${ID}) - `, error);
    }
    console.log(`End request (ID: ${ID})`);
    await replier.send_deferred(true);
}
