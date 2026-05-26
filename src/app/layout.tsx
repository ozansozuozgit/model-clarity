import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Cheatsheet",
    template: "%s · AI Cheatsheet",
  },
  description:
    "A developer cheatsheet for AI models, agents, and tools. Decode Gemini, ChatGPT, Claude, and the names people mix up.",
  applicationName: "AI Cheatsheet",
  authors: [{ name: "AI Cheatsheet" }],
  keywords: [
    "AI cheatsheet",
    "AI models",
    "Gemini",
    "ChatGPT",
    "Claude",
    "AI agents",
    "model comparison",
    "developer tools",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AI Cheatsheet",
    title: "AI Cheatsheet",
    description:
      "A quick-reference cheatsheet for AI product names, model IDs, and the stacks people mean when they say Gemini, ChatGPT, or Claude.",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "AI Cheatsheet" }],
  },
  twitter: {
    card: "summary",
    title: "AI Cheatsheet",
    description:
      "Decode AI product names, model IDs, and the stacks people actually mean.",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#12151c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${fraunces.variable} ${atkinson.variable} ${jetbrains.variable}`}
      lang="en"
    >
      <body>{children}</body>
    </html>
  );
}
