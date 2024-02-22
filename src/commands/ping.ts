import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

/**
 * @command     - ping
 * @description - Replies with Pong!
 * @permission  - None
 */
export const PING: Command = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute(interaction) {
        const luck = Math.random();
        switch (true) {
            case luck < 0.01:
                await interaction.reply('Shit I missed, well done!');
                break;
            case luck < 0.1:
                await interaction.reply('https://tenor.com/view/cat-ping-pong-funny-animals-cats-gif-8766860');
                break;
            case luck < 0.2:
                await interaction.reply('紅龍スマッシュ!');
                break;
            default:
                await interaction.reply('Pong!');
        }
    },
};
