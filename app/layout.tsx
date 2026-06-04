import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrainAuth AI",
  description:
    "Agentic stroke documentation and prior-authorization readiness for acute stroke teams.",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
