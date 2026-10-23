import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "PicMe — Abadikan Setiap Cerita Bersama Kami",
  description:
    "Platform dokumentasi acara yang memudahkan tamu berbagi foto dan video dalam satu galeri langsung dari smartphone. Elegan, aman, dan dirancang untuk Wedding Organizer.",
  keywords: [
    "wedding",
    "PicMe",
    "foto pernikahan",
    "galeri tamu",
    "wedding organizer",
    "live moment wall",
    "kamera hp pernikahan",
    "QR code pernikahan",
  ],
  openGraph: {
    title: "PicMe — Abadikan Setiap Cerita Bersama Kami",
    description:
      "Platform dokumentasi acara yang memudahkan tamu berbagi foto dan video dalam satu galeri langsung dari smartphone.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full bg-[#141210] antialiased">
      <body className="min-h-full flex flex-col bg-[#141210] text-[#FFFFFF] selection:bg-[#B88E4F] selection:text-white overflow-x-hidden">
        <Suspense fallback={<header className="h-20 border-b border-white/10 bg-[#141210]" />}>
          <Header />
        </Suspense>
        <div className="flex-1 flex flex-col w-full overflow-x-hidden">{children}</div>
        <CookieConsent />
      </body>
    </html>
  );
}
