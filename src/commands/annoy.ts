import type { Command } from '@commands';
import { ChannelType, SlashCommandBuilder } from 'discord.js';

const ANNOYABLE_CHANNELS_TYPES = [ChannelType.GuildText] as const;
const DONE_GIFs = [
    'https://tenor.com/view/missionaccomplished-emperorsnewgroove-kronk-gif-4514330',
    'https://tenor.com/view/batman-approves-approve-thumbs-up-well-done-okay-gif-5025845',
    'https://tenor.com/view/evil-laugh-bye-gif-9017647',
    'https://tenor.com/view/mission-complete-spongebob-done-gif-11766934',
    'https://tenor.com/view/harry-potter-marauders-map-mischief-managed-gif-16088629',
];

/**
 * @command     - annoy
 * @description - Ghostping someone in any channel
 * @permission  - None
 */
export const ANNOY: Command = {
    data: new SlashCommandBuilder()
        .setName('annoy')
        .setDescription('Ghostping someone')
        .addUserOption((option) =>
            option.setName('user').setDescription('The User you want to piss off').setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel you want the ghostping to take place (default: here)')
                .addChannelTypes(...ANNOYABLE_CHANNELS_TYPES)
                .setRequired(false),
        ),
    async execute(interaction) {
        const ping = interaction.options.getUser('user', true);
        const channelMention =
            interaction.options.getChannel('channel', false, ANNOYABLE_CHANNELS_TYPES) ?? interaction.channel;

        if (!channelMention) throw 'How did we get here ?';

        const ghostPing = await channelMention.send(`${ping.toString()}`);
        await ghostPing.delete();

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const choosenGif = DONE_GIFs.at(Math.floor(Math.random() * DONE_GIFs.length))!;

        await interaction.reply({
            content: choosenGif,
            ephemeral: true,
        });
    },
};
