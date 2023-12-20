import type { Command } from '@commands';
import type { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

/*
 * @command     - ping
 * @description - Replies with Pong!
 * @permission  - None
 */
export const PING: Command = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply('Pong!');
    },
    prodReady: true,
};
