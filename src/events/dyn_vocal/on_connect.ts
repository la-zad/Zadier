import type { BotEvent } from '@events';
import { ChannelType } from 'discord.js';

/*
 * @event       - Dynamic vocal channel - on connect
 * @listenTo:   - voiceStateUpdate
 * @description - When a member connects to a voice channel factory, create a temporary and move the member to it
 * @permission  - None
 */
export const DYN_VOCAL_ON_CONNECT: BotEvent = {
    name: 'Dynamic vocal channel - on connect',
    listenTo: 'voiceStateUpdate',
    async execute(_, newVoiceState) {
        if (newVoiceState.channelId === null || newVoiceState.guild == null) return;
        const guild = newVoiceState.guild;
        const channel = newVoiceState.channel;
        if (!channel || channel.name.startsWith('Nouveau')) return;
        const member = newVoiceState.member;
        if (!member) return;
        const chan = await guild.channels.create({
            type: ChannelType.GuildVoice,
            name: `${member.nickname ?? member.user.username} qui parle`,
            parent: channel.parent,
            position: channel.position,
        });
        await member.voice.setChannel(chan);
    },
    once: false,
};
