import { cookies } from "next/headers";
import { getDb } from "../../lib/mongodb.js";
import { verifySessionToken } from "../../lib/session-token.js";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("verification_session")?.value;
  const session = token ? verifySessionToken(token) : null;
  const db = await getDb();

  const user = session
    ? await db.collection("users").findOne({ discordId: session.discordId, verified: true })
    : null;

  const mappings = user
    ? await db
        .collection("roleMappings")
        .find({ guildId: user.guildId, enabled: true })
        .sort({ priority: -1 })
        .toArray()
    : [];

  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand">Dashboard gracza</div>
        <a className="button" href="/">Start</a>
      </div>

      {!user ? (
        <section className="panel stack">
          <h1>Brak aktywnej sesji</h1>
          <p className="muted">
            Wróć na Discord i użyj komendy <strong>/weryfikuj</strong>, aby połączyć konto.
          </p>
        </section>
      ) : (
        <section className="panel stack">
          <h1>Konto połączone</h1>
          <div className="grid">
            <Info label="Discord ID" value={user.discordId} />
            <Info label="Roblox" value={`${user.robloxUsername} (${user.robloxUserId})`} />
            <Info label="Status" value={user.verified ? "Zweryfikowany" : "Niezweryfikowany"} />
            <Info
              label="Ostatnia synchronizacja"
              value={user.updatedAt ? new Date(user.updatedAt).toLocaleString("pl-PL") : "Brak"}
            />
          </div>

          <div>
            <h2>Aktywne mapowania serwera</h2>
            {mappings.length === 0 ? (
              <p className="muted">Administracja nie dodała jeszcze mapowań ról.</p>
            ) : (
              <div className="stack">
                {mappings.map((mapping) => (
                  <div className="metric" key={mapping.discordRoleId}>
                    <div className="label">{mapping.discordRoleName}</div>
                    <div className="value">{mapping.robloxTeamName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="metric">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

