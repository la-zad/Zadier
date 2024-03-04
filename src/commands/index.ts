import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { ASK_MIXTRAL } from './ai/ask_mixtral';
import { GEN_EMOJI } from './ai/make_emoji';
import { SDXL_TURBO } from './ai/sdxl_turbo';
import { ANNOY } from './annoy';
import { PING } from './ping';

type SlashCommandDescriptor = SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type Command = {
    data: SlashCommandDescriptor;
    execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
};

export const COMMANDS: Array<Command> = [PING, SDXL_TURBO, GEN_EMOJI, ANNOY, ASK_MIXTRAL];
