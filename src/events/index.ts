import type { ClientEvents } from 'discord.js';

import { CLEANUP_EMOJIS } from './cleanup_emojis';
import { COMMAND_HANDLER } from './commandHandler';
import { DYN_VOCAL_ON_CONNECT } from './dyn_vocal/on_connect';
import { DYN_VOCAL_ON_DISCONNECT } from './dyn_vocal/on_disconnect';
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

export const EVENTS: Array<BotEvent> = [
    COMMAND_HANDLER,
    READY,
    CLEANUP_EMOJIS,
    DYN_VOCAL_ON_CONNECT,
    DYN_VOCAL_ON_DISCONNECT,
];
