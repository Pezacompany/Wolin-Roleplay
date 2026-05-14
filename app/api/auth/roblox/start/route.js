import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "../../../../../lib/env.js";
import { getDb } from "../../../../../lib/mongodb.js";
import { getClientIp, rateLimit } from "../../../../../lib/rate-limit.js";

const AUTHORIZE_URL = "https://apis.roblox.com/oauth/v1/authorize";

export async function GET(request) {
  const limited = rateLimit(`oauth-start:${getClientIp(request)}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const discordId = url.searchParams.get("discordId");
  const guildId = url.searchParams.get("guildId");

  if (!discordId || !/^\d{16,22}$/.test(discordId)) {
    return NextResponse.json({ error: "Invalid discordId" }, { status: 400 });
  }

  if (guildId && guildId !== env.DISCORD_GUILD_ID) {
    return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const nonce = crypto.randomBytes(32).toString("base64url");
  const codeVerifier = crypto.randomBytes(48).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const db = await getDb();
  await db.collection("verificationSessions").insertOne({
    state,
    nonce,
    codeVerifier,
    discordId,
    guildId: env.DISCORD_GUILD_ID,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  const authorization = new URL(AUTHORIZE_URL);
  authorization.searchParams.set("client_id", env.ROBLOX_CLIENT_ID);
  authorization.searchParams.set("redirect_uri", env.ROBLOX_REDIRECT_URI);
  authorization.searchParams.set("scope", "openid profile");
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("nonce", nonce);
  authorization.searchParams.set("code_challenge", codeChallenge);
  authorization.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authorization);
}

