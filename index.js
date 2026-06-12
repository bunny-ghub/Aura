const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { Player } = require('discord-player');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// Create Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

// Load Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
}

// Instantiate Discord Player
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});

// Register default extractors asynchronously on startup
(async () => {
    try {
        await player.extractors.loadDefault();
        console.log('[Aura Music] Successfully loaded default extractors (Spotify, Apple Music, SoundCloud, YouTube, etc.)');
    } catch (err) {
        console.error('[Aura Music] Error loading extractors:', err);
    }
})();

// Load command modules
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[Aura Music] Warning: The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// -------------------------------------------------------------
// Discord Player Event Listeners
// -------------------------------------------------------------

player.events.on('playerStart', (queue, track) => {
    const embed = new EmbedBuilder()
        .setColor('#8B5CF6') // Premium violet theme
        .setTitle('🎶 Now Playing')
        .setDescription(`[${track.title}](${track.url})`)
        .setThumbnail(track.thumbnail || null)
        .addFields(
            { name: 'Duration', value: track.duration, inline: true },
            { name: 'Requested By', value: `${track.requestedBy}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Aura Music Bot • Enjoy unlimited music' });

    queue.metadata.channel.send({ embeds: [embed] }).catch(err => console.error('Error sending playerStart embed:', err));
});

player.events.on('audioTrackAdd', (queue, track) => {
    const embed = new EmbedBuilder()
        .setColor('#10B981') // Green for success / additions
        .setTitle('📥 Track Added to Queue')
        .setDescription(`[${track.title}](${track.url}) has been queued.`)
        .setThumbnail(track.thumbnail || null)
        .addFields(
            { name: 'Duration', value: track.duration, inline: true },
            { name: 'Position', value: `#${queue.tracks.size}`, inline: true }
        )
        .setTimestamp();

    queue.metadata.channel.send({ embeds: [embed] }).catch(err => console.error('Error sending audioTrackAdd embed:', err));
});

player.events.on('audioTracksAdd', (queue, tracks) => {
    const embed = new EmbedBuilder()
        .setColor('#10B981')
        .setTitle('📥 Playlist Added to Queue')
        .setDescription(`Successfully added **${tracks.length}** songs to the queue.`)
        .setTimestamp();

    queue.metadata.channel.send({ embeds: [embed] }).catch(err => console.error('Error sending audioTracksAdd embed:', err));
});

player.events.on('emptyQueue', (queue) => {
    const embed = new EmbedBuilder()
        .setColor('#F59E0B') // Amber/yellow warning
        .setDescription('🏁 The music queue is now empty. Add more songs using `/play`!')
        .setTimestamp();

    queue.metadata.channel.send({ embeds: [embed] }).catch(err => console.error('Error sending emptyQueue embed:', err));
});

player.events.on('emptyChannel', (queue) => {
    const embed = new EmbedBuilder()
        .setColor('#EF4444') // Red for stop / leave
        .setDescription('🔇 I left the voice channel because it became empty.')
        .setTimestamp();

    queue.metadata.channel.send({ embeds: [embed] }).catch(err => console.error('Error sending emptyChannel embed:', err));
});

player.events.on('disconnect', (queue) => {
    const embed = new EmbedBuilder()
        .setColor('#EF4444')
        .setDescription('🔌 Disconnected from the voice channel.')
        .setTimestamp();

    queue.metadata.channel.send({ embeds: [embed] }).catch(err => console.error('Error sending disconnect embed:', err));
});

player.events.on('error', (queue, error) => {
    console.error(`[Aura Music] Connection error: ${error.message}`, error);
    const embed = new EmbedBuilder()
        .setColor('#EF4444')
        .setTitle('⚠️ Connection Error')
        .setDescription(`An issue occurred with the music stream: \`${error.message}\``)
        .setTimestamp();

    queue.metadata.channel.send({ embeds: [embed] }).catch(() => {});
});

player.events.on('playerError', (queue, error, track) => {
    console.error(`[Aura Music] Playback error on track "${track.title}": ${error.message}`, error);
    const embed = new EmbedBuilder()
        .setColor('#EF4444')
        .setTitle('⚠️ Playback Error')
        .setDescription(`Could not play **${track.title}**:\n\`${error.message}\``)
        .setTimestamp();

    queue.metadata.channel.send({ embeds: [embed] }).catch(() => {});
});

// -------------------------------------------------------------
// Discord Client Event Listeners
// -------------------------------------------------------------

client.once('ready', () => {
    console.log(`[Aura Bot] Logged in as ${client.user.tag}! Ready to play music.`);
    client.user.setActivity({
        name: 'music | /play',
        type: 2 // Listening
    });
});

client.on('interactionCreate', async interaction => {
    // Handle Slash Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, player);
        } catch (error) {
            console.error(`[Aura Bot] Error executing command /${interaction.commandName}:`, error);
            const content = '❌ There was an error while executing this command!';
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content, ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ content, ephemeral: true }).catch(() => {});
            }
        }
    } 
    // Handle Slash Command Autocomplete (Search suggestions)
    else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.autocomplete(interaction, player);
        } catch (error) {
            console.error(`[Aura Bot] Autocomplete error for command /${interaction.commandName}:`, error);
        }
    }
});

// Log in the bot
const token = process.env.DISCORD_TOKEN;
if (token) {
    client.login(token);
} else {
    console.error('[Aura Bot] Error: DISCORD_TOKEN is missing. Please set it in your .env file or environment variables.');
}
