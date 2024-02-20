import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { DEFAULT_MIXTRAL_VALUES, execute as mixtral_execute } from './mixtral_api';
import { check_authentication } from './replicate';

export const ASK_MIXTRAL: Command = {
    data: new SlashCommandBuilder()
        .setName('ask_mixtral')
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

        if (!check_authentication()) {
            throw "Le token de replicate n'a pas été défini!";
        }

        const input = {
            prompt: interaction.options.get('prompt')?.value as string,
            max_new_tokens:
                (interaction.options.get('max_new_tokens')?.value as number) ?? DEFAULT_MIXTRAL_VALUES.max_new_tokens,
            temperature:
                (interaction.options.get('temperature')?.value as number) ?? DEFAULT_MIXTRAL_VALUES.temperature,
            top_p: (interaction.options.get('top_p')?.value as number) ?? DEFAULT_MIXTRAL_VALUES.top_p,
            top_k: (interaction.options.get('top_k')?.value as number) ?? DEFAULT_MIXTRAL_VALUES.top_k,
            presence_penalty:
                (interaction.options.get('presence_penalty')?.value as number) ??
                DEFAULT_MIXTRAL_VALUES.presence_penalty,
            frequency_penalty:
                (interaction.options.get('frequency_penalty')?.value as number) ??
                DEFAULT_MIXTRAL_VALUES.frequency_penalty,
            prompt_template: DEFAULT_MIXTRAL_VALUES.prompt_template,
        };
        await mixtral_execute(interaction, input);
    },
};
