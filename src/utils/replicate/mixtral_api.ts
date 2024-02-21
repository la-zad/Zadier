import type { CacheType, CommandInteraction } from 'discord.js';

import { replicate } from '.';

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

export const DEFAULT_MIXTRAL_VALUES = {
    max_new_tokens: 1024,
    temperature: 0.6,
    top_p: 0.9,
    top_k: 50,
    presence_penalty: 0,
    frequency_penalty: 0,
    prompt_template: '<s>[INST] {prompt} [/INST] ',
};

export async function execute(interaction: CommandInteraction<CacheType>, input: InputType): Promise<void> {
    let msg = '';
    let last_time = Date.now();
    for await (const event of replicate.stream('mistralai/mixtral-8x7b-instruct-v0.1', { input })) {
        if (event.event === 'output') {
            msg += event.data;
        }
        if (Date.now() - last_time > 500 && msg !== '') {
            await interaction.editReply(msg);
            last_time = Date.now();
        }
    }
    await interaction.editReply(msg);
}
