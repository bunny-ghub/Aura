const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    console.error('[ERROR] The commands/ directory does not exist yet. Create it first.');
    process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('[ERROR] Please set DISCORD_TOKEN and CLIENT_ID in your environment or .env file.');
    process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        if (process.env.GUILD_ID && process.env.GUILD_ID.trim() !== '') {
            // Guild command registration (instant update for testing)
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands for Guild: ${process.env.GUILD_ID}.`);
        } else {
            // Global command registration (updates in ~1 hour across all guilds)
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} global application (/) commands.`);
        }
    } catch (error) {
        console.error('[ERROR] Failed to deploy slash commands:', error);
    }
})();
