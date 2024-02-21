import type { Command } from '@commands';
import { DURATION_TMP_EMOJI } from '@constants';
import { sleep } from 'bun';
import { SlashCommandBuilder } from 'discord.js';
import Jimp from 'jimp';

import { DEFAULT_VALUE, EventReader } from './hugging_face.ts';

function shrink_image(image: Jimp): Jimp {
    if (image.getWidth() > 256 && image.getHeight() > 256) {
        const scale = 256 / (image.getWidth() > image.getHeight() ? image.getWidth() : image.getHeight());
        image = image.scale(scale);
    }
    return image.quality(90);
}

/*
 * @command     - gen_emoji
 * @description - Génère des emojis avec SDLXL Turbo! (temporaire, 1 journée)
 * @permission  - None
 */
export const GEN_EMOJI: Command = {
    data: new SlashCommandBuilder()
        .setName('make_emoji')
        .setDescription(`Génère des emojis avec SDLXL Turbo! (temporaire, ${DURATION_TMP_EMOJI.toString()})`)
        .addStringOption((option) =>
            option.setName('ai_prompt').setDescription('Prompt de génération par IA').setRequired(false),
        )
        .addAttachmentOption((option) =>
            option.setName('image').setDescription('Image à mettre en emoji').setRequired(false),
        )
        .addNumberOption((option) =>
            option.setName('ai_seed').setDescription('La graine (aléatoire par défaut)').setRequired(false),
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const img_attach = interaction.options.get('image')?.attachment;
        let image = null;
        const guild = interaction.guild;
        if (!guild) throw 'La commande doit être utilisée dans un serveur.';

        if (img_attach) {
            const resp = await fetch(img_attach.url);
            if (!resp) throw "Un problème est survenu lors de la récupération de l'image...";

            image = Buffer.from(await resp.arrayBuffer());
        } else {
            const hf_options = {
                ...DEFAULT_VALUE,
                prompt: interaction.options.get('ai_prompt', true).value as string,
                seed: (interaction.options.get('seed')?.value as number) ?? DEFAULT_VALUE.seed,
            };
            const img_generated = await EventReader.generateImage(hf_options);
            if (!img_generated) throw "l'image n'a pas pu être générée.";

            image = img_generated.attachment;
        }
        if (!image) throw 'Un problème est survenu...';
        const jimp_image = await Jimp.read(image);
        const shrunk_image = shrink_image(jimp_image);
        const buffer_image = await shrunk_image.getBufferAsync('image/jpeg');
        const emoji_options = {
            name: `tmp_${Date.now()}`,
            attachment: `data:image/jpeg;base64,${buffer_image.toString('base64')}`,
        };
        const new_emoji = await guild.emojis.create(emoji_options);
        setTimeout(() => void new_emoji.delete(), DURATION_TMP_EMOJI.milliseconds);
        await sleep(1000);
        await interaction.editReply({
            content: new_emoji.toString(),
        });
    },
};
