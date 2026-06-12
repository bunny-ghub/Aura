const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the upcoming tracks in the queue.'),

    async execute(interaction, player) {
        const queue = player.nodes.get(interaction.guildId);

        // Verify if queue exists and has enough tracks
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                content: '❌ There is no music playing right now!',
                ephemeral: true
            });
        }

        if (queue.tracks.size < 2) {
            return interaction.reply({
                content: '❌ You need at least 2 tracks in the queue to shuffle!',
                ephemeral: true
            });
        }

        // Verify user is in the same voice channel
        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel || memberChannel.id !== interaction.guild.members.me.voice.channelId) {
            return interaction.reply({
                content: '❌ You must be in the same voice channel as the bot to shuffle!',
                ephemeral: true
            });
        }

        // Shuffle the tracks
        queue.tracks.shuffle();

        const embed = new EmbedBuilder()
            .setColor('#8B5CF6')
            .setDescription(`🔀 Shuffled **${queue.tracks.size}** tracks in the queue!`);

        return interaction.reply({ embeds: [embed] });
    }
};
