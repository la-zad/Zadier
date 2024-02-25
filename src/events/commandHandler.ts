import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { BotError } from '@utils/error';

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
            const reply =
                interaction.replied || interaction.deferred
                    ? interaction.editReply.bind(interaction)
                    : interaction.reply.bind(interaction);

            if (BotError.isBotError(error)) {
                await reply({
                    embeds: [error.toEmbed()],
                    ephemeral: error.ephemeral,
                });
                console.error(error.toString());
            } else {
                console.error(error);
            }
        }
    },
    once: false,
};
