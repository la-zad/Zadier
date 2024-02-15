import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { EventReader } from './hugging_face.ts';

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
        const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

        await interaction.deferReply();
        const replyError = async (msgError: string): Promise<void> => {
            await interaction.editReply(msgError);
        };

        // Discord slash command parameters
        const prompt = interaction.options.get('prompt')?.value as string;
        const seed = (interaction.options.get('seed')?.value as number) || Math.floor(Math.random() * 12013012031030);
        const strength = (interaction.options.get('strength')?.value as number) || 0.7;
        const steps = (interaction.options.get('steps')?.value as number) || 2;
        if (!prompt) {
            return replyError('No prompt provided');
        }

        let session_hash = '';
        for (let i = 0; i < 10; i++) {
            session_hash += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        const response = await fetch(
            `https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/queue/join?__theme=light&fn_index=1&session_hash=${session_hash}`,
            {
                headers: {
                    Accept: 'text/event-stream',
                },
                method: 'GET',
            },
        );
        if (!response.body) {
            return replyError('fetch has no body');
        }
        const reader = response.body.getReader() as ReadableStreamDefaultReader<Uint8Array>;

        const event_reader = new EventReader(reader, {
            session_hash,
            prompt,
            strength,
            steps,
            seed,
        });

        await event_reader.process();

        const image = event_reader.image();
        if (image) {
            await interaction.editReply({
                content: interaction.options.get('seed') === null ? `Graine: ${seed}` : null,
                files: [image],
            });
        } else {
            await interaction.editReply('Un problème est survenu...');
        }
    },
};
