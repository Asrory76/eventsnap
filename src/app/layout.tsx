import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/Header";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "MomenKita — Abadikan Setiap Cerita Bersama Kami",
  description:
    "Platform dokumentasi acara yang memudahkan tamu berbagi foto dan video dalam satu galeri langsung dari smartphone. Elegan, aman, dan dirancang untuk Wedding Organizer.",
  keywords: [
    "wedding",
    "MomenKita",
    "PicMe",
    "foto pernikahan",
    "galeri tamu",
    "wedding organizer",
    "live moment wall",
    "kamera hp pernikahan",
    "QR code pernikahan",
  ],
  openGraph: {
    title: "MomenKita — Abadikan Setiap Cerita Bersama Kami",
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
    <html lang="id" className={`h-full ${playfair.variable} ${plusJakarta.variable} antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F6F1E9] text-[#231C16] font-sans selection:bg-[#9E7B4F] selection:text-white overflow-x-hidden relative">
        <Suspense fallback={<div className="h-20 w-full" />}>
          <Header />
        </Suspense>
        <div className="flex-1 flex flex-col w-full overflow-x-hidden">{children}</div>
        <CookieConsent />
      </body>
    </html>
  );
}
