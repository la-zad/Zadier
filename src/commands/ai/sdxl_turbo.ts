import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { DEFAULT_VALUE, EventReader } from './hugging_face.ts';

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
        .addNumberOption((option) =>
            option.setName('steps').setDescription("Le nombre d'étapes (2 par défaut)").setRequired(false),
        )
        .addNumberOption((option) =>
            option.setName('seed').setDescription('La graine (aléatoire par défaut)').setRequired(false),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const replyError = async (msgError: string): Promise<void> => {
            await interaction.editReply(msgError);
        };
        const options = {
            prompt: interaction.options.get('prompt', true).value as string,
            seed: (interaction.options.get('seed')?.value as number) ?? DEFAULT_VALUE.seed,
            strength: (interaction.options.get('strength')?.value as number) ?? DEFAULT_VALUE.strength,
            steps: (interaction.options.get('steps')?.value as number) ?? DEFAULT_VALUE.steps,
        };
        if (!options.prompt) {
            return replyError('No prompt provided');
        }

        const image = await EventReader.generateImage(options);
        if (!image) {
            return replyError('Un problème est survenu...');
        }
        const msg = `> ${options.prompt}\nGraine : ${options.seed}`;

        await interaction.editReply({
            content: msg,
            files: [image],
        });
    },
};
