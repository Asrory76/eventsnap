import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventSnap — Album Foto Acara Kolaboratif",
  description:
    "Buat acara, bagikan QR code ke tamu, dan kumpulkan semua foto dalam satu album bersama secara realtime. Gratis, tanpa install aplikasi.",
  keywords: ["event", "foto", "album", "QR code", "kolaboratif", "acara"],
  openGraph: {
    title: "EventSnap — Album Foto Acara Kolaboratif",
    description:
      "Satu QR code. Semua tamu jadi fotografer. Kumpulkan momen indah acara Anda.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<header className="h-16 border-b border-zinc-200/60 bg-white/80 dark:border-zinc-800/60 dark:bg-zinc-950/80" />}>
          <Header />
        </Suspense>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
