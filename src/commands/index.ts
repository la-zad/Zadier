import type { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import { PING } from './ping';
import { SDXL_TURBO } from './sdxl_turbo/sdxl_turbo';

type SlashCommandDescriptor = SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type Command = {
    data: SlashCommandDescriptor;
    execute: (interaction: CommandInteraction) => Promise<void>;
};

export const COMMANDS: Array<Command> = [PING, SDXL_TURBO];
