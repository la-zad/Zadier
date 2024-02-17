import type { BotEvent } from '@events';

/*
 * @event       - Dynamic vocal channel - on connect
 * @listenTo:   - channelUpdate
 * @description - Emitted when the client becomes ready to start working.
 * @permission  - None
 */
export const DYN_VOCAL_ON_DISCONNECT: BotEvent = {
    name: 'Dynamic vocal channel - on disconnect',
    listenTo: 'voiceStateUpdate',
    async execute(oldStateChannel, _) {
        if (oldStateChannel.channelId === null || oldStateChannel.guild == null) return;
        const channel = oldStateChannel.channel;
        if (!channel || !channel.permissionsFor(oldStateChannel.guild.id)?.has('SendMessages')) return;
        if (channel.members.size === 0) {
            await channel.delete();
        }
    },
    once: false,
};
