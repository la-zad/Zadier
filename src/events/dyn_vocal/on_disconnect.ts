import type { BotEvent } from '@events';

/*
 * @event       - Dynamic vocal channel - on disconnect
 * @listenTo:   - voiceStateUpdate
 * @description - When a member disconnects from a temporary voice channel, delete it
 * @permission  - idk
 */
export const DYN_VOCAL_ON_DISCONNECT: BotEvent = {
    name: 'Dynamic vocal channel - on disconnect',
    listenTo: 'voiceStateUpdate',
    async execute(oldStateChannel, _) {
        if (oldStateChannel.channelId === null || oldStateChannel.guild == null) return;
        const channel = oldStateChannel.channel;
        if (!channel || !channel.name.startsWith('Nouveau')) return;
        if (channel.members.size === 0) {
            await channel.delete();
        }
    },
    once: false,
};
