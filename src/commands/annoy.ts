import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { isGuildMember } from '../utils/apiDiscriminent';

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
            option.setName('ping').setDescription('The User you want to piss off').setRequired(true),
        ),
    async execute(interaction) {
        const ping = interaction.options.get('ping', true);

        if (!(ping.member && isGuildMember(ping.member))) throw 'Can only ping a user';

        const reply = await interaction.reply({ content: `${ping.member.toString()}` });
        return reply.delete();
    },
};
