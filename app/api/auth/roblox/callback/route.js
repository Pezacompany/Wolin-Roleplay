import { NextResponse } from "next/server";
import { env } from "../../../../../lib/env.js";
import { addCitizenRole } from "../../../../../lib/discord.js";
import { getDb } from "../../../../../lib/mongodb.js";
import { getClientIp, rateLimit } from "../../../../../lib/rate-limit.js";
import { createSessionToken } from "../../../../../lib/session-token.js";

const TOKEN_URL = "https://apis.roblox.com/oauth/v1/token";
const USERINFO_URL = "https://apis.roblox.com/oauth/v1/userinfo";

export async function GET(request) {
  const limited = rateLimit(`oauth-callback:${getClientIp(request)}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return redirectWithStatus("oauth_error");
  }

  if (!code || !state) {
    return redirectWithStatus("missing_code");
  }

  const db = await getDb();
  const session = await db.collection("verificationSessions").findOneAndDelete({ state });

  if (!session) {
    return redirectWithStatus("expired");
  }

  let tokens;
  let robloxProfile;

  try {
    tokens = await exchangeCode(code, session.codeVerifier);
    robloxProfile = await fetchRobloxProfile(tokens.access_token);
  } catch (error) {
    console.error("Roblox OAuth callback failed", { error: error.message });
    return redirectWithStatus("oauth_exchange_error");
  }

  if (!robloxProfile.sub || !robloxProfile.preferred_username) {
    return redirectWithStatus("profile_error");
  }

  const robloxUserId = String(robloxProfile.sub);
  const existingRobloxLink = await db.collection("users").findOne({
    robloxUserId,
    discordId: { $ne: session.discordId }
  });

  if (existingRobloxLink) {
    return redirectWithStatus("roblox_already_linked");
  }

  const now = new Date();
  const userRecord = {
    discordId: session.discordId,
    guildId: session.guildId,
    robloxUserId,
    robloxUsername: robloxProfile.preferred_username,
    robloxUsernameLower: robloxProfile.preferred_username.toLowerCase(),
    robloxDisplayName: robloxProfile.name || robloxProfile.nickname || robloxProfile.preferred_username,
    robloxProfileUrl: robloxProfile.profile || null,
    robloxAvatarUrl: robloxProfile.picture || null,
    verified: true,
    updatedAt: now
  };

  await db.collection("users").updateOne(
    { discordId: session.discordId },
    {
      $set: userRecord,
      $setOnInsert: { createdAt: now }
    },
    { upsert: true }
  );

  try {
    await addCitizenRole(session.discordId);
  } catch (error) {
    console.error("Citizen role assignment failed", { error: error.message });
    return redirectWithStatus("discord_role_error");
  }

  const redirect = NextResponse.redirect(new URL("/dashboard", env.NEXT_PUBLIC_APP_URL));
  redirect.cookies.set(
    "verification_session",
    createSessionToken({
      discordId: session.discordId,
      robloxUserId,
      issuedAt: Date.now()
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    }
  );

  return redirect;
}

async function exchangeCode(code, codeVerifier) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.ROBLOX_REDIRECT_URI,
    client_id: env.ROBLOX_CLIENT_ID,
    client_secret: env.ROBLOX_CLIENT_SECRET,
    code_verifier: codeVerifier
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Roblox token exchange failed with ${response.status}`);
  }

  return response.json();
}

async function fetchRobloxProfile(accessToken) {
  const response = await fetch(USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Roblox userinfo failed with ${response.status}`);
  }

  return response.json();
}

function redirectWithStatus(status) {
  const url = new URL("/", env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url);
}
