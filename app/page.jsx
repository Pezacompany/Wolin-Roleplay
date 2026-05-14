export default function HomePage() {
  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand">Roblox Discord Verification</div>
        <a className="button" href="/dashboard">Dashboard</a>
      </div>
      <section className="panel stack">
        <h1>Weryfikacja konta</h1>
        <p className="muted">
          Użyj komendy <strong>/weryfikuj</strong> na Discordzie, aby dostać prywatny link
          do połączenia konta Roblox.
        </p>
      </section>
    </main>
  );
}

