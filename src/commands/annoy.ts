import type { Command } from '@commands';
import {
    isGuildBasedChannelNotAPIGuildBasedChannel,
    isGuildMemberNotAPIGuildMember,
    isGuildTextBasedChannelNotGuildBasedChannel,
} from '@utils/discord_type_guards';
import { SlashCommandBuilder } from 'discord.js';

/**
 * @command     - annoy
 * @description - Ghostping someone in any channel
 * @permission  - None
 */
export const ANNOY: Command = {
    data: new SlashCommandBuilder()
        .setName('annoy')
        .setDescription('Ghostping someone')
        .addMentionableOption((option) =>
            option.setName('ping').setDescription('The User you want to piss off').setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel you want the ghostping to take place (default: here)')
                .setRequired(false),
        ),
    async execute(interaction) {
        const ping = interaction.options.get('ping', true);
        if (!isGuildMemberNotAPIGuildMember(ping.member)) throw 'Can only ping a user';

        let ghostPingChannel = interaction.channel;
        const channelMention = interaction.options.get('channel');

        if (channelMention) {
            const { channel } = channelMention;
            if (!isGuildBasedChannelNotAPIGuildBasedChannel(channel)) throw 'I can only ghostping in a guild channel';
            if (!isGuildTextBasedChannelNotGuildBasedChannel(channel)) throw 'Can only send messages in text channel';
            ghostPingChannel = channel;
        }

        const ghostPing = await ghostPingChannel?.send(`${ping.member.toString()}`);
        await ghostPing?.delete();

        await interaction.reply({
            content: 'https://tenor.com/view/missionaccomplished-emperorsnewgroove-kronk-gif-4514330',
            ephemeral: true,
        });
    },
};
