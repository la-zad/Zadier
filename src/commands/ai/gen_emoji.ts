import type { Command } from '@commands';
import { DURATION_TMP_EMOJI } from '@constants';
import { SlashCommandBuilder } from 'discord.js';
import Jimp from 'jimp';

import { DEFAULT_VALUE, EventReader } from './hugging_face.ts';

/*
 * @command     - gen_emoji
 * @description - Génère des emojis avec SDLXL Turbo! (temporaire, 1 journée)
 * @permission  - None
 */
export const GEN_EMOJI: Command = {
    data: new SlashCommandBuilder()
        .setName('gen_emoji')
        .setDescription(`Génère des emojis avec SDLXL Turbo! (temporaire, ${DURATION_TMP_EMOJI.toString()})`)
        .addStringOption((option) => option.setName('prompt').setDescription('Le prompt').setRequired(true))
        .addNumberOption((option) =>
            option.setName('seed').setDescription('La graine (aléatoire par défaut)').setRequired(false),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const hf_options = {
            ...DEFAULT_VALUE,
            prompt: interaction.options.get('prompt', true).value as string,
            seed: (interaction.options.get('seed')?.value as number) ?? DEFAULT_VALUE.seed,
        };
        const guild = interaction.guild;
        if (!guild) {
            throw 'La commande doit être utilisée dans un serveur.';
        }
        const image = await EventReader.generateImage(hf_options);
        if (!image) {
            throw "l'image n'a pas pu être générée.";
        }
        const jimp_image = await Jimp.read(image.attachment);
        const b64image = await jimp_image.quality(90).getBufferAsync('image/jpeg');
        const now = Date.now();
        const emoji_options = {
            name: `tmp_${now}`,
            attachment: `data:image/jpeg;base64,${b64image.toString('base64')}`,
        };
        const new_emoji = await guild.emojis.create(emoji_options);
        setTimeout(() => void new_emoji.delete(), DURATION_TMP_EMOJI.milliseconds);
        await interaction.editReply({
            content: new_emoji.toString(),
        });
    },
};
