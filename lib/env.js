import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().min(1).default("roblox_discord_verification"),
  ROBLOX_CLIENT_ID: z.string().min(1),
  ROBLOX_CLIENT_SECRET: z.string().min(1),
  ROBLOX_REDIRECT_URI: z.string().url(),
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  OBYWATEL_ROLE_ID: z.string().min(1),
  ROBLOX_API_SECRET: z.string().min(24),
  SESSION_COOKIE_SECRET: z.string().min(32)
});

let parsedEnv;

function getEnv() {
  if (!parsedEnv) {
    parsedEnv = schema.parse(process.env);
  }

  return parsedEnv;
}

export const env = new Proxy(
  {},
  {
    get(_target, property) {
      return getEnv()[property];
    }
  }
);

