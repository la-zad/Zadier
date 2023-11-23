import { type Command, COMMANDS } from '@commands';
import { EVENTS } from '@events';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';

export class Bot extends Client {
    private commands: Collection<string, Command> = new Collection();

    constructor(
        private readonly TOKEN: string,
        private readonly CLIENT_ID: string,
    ) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                // GatewayIntentBits.GuildMembers,              // require permissions from devConsole
                // GatewayIntentBits.GuildModeration,
                // GatewayIntentBits.GuildBans,                 // deprecated
                // GatewayIntentBits.GuildEmojisAndStickers,
                // GatewayIntentBits.GuildIntegrations,
                // GatewayIntentBits.GuildWebhooks,
                // GatewayIntentBits.GuildInvites,
                // GatewayIntentBits.GuildVoiceStates,
                // GatewayIntentBits.GuildPresences,            // require permissions from devConsole
                // GatewayIntentBits.GuildMessages,
                // GatewayIntentBits.GuildMessageReactions,
                // GatewayIntentBits.GuildMessageTyping,
                // GatewayIntentBits.DirectMessages,
                // GatewayIntentBits.DirectMessageReactions,
                // GatewayIntentBits.DirectMessageTyping,
                // GatewayIntentBits.MessageContent,
                // GatewayIntentBits.GuildScheduledEvents,
                // GatewayIntentBits.AutoModerationConfiguration,
                // GatewayIntentBits.AutoModerationExecution,
            ],
        });
    }

    public async registerSlashCommands(): Promise<void> {
        const commands = this.commands.map((cmd) => cmd.data.toJSON());

        const rest = new REST().setToken(this.TOKEN);

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        await rest.put(Routes.applicationCommands(this.CLIENT_ID), { body: commands });
    }

    public async restart(): Promise<void> {
        await this.stop();
        await this.start();
    }

    public async start(): Promise<string> {
        this.registerEvents();
        this.registerCommands();
        await this.registerSlashCommands();
        return this.login(this.TOKEN);
    }

    public async stop(): Promise<void> {
        await this.destroy();
    }

    private registerCommands(): void {
        for (const command of COMMANDS) {
            this.commands.set(command.data.name, command);
        }
    }

    private registerEvents(): void {
        for (const event of EVENTS) {
            if (event.once) {
                this.once(event.event, (...args) => event.execute(...args));
            } else {
                this.on(event.event, (...args) => event.execute(...args));
            }
        }
    }
}
