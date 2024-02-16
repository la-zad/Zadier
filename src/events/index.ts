import type { ClientEvents } from 'discord.js';

import { COMMAND_HANDLER } from './commandHandler';
import { READY } from './ready';

// shitty type cause generics don't allow
// EVENTS to be an array of BotEvent
export type BotEvent = {
    [K in keyof ClientEvents]: SpecificBotEvent<K>;
}[keyof ClientEvents];

export type SpecificBotEvent<K extends keyof ClientEvents> = {
    name: string;
    listenTo: K;
    execute: (...args: ClientEvents[K]) => Awaitable<void>;
    once: boolean;
};

export const EVENTS: Array<BotEvent> = [COMMAND_HANDLER, READY];
