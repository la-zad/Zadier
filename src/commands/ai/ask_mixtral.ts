import type { Command } from '@commands';
import { check_authentication } from '@utils/replicate';
import { DEFAULT_MIXTRAL_VALUES, execute as mixtral_execute } from '@utils/replicate/mixtral_api';
import { SlashCommandBuilder } from 'discord.js';

export const ASK_MIXTRAL: Command = {
    data: new SlashCommandBuilder()
        .setName('ask_mixtral')
        .setDescription('Génère du texte avec Mixtral 8x7b!')
        .addStringOption((option) => option.setName('prompt').setDescription('Le prompt').setRequired(true))
        .addIntegerOption((option) =>
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
        .addIntegerOption((option) =>
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
            prompt: interaction.options.getString('prompt', true),
            max_new_tokens: interaction.options.getInteger('max_new_tokens') ?? DEFAULT_MIXTRAL_VALUES.max_new_tokens,
            temperature: interaction.options.getNumber('temperature') ?? DEFAULT_MIXTRAL_VALUES.temperature,
            top_p: interaction.options.getNumber('top_p') ?? DEFAULT_MIXTRAL_VALUES.top_p,
            top_k: interaction.options.getInteger('top_k') ?? DEFAULT_MIXTRAL_VALUES.top_k,
            presence_penalty:
                interaction.options.getNumber('presence_penalty') ?? DEFAULT_MIXTRAL_VALUES.presence_penalty,
            frequency_penalty:
                interaction.options.getNumber('frequency_penalty') ?? DEFAULT_MIXTRAL_VALUES.frequency_penalty,
            prompt_template: DEFAULT_MIXTRAL_VALUES.prompt_template,
        };
        return mixtral_execute(interaction, input);
    },
};
