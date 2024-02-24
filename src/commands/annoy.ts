import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { isGuildMemberNotAPIGuildMember } from '../utils/apiDiscriminent';

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

        if (!isGuildMemberNotAPIGuildMember(ping.member)) throw 'Can only ping a user';

        return interaction.reply({ content: `${ping.member.toString()}` }).then((reply) => reply.delete());
    },
};
