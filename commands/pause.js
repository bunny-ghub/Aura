const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the currently playing song.'),

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
                content: '❌ You must be in the same voice channel as the bot to pause music!',
                ephemeral: true
            });
        }

        // Check if already paused
        if (queue.node.isPaused()) {
            return interaction.reply({
                content: '⏸️ The playback is already paused!',
                ephemeral: true
            });
        }

        // Pause playback
        queue.node.setPaused(true);

        const embed = new EmbedBuilder()
            .setColor('#F59E0B')
            .setDescription('⏸️ Paused the music player. Use `/resume` to continue.');

        return interaction.reply({ embeds: [embed] });
    }
};
