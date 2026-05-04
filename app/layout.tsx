import type { Metadata } from "next";
// Self-hosted variable fonts via @fontsource-variable. The font files ship
// inside node_modules, so the production build does NOT fetch from
// fonts.googleapis.com and works offline / on restricted networks.
// The matching --font-inter and --font-display CSS variables are set in
// app/globals.css so Tailwind's font-sans/font-display classes keep working.
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";

export const metadata: Metadata = {
  title: "MainStreet Metrics — Clean dashboards for small businesses",
  description:
    "Turn messy sales exports into clean, business-ready dashboards. Built for small shops, cafés, boutiques, and online sellers.",
  metadataBase: new URL("https://mainstreetmetrics.app"),
  openGraph: {
    title: "MainStreet Metrics",
    description:
      "Upload messy sales files. Get a clean, friendly dashboard in minutes.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
