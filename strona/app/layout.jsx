import "./globals.css";

export const metadata = {
  title: "Roblox Discord Verification",
  description: "Połącz konto Roblox z Discordem."
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

