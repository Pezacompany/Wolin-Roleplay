import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb.js";
import { verifySessionToken } from "../../../../lib/session-token.js";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("verification_session")?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { discordId: session.discordId, verified: true },
    {
      projection: {
        _id: 0,
        discordId: 1,
        robloxUserId: 1,
        robloxUsername: 1,
        robloxDisplayName: 1,
        verified: 1,
        updatedAt: 1
      }
    }
  );

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 404 });
  }

  return NextResponse.json({ authenticated: true, user });
}

