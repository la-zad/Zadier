import type { Command } from '@commands';
import type { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.reply('Pong!');
}

export const PING: Command = {
    data,
    execute,
};
