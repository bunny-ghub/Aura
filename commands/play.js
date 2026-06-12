const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist in your voice channel.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The name of the song, artist, or URL to play.')
                .setAutocomplete(true)
                .setRequired(true)
        ),
    
    // Autocomplete handler for song search suggestions
    async autocomplete(interaction, player) {
        const query = interaction.options.getString('query');
        if (!query || !query.trim()) return interaction.respond([]);

        // Fast response for URLs to bypass external search API calls
        if (query.startsWith('http://') || query.startsWith('https://')) {
            return interaction.respond([{ name: query.slice(0, 100), value: query }]);
        }

        try {
            // Perform track search using discord-player
            const searchResults = await player.search(query, {
                requestedBy: interaction.user
            });

            if (!searchResults || !searchResults.tracks || searchResults.tracks.length === 0) {
                return interaction.respond([]);
            }

            // Map search results to choices (max 25 options allowed by Discord API)
            const choices = searchResults.tracks.slice(0, 25).map(track => {
                let name = `${track.title} - ${track.author}`;
                if (name.length > 100) {
                    name = name.slice(0, 97) + '...';
                }
                return {
                    name: name,
                    value: track.url // discord-player receives URL on selection
                };
            });

            await interaction.respond(choices);
        } catch (error) {
            console.error('[Aura Music] Autocomplete search error:', error);
            await interaction.respond([]).catch(() => {});
        }
    },

    // Execution handler for the slash command
    async execute(interaction, player) {
        const query = interaction.options.getString('query');
        const memberChannel = interaction.member.voice.channel;

        // Verify if user is in a voice channel
        if (!memberChannel) {
            return interaction.reply({
                content: '❌ You must be in a voice channel to play music!',
                ephemeral: true
            });
        }

        // Verify if bot is already playing in another channel
        const botGuildMember = interaction.guild.members.me;
        if (botGuildMember.voice.channelId && botGuildMember.voice.channelId !== memberChannel.id) {
            return interaction.reply({
                content: `❌ I am already playing music in <#${botGuildMember.voice.channelId}>! Join my channel or wait.`,
                ephemeral: true
            });
        }

        // Defer response since searching and joining can exceed 3 seconds
        await interaction.deferReply();

        try {
            // Search for the track or playlist
            const searchResults = await player.search(query, {
                requestedBy: interaction.user
            });

            if (!searchResults || !searchResults.tracks.length) {
                return interaction.editReply(`❌ No search results found for: \`${query}\``);
            }

            // Play the audio track / playlist
            const { track } = await player.play(memberChannel, searchResults, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.client,
                        requestedBy: interaction.user
                    },
                    // Leave channel when empty or playback finishes
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 300000, // 5 minutes
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 300000,
                    volume: 75, // Default volume (out of 100)
                    bufferingTimeout: 15000 // Timeout if buffering takes too long
                }
            });

            // Format simple confirmation embed
            const embed = new EmbedBuilder()
                .setColor('#8B5CF6')
                .setDescription(`🔍 Added **[${track.title}](${track.url})** to the queue.`);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('[Aura Music] Play command error:', error);
            await interaction.editReply({
                content: `❌ Could not load the track: \`${error.message}\`. Please try again.`
            });
        }
    }
};
