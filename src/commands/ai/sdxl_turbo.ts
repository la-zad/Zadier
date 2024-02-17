import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { EventReader } from './hugging_face.ts';

const DEFAULT_VALUE = {
    strength: 0.7,
    steps: 2,
    get seed(): number {
        return Math.floor(Math.random() * 12013012031030);
    },
};

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

        // Discord slash command parameters
        const prompt = interaction.options.get('prompt')?.value as string;
        const seed = (interaction.options.get('seed')?.value as number) ?? DEFAULT_VALUE.seed;
        const strength = (interaction.options.get('strength')?.value as number) ?? DEFAULT_VALUE.strength;
        const steps = (interaction.options.get('steps')?.value as number) ?? DEFAULT_VALUE.steps;
        if (!prompt) {
            return replyError('No prompt provided');
        }

        const image = await EventReader.generateImage({
            prompt,
            strength,
            steps,
            seed,
        });
        if (!image) {
            return replyError('Un problème est survenu...');
        }
        await interaction.editReply({
            content: interaction.options.get('seed') === null ? `Graine: ${seed}` : null,
            files: [image],
        });
    },
};
