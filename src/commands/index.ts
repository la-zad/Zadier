import type { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import { SDXL_TURBO } from './ai/sdxl_turbo';
import { PING } from './ping';

type SlashCommandDescriptor = SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type Command = {
    data: SlashCommandDescriptor;
    execute: (interaction: CommandInteraction) => Promise<void>;
};

export const COMMANDS: Array<Command> = [PING, SDXL_TURBO];
