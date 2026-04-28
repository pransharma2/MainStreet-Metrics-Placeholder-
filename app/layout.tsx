import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
