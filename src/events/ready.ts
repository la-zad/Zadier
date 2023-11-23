import type { Event } from '@events';

export const READY: Event<'ready'> = {
    event: 'ready',
    execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
    },
    once: true,
};
