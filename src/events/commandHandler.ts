import { Bot } from '@bot';
import type { BotEvent } from '@events';

/**
 * @event       - Command Handler
 * @listenTo    - interactionCreate
 * @description - Emitted when a command is called.
 */
export const COMMAND_HANDLER: BotEvent = {
    name: 'Command Handler',
    listenTo: 'interactionCreate',
    async execute(interaction) {
        if (!Bot.isBot(interaction.client)) return console.error('Client is not a Bot. WTF?');
        if (!interaction.isChatInputCommand()) return console.log('Not a command.');

        const command = interaction.client.slashCommands.get(interaction.commandName);

        if (!command) return console.log('Command not found.');

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const reply = {
                content: 'There was an error while executing this command!',
                ephemeral: true,
            };
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    },
    once: false,
};
