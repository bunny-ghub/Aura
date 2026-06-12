const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set repeat mode for the current session.')
        .addIntegerOption(option =>
            option.setName('mode')
                .setDescription('The loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off (No loop)', value: QueueRepeatMode.OFF },
                    { name: 'Track (Repeat current song)', value: QueueRepeatMode.TRACK },
                    { name: 'Queue (Repeat whole queue)', value: QueueRepeatMode.QUEUE },
                    { name: 'Autoplay (Play similar songs)', value: QueueRepeatMode.AUTOPLAY }
                )
        ),

    async execute(interaction, player) {
        const queue = player.nodes.get(interaction.guildId);

        // Verify if queue exists and is playing
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                content: '❌ There is no music playing right now!',
                ephemeral: true
            });
        }

        // Verify user is in the same voice channel
        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel || memberChannel.id !== interaction.guild.members.me.voice.channelId) {
            return interaction.reply({
                content: '❌ You must be in the same voice channel as the bot to change loop mode!',
                ephemeral: true
            });
        }

        const mode = interaction.options.getInteger('mode');
        
        // Set repeat mode
        queue.setRepeatMode(mode);

        // Map mode to human-readable string
        let modeName = 'Off';
        let icon = '➡️';
        if (mode === QueueRepeatMode.TRACK) {
            modeName = 'Track (Repeat Current Song)';
            icon = '🔂';
        } else if (mode === QueueRepeatMode.QUEUE) {
            modeName = 'Queue (Repeat Entire Queue)';
            icon = '🔁';
        } else if (mode === QueueRepeatMode.AUTOPLAY) {
            modeName = 'Autoplay (Recommend Similar Songs)';
            icon = '📻';
        }

        const embed = new EmbedBuilder()
            .setColor('#8B5CF6')
            .setDescription(`${icon} Loop mode set to **${modeName}**.`);

        return interaction.reply({ embeds: [embed] });
    }
};
