import type { BotEvent } from '@events';

/*
 * @event       - Ready
 * @description - Emitted when the client becomes ready to start working.
 * @permission  - None
 */
export const READY: BotEvent = {
    name: 'ready',
    execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
    },
    once: true,
};
