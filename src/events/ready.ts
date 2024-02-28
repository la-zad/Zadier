import type { BotEvent } from '@events';
import { LOG } from '@utils/log';

/**
 * @event       - Ready shoutout
 * @listenTo    - ready
 * @description - Emitted when the client becomes ready to start working.
 */
export const READY: BotEvent = {
    name: 'Ready shoutout',
    listenTo: 'ready',
    execute(client) {
        LOG.info(`Logged in as ${client.user.tag}!`);
    },
    once: true,
};
