# Roblox Studio Setup

## 1. Enable HTTP

In Roblox Studio:

1. Open **Game Settings**.
2. Go to **Security**.
3. Enable **Allow HTTP Requests**.

## 2. Add server script

Create this file in Studio:

```text
ServerScriptService/Verification.server.lua
```

Paste the contents from `ServerScriptService/Verification.server.lua`.

## 3. Configure values

At the top of the script, set:

```lua
local API_BASE_URL = "https://your-vercel-domain.vercel.app"
local ROBLOX_API_SECRET = "same value as strona/.env.local ROBLOX_API_SECRET"
```

## Behavior

- Not verified players are kicked.
- Verified players are allowed in.
- If the API returns `assignment.robloxTeamName`, the script assigns a Roblox `Teams` team with the same name.
- If no matching team exists, the player stays in the game and a warning is printed.

## Manual checklist

- Join without verification: player should be kicked.
- Verify through Discord `/weryfikuj`: player should get `Obywatel`.
- Join after verification: player should enter the game.
- Add role mapping through `/mapuj-role dodaj`: player should receive the matching Roblox team after joining.

