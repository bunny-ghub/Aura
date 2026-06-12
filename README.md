# Aura Music Bot 🎵

A premium, high-performance Discord music bot inspired by Flavi Bot. Built with **discord.js v14** and **discord-player v6**, featuring real-time search autocomplete suggestions, comprehensive queue controls, custom audio loops, and zero-config deployment setup for Railway!

## Features

- ⚡ **Real-time Autocomplete:** Shows song search suggestions as you type `/play`.
- 🎶 **Multi-platform support:** Resolves Spotify, SoundCloud, Apple Music, YouTube, and direct audio stream URLs.
- 🎛️ **Comprehensive Controls:** Play, pause, resume, skip, stop, shuffle, and fine-tuned volume slider (`/volume`).
- 🔄 **Advanced Loops:** Loop single track, loop the entire queue, or enable **Autoplay** to recommend and play similar tracks when the queue ends.
- 🎨 **Sleek Embed Aesthetics:** Premium Discord Embeds color-themed in violet (`#8B5CF6`) for actions and states.
- 🚀 **Railway Ready:** Pre-configured with Nixpacks (`nixpacks.toml`) to automatically install FFmpeg system-wide.

---

## 🛠️ Discord Portal Configuration

Before running or deploying the bot, you must set it up in the **[Discord Developer Portal](https://discord.com/developers/applications)**:

1. **Create an Application:** Click **New Application** at the top right and name your bot.
2. **Retrieve Application Details:** 
   - Go to **General Information** and copy your **Application ID** (this is your `CLIENT_ID`).
3. **Set Up Bot:**
   - Go to the **Bot** page on the sidebar.
   - Click **Add Bot** or reset/copy your **Token** (this is your `DISCORD_TOKEN`).
   - Under **Privileged Gateway Intents**, enable **Guild Members Intent** and **Message Content Intent** (if required by other commands; our core voice connections require standard voice states).
4. **Invite the Bot:**
   - Go to **OAuth2** > **URL Generator** on the sidebar.
   - Select scope: `bot` and `applications.commands`.
   - Select bot permissions:
     - General: `Read Messages/View Channels`
     - Text: `Send Messages`, `Embed Links`, `Use External Emojis`
     - Voice: `Connect`, `Speak`, `Use Voice Activity`
   - Copy the generated URL at the bottom and open it in a browser to invite the bot to your Discord server.

---

## 💻 Local Quickstart

### 1. Prerequisites
- **Node.js:** v16.9.0 or higher.
- **FFmpeg:** Installed on your computer and added to your system's `PATH`.

### 2. Installation
Clone/download the repository, open a terminal in the folder, and run:
```bash
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to a new file named `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your tokens:
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_testing_server_id_here
```
*(Setting `GUILD_ID` registers commands immediately in your testing server. Omit it to deploy commands globally, which takes up to an hour).*

### 4. Register Slash Commands
Run the command registration script:
```bash
npm run deploy
```

### 5. Start the Bot
```bash
npm start
```

---

## 🚀 Railway Deployment Guide (Free Hosting)

This codebase is pre-configured to build and run out-of-the-box on **Railway**:

1. **Push to GitHub:** Initialize a git repository and push your project to GitHub. (Do NOT push your `.env` file! It is ignored by default).
2. **Deploy on Railway:**
   - Log into **[Railway.app](https://railway.app)**.
   - Click **New Project** > **Deploy from GitHub repo** and select your repository.
3. **Add Environment Variables:**
   - In your Railway project dashboard, go to the **Variables** tab.
   - Add the following variables:
     - `DISCORD_TOKEN` = `(your Discord bot token)`
     - `CLIENT_ID` = `(your Discord application client ID)`
4. **FFmpeg Installation (Automatic):**
   - The bot requires `ffmpeg` for transcoding audio. The repository contains a `nixpacks.toml` file. Railway's build tool (Nixpacks) detects this file and automatically installs FFmpeg alongside Node.js during the build.
5. **Start:**
   - Railway will build the app and trigger the start script `npm start`. Your bot will connect to Discord and go online!
