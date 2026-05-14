import { NextResponse } from "next/server";
import { env } from "../../../../lib/env.js";
import { getGuildMember } from "../../../../lib/discord.js";
import { getDb } from "../../../../lib/mongodb.js";
import { getClientIp, rateLimit } from "../../../../lib/rate-limit.js";

export async function GET(request) {
  const limited = rateLimit(`roblox-access:${getClientIp(request)}`, 120, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${env.ROBLOX_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const robloxUserId = url.searchParams.get("robloxUserId");

  if (!robloxUserId || !/^\d+$/.test(robloxUserId)) {
    return NextResponse.json({ error: "Invalid robloxUserId" }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({
    robloxUserId,
    verified: true
  });

  if (!user) {
    return NextResponse.json({
      verified: false,
      reason: "not_verified"
    });
  }

  const [member, mappings] = await Promise.all([
    getGuildMember(user.discordId),
    db
      .collection("roleMappings")
      .find({ guildId: env.DISCORD_GUILD_ID, enabled: true })
      .sort({ priority: -1 })
      .toArray()
  ]);

  const memberRoles = new Set(member.roles || []);
  const matches = mappings.filter((mapping) => memberRoles.has(mapping.discordRoleId));
  const assignment = matches[0] || null;

  await db.collection("users").updateOne(
    { discordId: user.discordId },
    { $set: { lastAccessCheckAt: new Date() } }
  );

  return NextResponse.json({
    verified: true,
    discordId: user.discordId,
    robloxUserId: user.robloxUserId,
    robloxUsername: user.robloxUsername,
    assignment: assignment
      ? {
          discordRoleId: assignment.discordRoleId,
          discordRoleName: assignment.discordRoleName,
          robloxTeamName: assignment.robloxTeamName,
          priority: assignment.priority
        }
      : null,
    matches: matches.map((mapping) => ({
      discordRoleId: mapping.discordRoleId,
      robloxTeamName: mapping.robloxTeamName,
      priority: mapping.priority
    }))
  });
}

