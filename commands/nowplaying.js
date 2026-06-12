const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Display information about the currently playing song.'),

    async execute(interaction, player) {
        const queue = player.nodes.get(interaction.guildId);

        // Verify if queue exists and is playing
        if (!queue || !queue.currentTrack) {
            return interaction.reply({
                content: '❌ There is no music playing right now!',
                ephemeral: true
            });
        }

        const track = queue.currentTrack;
        
        // Generate visual progress bar (e.g. ▬🔘▬▬▬▬▬▬▬▬▬▬ 0:45 / 3:30)
        const progress = queue.node.createProgressBar({
            timecodes: true,
            length: 15,
            indicator: '🔘',
            line: '▬'
        }) || '0:00 / 0:00';

        const embed = new EmbedBuilder()
            .setColor('#8B5CF6')
            .setTitle('🎶 Now Playing')
            .setDescription(`[${track.title}](${track.url})`)
            .setThumbnail(track.thumbnail || null)
            .addFields(
                { name: 'Uploader / Artist', value: track.author, inline: true },
                { name: 'Requested By', value: `${track.requestedBy}`, inline: true },
                { name: 'Progress', value: progress, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Aura Music Bot' });

        return interaction.reply({ embeds: [embed] });
    }
};
