# Strona / Vercel API

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Register this Roblox OAuth callback URL:

```text
https://YOUR_DOMAIN/api/auth/roblox/callback
```

Required Roblox OAuth scopes:

```text
openid profile
```

Public endpoints:

- `GET /api/auth/roblox/start?discordId=...&guildId=...`
- `GET /api/auth/roblox/callback`
- `GET /api/dashboard/me`
- `GET /api/roblox/player-access?robloxUserId=...`

Roblox Studio must send:

```text
Authorization: Bearer ROBLOX_API_SECRET
```

