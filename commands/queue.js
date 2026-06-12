const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue.'),

    async execute(interaction, player) {
        const queue = player.nodes.get(interaction.guildId);

        // Verify if queue exists and is playing
        if (!queue || !queue.currentTrack) {
            return interaction.reply({
                content: '❌ There is no music playing right now!',
                ephemeral: true
            });
        }

        const currentTrack = queue.currentTrack;
        const tracksArray = queue.tracks.toArray();

        // Build queue listing text
        let queueString = '';
        if (tracksArray.length === 0) {
            queueString = 'No upcoming tracks in the queue. Add more using `/play`!';
        } else {
            // Display maximum of 10 tracks to prevent hitting Discord's character limit
            queueString = tracksArray
                .slice(0, 10)
                .map((track, idx) => `**${idx + 1}.** [${track.title}](${track.url}) - \`${track.duration}\` *(Requested by: ${track.requestedBy.username})*`)
                .join('\n');
        }

        const embed = new EmbedBuilder()
            .setColor('#8B5CF6')
            .setTitle(`🎶 Music Queue for ${interaction.guild.name}`)
            .setDescription(`**Now Playing:**\n[${currentTrack.title}](${currentTrack.url}) - \`${currentTrack.duration}\` *(Requested by: ${currentTrack.requestedBy})*\n\n**Up Next:**\n${queueString}`)
            .setThumbnail(currentTrack.thumbnail || null)
            .setTimestamp();

        // Add footer if queue has more than 10 tracks
        if (tracksArray.length > 10) {
            embed.setFooter({
                text: `And ${tracksArray.length - 10} more song(s) in the queue • Total duration: ${queue.durationFormatted}`
            });
        } else {
            embed.setFooter({
                text: `Total queue duration: ${queue.durationFormatted}`
            });
        }

        return interaction.reply({ embeds: [embed] });
    }
};
