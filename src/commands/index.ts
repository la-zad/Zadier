import type { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import { GEN_EMOJI } from './ai/make_emoji';
import { SDXL_TURBO } from './ai/sdxl_turbo';
import { PING } from './ping';

type SlashCommandDescriptor = SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type Command = {
    data: SlashCommandDescriptor;
    execute: (interaction: CommandInteraction) => Promise<void>;
};

export const COMMANDS: Array<Command> = [PING, SDXL_TURBO, GEN_EMOJI];
