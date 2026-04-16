import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sophie — Assistante de Caroline",
  description:
    "Sophie, votre assistante nutrition IA personnelle, par Caroline Dubois coach nutrition Paris 17ème.",
  keywords: "nutrition, coach, Paris, régime, alimentation, santé",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#DFFFA0" />
      </head>
      <body className={`${geist.variable} antialiased`}>
        <div id="app-root">
          {children}
        </div>
        <CookieBanner />
      </body>
    </html>
  );
}
