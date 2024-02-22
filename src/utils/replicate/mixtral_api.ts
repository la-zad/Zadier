import { shrink_text } from '@utils/text';
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

export async function execute(interaction: CommandInteraction<CacheType>, input: InputType): Promise<void> {
    let msg = '';
    let last_time = Date.now();
    let sender: CommandInteraction | Message = interaction;
    const send = async (text: string): Promise<void> => {
        if (isCommandInteraction(sender)) {
            await sender.editReply(text);
        } else {
            await sender.edit(text);
        }
    };
    for await (const event of REPLICATE.stream(MODEL, { input })) {
        if (event.event === 'output') {
            msg += event.data;
        }
        while (msg.length > MAX_MESSAGE_LENGTH) {
            const [message, shrink] = shrink_text(msg, MAX_MESSAGE_LENGTH, /\.[^.]*$/g);
            await send(message);
            msg = shrink;
            //prevent sending empty message
            const shrink_send = shrink === '' ? '.' : shrink;
            sender = await (isCommandInteraction(sender) ? sender.followUp(shrink_send) : sender.reply(shrink_send));
            last_time = Date.now();
        }
        if (Date.now() - last_time > 500 && msg !== '') {
            await send(msg);
            last_time = Date.now();
        }
    }
    await interaction.editReply(msg);
}
