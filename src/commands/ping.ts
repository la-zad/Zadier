import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

/*
 * @command     - ping
 * @description - Replies with Pong!
 * @permission  - None
 */
export const PING: Command = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};
