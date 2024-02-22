import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { isGuildMember, isRole } from '../utils/apiDiscriminent';

/**
 * @command     - annoy
 * @description - Ghostping someone
 * @permission  - None
 */
export const ANNOY: Command = {
    data: new SlashCommandBuilder()
        .setName('annoy')
        .setDescription('Ghostping someone')
        .addMentionableOption((option) =>
            option.setName('ping').setDescription('The role or User you want to piss off').setRequired(true),
        ),
    async execute(interaction) {
        const ping = interaction.options.get('ping', true);

        if (ping.member && isGuildMember(ping.member)) {
            await interaction.reply({ content: `${ping.member.toString()}`, ephemeral: true });
        } else if (ping.role && isRole(ping.role)) {
            if (ping.role.name === '@everyone') throw 'Cannot ping everyone';
            await interaction.reply({ content: `${ping.role.toString()}`, ephemeral: true });
        } else {
            throw 'Unkown type of ping';
        }

        return;
    },
};
