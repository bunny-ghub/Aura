const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playing music, clear the queue, and disconnect the bot.'),

    async execute(interaction, player) {
        const queue = player.nodes.get(interaction.guildId);

        // Verify if queue exists
        if (!queue) {
            return interaction.reply({
                content: '❌ I am not connected to any voice channel!',
                ephemeral: true
            });
        }

        // Verify user is in the same voice channel
        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel || memberChannel.id !== interaction.guild.members.me.voice.channelId) {
            return interaction.reply({
                content: '❌ You must be in the same voice channel as the bot to stop music!',
                ephemeral: true
            });
        }

        // Delete the queue (this stops playback, clears the queue, and disconnects the bot)
        queue.delete();

        const embed = new EmbedBuilder()
            .setColor('#EF4444')
            .setDescription('⏹️ Stopped playback, cleared the queue, and disconnected from the voice channel.');

        return interaction.reply({ embeds: [embed] });
    }
};
