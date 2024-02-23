import type { BotEvent } from '@events';
/**
 * @event       - Mixtral followup
 * @listenTo    - messageCreate
 * @description - Create a new mixtral message when the user reply to a message from mixtral
 */
export const MIXTRAL_FOLLOWUP: BotEvent = {
    name: 'Mixtral followup',
    listenTo: 'messageCreate',
    once: false,
    async execute(message) {
        console.log('New message detected, Fetching conversation');
    },
};
