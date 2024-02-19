import type { BotEvent } from '@events';

/**
 * @event       - Ready shoutout
 * @listenTo    - ready
 * @description - Emitted when the client becomes ready to start working.
 */
export const READY: BotEvent = {
    name: 'Ready shoutout',
    listenTo: 'ready',
    execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
    },
    once: true,
};
