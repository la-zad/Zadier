import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

/**
 * @command     - ping
 * @description - Replies with Pong!
 * @permission  - None
 */
export const PING: Command = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    execute(interaction) {
        const luck = Math.random();
        switch (true) {
            case luck < 0.01:
                return interaction.reply('Shit I missed, well done!');
            case luck < 0.1:
                return interaction.reply('https://tenor.com/view/cat-ping-pong-funny-animals-cats-gif-8766860');
            case luck < 0.2:
                return interaction.reply('紅龍スマッシュ!');
            default:
                return interaction.reply('Pong!');
        }
    },
};
