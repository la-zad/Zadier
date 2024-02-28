import type { Command } from '@commands';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import pkgJson from '../../package.json';

/**
 * @command     - status
 * @description - Returns infos about the bot.
 * @permission  - None
 */
export const STATUS: Command = {
    data: new SlashCommandBuilder().setName('status').setDescription('Returns infos about the bot.'),
    async execute(interaction) {
        const infos = new EmbedBuilder()
            .setTitle('Zadier informations')
            .setDescription('JSP quoi mettre...')
            .addFields(
                { name: 'version', value: pkgJson.version },
                { name: 'heartbeat', value: `${interaction.client.ws.ping}ms` },
            );

        const sent = await interaction.reply({
            embeds: [infos],
            fetchReply: true,
        });

        const editedInfos = infos.setFooter({
            text: `Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`,
        });

        return interaction.editReply({
            embeds: [editedInfos],
        });
    },
};
