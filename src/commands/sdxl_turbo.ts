import type { Command } from '@commands';
import { SlashCommandBuilder, AttachmentBuilder, BufferResolvable } from 'discord.js';


export interface HuggingFacePayload {
    data: [any, string, number, number, number]
    event_data: any
    fn_index: number
    trigger_id: number
    session_hash: string
    event_id: string
}
  

/*
 * @command     - sdxl_turbo
 * @description - Génère des images avec SDLXL Turbo!
 * @permission  - None
 */
export const SDXL_TURBO: Command = {
    data: new SlashCommandBuilder().setName('sdxl_turbo').setDescription('Génère des images avec SDLXL Turbo!'),
    async execute(interaction) {
        const reply = interaction.deferReply();
        await reply;
        await interaction.editReply("En cours de developpement");

    },
};
