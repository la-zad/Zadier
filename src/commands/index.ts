import type { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import { PING } from './ping';

export type Command = {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
};

export const COMMANDS: Array<Command> = [PING];
