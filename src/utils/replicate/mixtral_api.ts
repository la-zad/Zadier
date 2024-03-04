import { partition_text, PARTITIONING_PATTERNS } from '@utils/text';
import type { CacheType, CommandInteraction, Message } from 'discord.js';

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

type Output = string[];

export async function execute(interaction: CommandInteraction<CacheType>, input: InputType): Promise<void> {
    const replier = new Sender(interaction);
    const response = (await REPLICATE.run(MODEL, { input })) as Output;
    replier.append(response.join(''));
    await replier.send_deferred(true);
}
