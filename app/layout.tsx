import type { Metadata, Viewport } from "next";
// Self-hosted variable fonts via @fontsource-variable. The font files ship
// inside node_modules, so the production build does NOT fetch from
// fonts.googleapis.com and works offline / on restricted networks.
// The matching --font-inter and --font-display CSS variables are set in
// app/globals.css so Tailwind's font-sans/font-display classes keep working.
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mainstreetmetrics.app";

export const metadata: Metadata = {
  title: {
    default: "MainStreet Metrics — Clean dashboards for small businesses",
    template: "%s · MainStreet Metrics",
  },
  description:
    "Turn messy sales exports into clean, business-ready dashboards. Built for small shops, cafés, boutiques, and online sellers.",
  metadataBase: new URL(siteUrl),
  applicationName: "MainStreet Metrics",
  authors: [{ name: "MainStreet Metrics" }],
  keywords: [
    "small business analytics",
    "sales dashboard",
    "Shopify dashboard",
    "Square sales report",
    "Etsy analytics",
    "boutique analytics",
    "café analytics",
    "CSV sales report",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MainStreet Metrics",
    title: "MainStreet Metrics — Clean dashboards for small businesses",
    description:
      "Upload messy sales files. Get a clean, friendly dashboard in minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MainStreet Metrics",
    description:
      "Turn messy sales exports into clean, business-ready dashboards.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
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
