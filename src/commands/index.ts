import type { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import { PING } from './ping';
import { SDXL_TURBO } from './sdxl_turbo';

export type Command = {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
};

export const COMMANDS: Array<Command> = [PING, SDXL_TURBO];
