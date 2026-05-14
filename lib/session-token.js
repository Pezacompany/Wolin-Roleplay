import crypto from "node:crypto";
import { env } from "./env.js";

export function createSessionToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifySessionToken(token) {
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.discordId || !payload.robloxUserId) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function sign(value) {
  return crypto
    .createHmac("sha256", env.SESSION_COOKIE_SECRET)
    .update(value)
    .digest("base64url");
}

