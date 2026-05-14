import { env } from "./env.js";

const DISCORD_API = "https://discord.com/api/v10";

export async function addCitizenRole(discordId) {
  const response = await fetch(
    `${DISCORD_API}/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}/roles/${env.OBYWATEL_ROLE_ID}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Discord role assignment failed with ${response.status}`);
  }
}

export async function getGuildMember(discordId) {
  const response = await fetch(`${DISCORD_API}/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}`, {
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Discord member fetch failed with ${response.status}`);
  }

  return response.json();
}

