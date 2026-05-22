import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Compass",
  description: "A developer-first navigator for choosing AI models, agents, and tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
