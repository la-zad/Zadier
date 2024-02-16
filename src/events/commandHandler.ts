import { Bot } from '@bot';
import type { BotEvent } from '@events';

/*
 * @event       - Command Handler
 * @listenTo:   - interactionCreate
 * @description - Emitted when a command is called.
 * @permission  - None
 */
export const COMMAND_HANDLER: BotEvent = {
    name: 'Command Handler',
    listenTo: 'interactionCreate',
    async execute(interaction) {
        if (!Bot.isBot(interaction.client)) return console.error('Client is not a Bot. WTF?');
        if (!interaction.isCommand()) return console.log('Not a command.');

        const command = interaction.client.slashCommands.get(interaction.commandName);

        if (!command) return console.log('Command not found.');

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    },
    once: false,
};
