import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { replicate } from './replicate';

/*
const input = {
    prompt: "Write a bedtime story about neural networks I can read to my toddler",
    max_new_tokens: 1024,
    temperature: 0.6,
    top_p: 0.9,
    top_k: 50,
    presence_penalty: 0,
    frequency_penalty: 0
    prompt_template: "<s>[INST] {prompt} [/INST] ",
};
*/

export const MIXTRAL: Command = {
    data: new SlashCommandBuilder()
        .setName('mixtral')
        .setDescription('Génère du texte avec Mixtral 8x7b!')
        .addStringOption((option) => option.setName('prompt').setDescription('Le prompt').setRequired(true))
        .addNumberOption((option) =>
            option
                .setName('max_new_tokens')
                .setDescription('Le nombre maximum de jetons que le modèle doit générer en sortie (1024 par défaut)')
                .setMinValue(0)
                .setMaxValue(10000)
                .setRequired(false),
        )
        .addNumberOption((option) =>
            option
                .setName('temperature')
                .setDescription('La valeur utilisée pour moduler les probabilités du prochain token (0.6 par défaut)')
                .setMinValue(0)
                .setMaxValue(2)
                .setRequired(false),
        )
        .addNumberOption((option) =>
            option
                .setName('top_p')
                .setDescription('Un seuil de probabilité pour générer la sortie (0.9 par défaut)')
                .setMinValue(0)
                .setMaxValue(2)
                .setRequired(false),
        )
        .addNumberOption((option) =>
            option
                .setName('top_k')
                .setDescription("Le nombre de jetons ayant de l'importance (50 par défaut)")
                .setMinValue(0)
                .setMaxValue(1000)
                .setRequired(false),
        )
        .addNumberOption((option) =>
            option
                .setName('presence_penalty')
                .setDescription('Pénalité de présence (0 par défaut)')
                .setMinValue(-2)
                .setMaxValue(2)
                .setRequired(false),
        )
        .addNumberOption((option) =>
            option
                .setName('frequency_penalty')
                .setDescription('Pénalité de fréquence (0 par défaut)')
                .setMinValue(-2)
                .setMaxValue(2)
                .setRequired(false),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const replyError = async (msgError: string): Promise<void> => {
            await interaction.editReply(msgError);
        };

        if (!replicate.auth) {
            return replyError("Le token de replicate n'a pas été défini!");
        }

        const input = {
            prompt: interaction.options.get('prompt')?.value as string,
            max_new_tokens: (interaction.options.get('max_new_tokens')?.value as number) || 1024,
            temperature: (interaction.options.get('temperature')?.value as number) || 0.6,
            top_p: (interaction.options.get('top_p')?.value as number) || 0.9,
            top_k: (interaction.options.get('top_k')?.value as number) || 50,
            presence_penalty: (interaction.options.get('presence_penalty')?.value as number) || 0,
            frequency_penalty: (interaction.options.get('frequency_penalty')?.value as number) || 0,
            prompt_template: '<s>[INST] {prompt} [/INST] ',
        };
        let msg = '';
        let last_time = Date.now();
        for await (const event of replicate.stream('mistralai/mixtral-8x7b-instruct-v0.1', { input })) {
            if (event.event === 'output') {
                msg += event.data;
            }
            if (Date.now() - last_time > 500 && msg !== '') {
                await interaction.editReply(msg);
                last_time = Date.now();
            }
        }
        await interaction.editReply(msg);
    },
};
