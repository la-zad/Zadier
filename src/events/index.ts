import type { ClientEvents } from 'discord.js';

import { READY } from './ready';

export type Event<T extends keyof ClientEvents> = {
    event: T;
    execute: (...args: ClientEvents[T]) => Awaitable<void>;
    once: boolean;
};

export const EVENTS = [READY];
