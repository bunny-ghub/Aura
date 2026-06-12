const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume playing the paused song.'),

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
                content: '❌ You must be in the same voice channel as the bot to resume music!',
                ephemeral: true
            });
        }

        // Check if not paused
        if (!queue.node.isPaused()) {
            return interaction.reply({
                content: '▶️ The playback is already running!',
                ephemeral: true
            });
        }

        // Resume playback
        queue.node.setPaused(false);

        const embed = new EmbedBuilder()
            .setColor('#8B5CF6')
            .setDescription('▶️ Resumed the music player.');

        return interaction.reply({ embeds: [embed] });
    }
};
