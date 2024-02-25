import type { Command } from '@commands';
import { BotError } from '@utils/error';
import { DEFAULT_VALUE, EventReader } from '@utils/hugging_face';
import { SlashCommandBuilder } from 'discord.js';

/*
 * @command     - sdxl_turbo
 * @description - Génère des images avec SDLXL Turbo!
 * @permission  - None
 */
export const SDXL_TURBO: Command = {
    data: new SlashCommandBuilder()
        .setName('sdxl_turbo')
        .setDescription('Génère des images avec SDLXL Turbo!')
        .addStringOption((option) => option.setName('prompt').setDescription('Le prompt').setRequired(true))
        .addNumberOption((option) =>
            option.setName('strength').setDescription('La force du bruitage (0.7 par défaut)').setRequired(false),
        )
        .addIntegerOption((option) =>
            option.setName('steps').setDescription("Le nombre d'étapes (2 par défaut)").setRequired(false),
        )
        .addIntegerOption((option) =>
            option.setName('seed').setDescription('La graine (aléatoire par défaut)').setRequired(false),
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const options = {
            prompt: interaction.options.getString('prompt', true),
            seed: interaction.options.getInteger('seed') ?? DEFAULT_VALUE.seed,
            strength: interaction.options.getNumber('strength') ?? DEFAULT_VALUE.strength,
            steps: interaction.options.getInteger('steps') ?? DEFAULT_VALUE.steps,
        };

        const image = await EventReader.generateImage(options);
        if (!image) throw new BotError('COMMAND', 'critical', 'make_emoji', 'Un problème est survenu...');

        return interaction.editReply({
            content: `> ${options.prompt}\nGraine : ${options.seed}`,
            files: [image],
        });
    },
};
