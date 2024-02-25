import type { ColorResolvable } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

export class BotError {
    constructor(
        public kind: 'command' | 'event' | 'internal',
        public severity: 'info' | 'warning' | 'critical' | 'fatal',
        public thrower: string,
        public message: string,
    ) {}

    static isBotError(err: unknown): err is BotError {
        return Object.prototype.hasOwnProperty.call(err, 'thrower');
    }

    public toEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle('An error occured')
            .setColor(this.color)
            .setAuthor({ name: `${this.kind}: ${this.thrower}` })
            .setDescription(this.message);
    }

    public toString(): string {
        return `[${this.kind}] - ${this.thrower}: ${this.message}`;
    }

    get color(): ColorResolvable {
        switch (this.severity) {
            case 'critical':
                return 'Red';
            case 'fatal':
                return 'Red';
            case 'info':
                return 'Blue';
            case 'warning':
                return 'Orange';
        }
    }

    get ephemeral(): boolean {
        switch (this.severity) {
            case 'info':
            case 'warning':
                return true;
            case 'critical':
            case 'fatal':
                return false;
        }
    }
}
