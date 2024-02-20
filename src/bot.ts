import type { Command } from '@commands';
import { COMMANDS } from '@commands';
import type { SpecificBotEvent } from '@events';
import { EVENTS } from '@events';
import type { OAuth2Guild } from 'discord.js';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';

export class Bot extends Client {
    private commands: Collection<string, Command> = new Collection();

    static isBot(obj: Client): obj is Bot {
        // check that slashCommands is a property of obj
        return 'slashCommands' in obj;
    }

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
                GatewayIntentBits.GuildVoiceStates,
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

    get slashCommands(): Collection<string, Command> {
        return this.commands;
    }

    /*
     * Used to register all slash commands on discord
     */
    public async registerSlashCommands(guilds: Collection<string, OAuth2Guild>): Promise<void> {
        const commands = this.commands.map((cmd) => cmd.data.toJSON());

        const rest = new REST().setToken(this.TOKEN);

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        for (const guild of guilds.values()) {
            try {
                await rest.put(Routes.applicationGuildCommands(this.CLIENT_ID, guild.id), { body: commands });
                console.log(`Successfully reloaded application (/) commands for guild: ${guild.name}`);
            } catch (error) {
                console.error(error);
            }
        }
    }

    public restart(): Promise<void> {
        return this.destroy()
            .then(() => this.start())
            .catch(console.error);
    }

    public start(): Promise<void> {
        // Set up events before login, otherwise, the ready event will not fire
        this.setUpEvents();
        return this.login(this.TOKEN)
            .then(() => this.guilds.fetch())
            .then(async (guilds) => {
                await this.clearCommands();
                await this.clearApplicationCommands();
                this.setUpCommands();
                return this.registerSlashCommands(guilds);
            });
    }

    /*
     * Used to set up all commands in the bot's memory
     */
    private setUpCommands(): void {
        for (const command of COMMANDS) {
            this.commands.set(command.data.name, command);
        }
    }

    /*
     * Used to set up all events in the bot's memory
     */
    private setUpEvents(): void {
        for (const event of EVENTS) {
            console.log(`Setting up event: ${event.name}`);
            // else TSserver will complain about the type of event.execute
            // saying its too weak to calculate the type EvenHandler
            // so we have to cast it to the correct type
            type EventHandler = SpecificBotEvent<typeof event.listenTo>['execute'];
            if (event.once) {
                this.once(event.listenTo, event.execute as EventHandler);
            } else {
                this.on(event.listenTo, event.execute as EventHandler);
            }
        }
    }

    private async clearCommands(): Promise<void> {
        this.commands.clear();
        // cache already populated with the minimal amount of data
        for (const guild of this.guilds.cache.values()) {
            for (const command of guild.commands.cache.values()) {
                await guild.commands.delete(command.id);
            }
        }
    }

    private async clearApplicationCommands(): Promise<void> {
        const application = this.application;

        if (!application) return console.error('Application not found');

        const applicationCommands = await application.commands.fetch();
        for (const command of applicationCommands.values()) {
            await command.delete();
        }
    }
}
