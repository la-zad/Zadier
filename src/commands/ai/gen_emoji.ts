import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';
import { read as jimp_read } from 'jimp';

import { EventReader, randomString } from './hugging_face.ts';

/*
 * @command     - gen_emoji
 * @description - Génère des emojis avec SDLXL Turbo! (temporaire, 1 journée)
 * @permission  - None
 */
export const GEN_EMOJI: Command = {
    data: new SlashCommandBuilder()
        .setName('gen_emoji')
        .setDescription('Génère des emojis avec SDLXL Turbo! (temporaire, 1 journée)')
        .addStringOption((option) => option.setName('prompt').setDescription('Le prompt').setRequired(true))
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
        const seed = (interaction.options.get('seed')?.value as number) || Math.floor(Math.random() * 12013012031030);
        const guild = interaction.guild;
        if (!guild) {
            return replyError('La commande doit être utilisée dans un serveur.');
        }
        if (!prompt) {
            return replyError('No prompt provided');
        }

        const image = await EventReader.generateImage({
            prompt,
            strength: 0.7,
            steps: 2,
            seed,
        });
        if (!image) {
            return replyError("l'image n'a pas pu être générée.");
        }
        const jimp_image = await jimp_read(image.attachment);
        const b64image = await jimp_image.quality(90).getBufferAsync('image/jpeg');
        const options = {
            name: `tmp_${randomString(10)}`,
            attachment: `data:image/jpeg;base64,${b64image.toString('base64')}`,
        };
        const new_emoji = await guild.emojis.create(options);
        await interaction.editReply({
            content: new_emoji.toString(),
        });
    },
};
