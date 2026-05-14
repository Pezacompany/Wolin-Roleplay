import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  OBYWATEL_ROLE_ID: z.string().min(1),
  ADMIN_ROLE_ID: z.string().optional().default(""),
  PUBLIC_VERIFY_URL: z.string().url(),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().min(1).default("roblox_discord_verification")
});

export const config = schema.parse(process.env);

