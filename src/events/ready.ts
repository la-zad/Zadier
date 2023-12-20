import type { Event } from '@events';

/*
 * @event       - Ready
 * @description - Emitted when the client becomes ready to start working.
 * @permission  - None
 */
export const READY: Event<'ready'> = {
    event: 'ready',
    execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
    },
    once: true,
};
