import type { BotEvent } from '@events';

/**
 * @event       - Dynamic vocal channel - on disconnect
 * @listenTo    - voiceStateUpdate
 * @description - When a member disconnects from a temporary voice channel, delete it
 * @permission  - None
 */
export const DYN_VOCAL_ON_DISCONNECT: BotEvent = {
    once: false,
    name: 'Dynamic vocal channel - on disconnect',
    listenTo: 'voiceStateUpdate',
    async execute({ channel }, _) {
        if (!channel || !channel.name.startsWith('Nouveau') || channel.members.size) return;

        await channel.delete();
    },
};
