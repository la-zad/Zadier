import type { BotEvent } from '@events';
import { ChannelType } from 'discord.js';

/*
 * @event       - Dynamic vocal channel - on connect
 * @listenTo:   - channelUpdate
 * @description - Emitted when the client becomes ready to start working.
 * @permission  - None
 */
export const DYN_VOCAL_ON_CONNECT: BotEvent = {
    name: 'Dynamic vocal channel - on connect',
    listenTo: 'voiceStateUpdate',
    async execute(_, newVoiceState) {
        if (newVoiceState.channelId === null || newVoiceState.guild == null) return;
        const guild = newVoiceState.guild;
        const channel = newVoiceState.channel;
        if (!channel || channel.permissionsFor(newVoiceState.guild.id)?.has('SendMessages')) {
            return;
        }
        const member = newVoiceState.member;
        if (!member) return;
        const chan = await guild.channels.create({
            type: ChannelType.GuildVoice,
            name: `${newVoiceState.member?.nickname ?? 'un mec'} qui parle`,
            position: channel.position + 1,
        });
        await member.voice.setChannel(chan);
    },
    once: true,
};
