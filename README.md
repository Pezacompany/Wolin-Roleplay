# Discord Roblox Verification Monorepo

Production-ready starter for a Discord bot, Vercel verification site/API, MongoDB persistence, and Roblox Studio server scripts.

## Structure

- `bot/` - Discord bot in Node.js using `discord.js`.
- `strona/` - Vercel/Next.js app for Roblox OAuth, dashboard, and Roblox API.
- `robloxstudio/` - Lua scripts and setup notes for Roblox Studio.

## Quick Start

1. Copy `bot/.env.example` to `bot/.env` and fill Discord/MongoDB values.
2. Copy `strona/.env.example` to `strona/.env.local` and fill Vercel/OAuth/Discord values.
3. Register Roblox OAuth redirect URL as:
   `https://YOUR_DOMAIN/api/auth/roblox/callback`
4. Deploy slash commands:
   `cd bot && npm install && npm run deploy-commands`
5. Start the bot locally:
   `npm run dev`
6. Deploy `strona/` to Vercel.
7. Add `robloxstudio/ServerScriptService/Verification.server.lua` to Roblox Studio and enable HTTP requests.

