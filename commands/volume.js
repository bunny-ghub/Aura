const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Get or set the bot volume.')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(100)
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

        const level = interaction.options.getInteger('level');

        // Getter: if no value provided, display current volume
        if (level === null) {
            return interaction.reply({
                content: `🔊 The current volume is at **${queue.node.volume}%**.`,
                ephemeral: true
            });
        }

        // Verify user is in the same voice channel
        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel || memberChannel.id !== interaction.guild.members.me.voice.channelId) {
            return interaction.reply({
                content: '❌ You must be in the same voice channel as the bot to change the volume!',
                ephemeral: true
            });
        }

        // Setter: set volume level
        queue.node.setVolume(level);

        const embed = new EmbedBuilder()
            .setColor('#8B5CF6')
            .setDescription(`🔊 Volume adjusted to **${level}%**.`);

        return interaction.reply({ embeds: [embed] });
    }
};
