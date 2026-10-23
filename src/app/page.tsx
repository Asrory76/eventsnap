"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Feature highlights directly below Hero (from screenshot)          */
/* ------------------------------------------------------------------ */
const keyFeatures = [
  {
    title: "Foto & Video",
    subtitle: "dari para tamu",
    icon: (
      <svg className="w-5 h-5 text-[#B88E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Kustomisasi",
    subtitle: "desain acara",
    icon: (
      <svg className="w-5 h-5 text-[#B88E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    title: "Sinkronisasi",
    subtitle: "Google Drive",
    icon: (
      <svg className="w-5 h-5 text-[#B88E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    title: "Ucapan & Doa",
    subtitle: "buku tamu interaktif",
    icon: (
      <svg className="w-5 h-5 text-[#B88E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Design Template Showcase presets                                  */
/* ------------------------------------------------------------------ */
const templates = [
  {
    name: "Elegant Gold",
    tag: "Dipakai di 12 acara",
    badge: "Populer",
    cardBg: "bg-[#1E1B18] border-[#C5A059]/40 text-white",
    previewBg: "bg-[#2A241F] border-[#C5A059]/30",
    accent: "#C5A059",
    desc: "Nuansa champagne gold mewah dengan bingkai ornamen klasik dan tipografi editorial.",
  },
  {
    name: "Minimal Cream",
    tag: "Dipakai di 8 acara",
    badge: "Trending",
    cardBg: "bg-[#25211D] border-[#8C6A48]/40 text-white",
    previewBg: "bg-[#F7F2EB] text-[#2C251F] border-[#D6C4B2]",
    accent: "#D6B27E",
    desc: "Estetika clean ivory & warm beige, cocok untuk wedding outdoor, intimate, dan modern.",
  },
  {
    name: "Floral Garden",
    tag: "Dipakai di 6 acara",
    badge: "Romantic",
    cardBg: "bg-[#221D1E] border-[#A7656A]/40 text-white",
    previewBg: "bg-[#F4EBEA] text-[#2E2021] border-[#D4BDBA]",
    accent: "#E29DA3",
    desc: "Sentuhan bunga pastel lembut, nuansa romantis untuk resepsi taman & ballroom anggun.",
  },
  {
    name: "Modern Dark",
    tag: "Dipakai di 5 acara",
    badge: "Exclusive",
    cardBg: "bg-[#19191C] border-white/20 text-white",
    previewBg: "bg-[#121214] text-white border-white/10",
    accent: "#E5C07B",
    desc: "Kontras dramatis nan sinematik dengan visual gelap pekat dan aksen neon gold.",
  },
];

/* ------------------------------------------------------------------ */
/*  How it works steps                                                 */
/* ------------------------------------------------------------------ */
const steps = [
  {
    step: "01",
    title: "Buat Acara & Dapatkan QR Code",
    desc: "Atur nama pengantin, tanggal, dan lokasi dalam 1 menit. Sistem otomatis membuat QR code eksklusif yang siap cetak atau tampilkan.",
  },
  {
    step: "02",
    title: "Tamu Scan Pakai Kamera HP",
    desc: "Tamu cukup arahkan kamera smartphone ke QR code di meja. Langsung terbuka kamera web PicMe tanpa perlu download aplikasi.",
  },
  {
    step: "03",
    title: "Foto Tersimpan ke Galeri Real-Time",
    desc: "Momen berharga langsung tersinkronisasi di galeri album digital secara real-time dan tersimpan otomatis dalam kualitas HD.",
  },
];

/* ------------------------------------------------------------------ */
/*  Pricing packages                                                   */
/* ------------------------------------------------------------------ */
const pricingPlans = [
  {
    name: "Single Event",
    price: "Rp 349.000",
    period: "per acara",
    desc: "Ideal untuk pengantin yang ingin galeri digital mandiri.",
    features: [
      "Hingga 500 tamu undangan",
      "QR Code kustom siap cetak meja",
      "Penyimpanan media cloud 30 hari",
      "Galeri album digital real-time resolusi penuh",
      "Download zip semua foto HD",
    ],
    highlight: false,
    cta: "Pilih Single Event",
  },
  {
    name: "WO Partner Pro",
    price: "Rp 899.000",
    period: "per bulan (Unlimited Acara)",
    desc: "Pilihan utama Wedding Organizer untuk memberikan nilai tambah premium ke klien.",
    features: [
      "Acara pernikahan tanpa batas",
      "Branding kustom Wedding Organizer Anda",
      "Sinkronisasi otomatis ke Google Drive WO",
      "Fitur Moderasi Foto & Album Digital",
      "Support prioritas WhatsApp 24/7",
      "Template & Frame foto kustom tak terbatas",
    ],
    highlight: true,
    badge: "Rekomendasi WO",
    cta: "Mulai Kemitraan WO",
  },
  {
    name: "Enterprise Studio",
    price: "Hubungi Kami",
    period: "kustom tahunan",
    desc: "Untuk agensi acara besar, hotel bintang lima, dan multi-cabang WO.",
    features: [
      "Custom domain (foto.nama-wo.com)",
      "Multi-user akun staf & tim dokumentasi",
      "Dedicated server & upload bandwidth tak terbatas",
      "Integrasi API & webhook kustom",
      "SLA 99.9% uptime guarantee",
    ],
    highlight: false,
    cta: "Konsultasi Tim Kami",
  },
];

export default function Home() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"kamera" | "galeri" | "ucapan">("kamera");
  const [activeFilter, setActiveFilter] = useState<"Original" | "Warm" | "Natural" | "B&W">("Warm");

  return (
    <div className="min-h-screen bg-[#141210] text-white selection:bg-[#B88E4F] selection:text-white">
      {/* ------------------------------------------------------------ */}
      {/* 1. HERO SECTION                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 bg-[#141210]">
        {/* Soft amber luxury backdrop glow */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[400px] sm:h-[500px] w-[400px] sm:w-[500px] rounded-full bg-[#B88E4F]/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 -right-40 h-[350px] sm:h-[450px] w-[350px] sm:w-[450px] rounded-full bg-[#C5A059]/10 blur-[130px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid items-center gap-8 md:grid-cols-12 md:gap-8 lg:gap-12">
            {/* Left Column: Heading & CTAs */}
            <div className="md:col-span-6 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B88E4F]/30 bg-[#B88E4F]/10 px-3.5 py-1 text-xs font-medium tracking-wide text-[#E5C794] mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B88E4F] animate-pulse" />
                Platform Dokumentasi Tamu &amp; Wedding Organizer
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight text-white mb-5 sm:mb-6">
                Abadikan <br />
                Setiap Cerita <br />
                Bersama Kami
              </h1>

              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-[#B5ABA1] mb-6 sm:mb-8 font-light max-w-lg">
                Platform dokumentasi acara yang memudahkan tamu berbagi foto dan video langsung dari kamera smartphone ke satu galeri bersama. Elegan, aman, dan dirancang untuk Wedding Organizer.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/create"
                  className="rounded-full bg-[#BA935D] px-6 sm:px-7 py-3 text-xs sm:text-sm font-medium text-white shadow-[0_4px_14px_rgba(186,147,93,0.35)] transition-all hover:bg-[#A8824E] hover:shadow-[0_6px_20px_rgba(186,147,93,0.45)]"
                >
                  Mulai Sekarang
                </Link>

                <button
                  type="button"
                  onClick={() => setDemoModalOpen(true)}
                  className="rounded-full border border-white/25 bg-white/5 px-6 sm:px-7 py-3 text-xs sm:text-sm font-normal text-white transition-all hover:bg-white/10 hover:border-white/40"
                >
                  Lihat Demo
                </button>
              </div>

              {/* Mobile-focused badge */}
              <div className="mt-8 flex items-center gap-3 pt-5 border-t border-white/10">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B88E4F]/20 text-[#E5C794]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-[#9E958C]">
                  <strong className="text-white font-medium">100% Mobile Friendly:</strong> Tamu foto langsung dari kamera HP tanpa install aplikasi apapun.
                </p>
              </div>
            </div>

            {/* Right Column: Hero Wedding Couple Frame */}
            <div className="md:col-span-6 lg:col-span-6">
              <div className="relative mx-auto max-w-md sm:max-w-lg md:max-w-none">
                <div className="absolute -inset-1 rounded-[32px] sm:rounded-[36px] bg-gradient-to-tr from-[#B88E4F]/30 via-white/5 to-[#B88E4F]/20 opacity-70 blur-sm" />

                <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-white/15 bg-[#1C1815] shadow-2xl">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src="/images/hero-wedding.jpg"
                      alt="PicMe Wedding Couple"
                      fill
                      priority
                      className="object-cover object-center transition-transform duration-700 hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/90 via-transparent to-black/20" />

                    {/* Top pill badge */}
                    <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 inline-flex items-center gap-2 rounded-full bg-[#141210]/80 backdrop-blur-md px-3 py-1.5 border border-white/15 text-[11px] sm:text-xs text-white">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Moment Active • Andi &amp; Sari
                    </div>

                    {/* Bottom floating quick-stat bar */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between rounded-xl sm:rounded-2xl bg-[#141210]/85 backdrop-blur-md p-3 sm:p-3.5 border border-white/15">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#B88E4F]/20 text-[#E2BA77]">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-[#A89F95]">Momen Terkumpul</p>
                          <p className="font-serif-luxury text-sm sm:text-base font-semibold text-white">428 Foto • 42 Video</p>
                        </div>
                      </div>

                      <div className="text-[10px] sm:text-xs text-[#E5C794] bg-[#B88E4F]/15 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#B88E4F]/30">
                        185 Tamu
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 2. HERO FEATURE RIBBON (Warm Ivory Strip from screenshot)     */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-[#FAF7F2] text-[#201C19] py-6 sm:py-9">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {keyFeatures.map((item) => (
              <div
                key={item.title}
                className="group flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-2.5 sm:gap-3.5 p-3 rounded-2xl transition-all hover:bg-white/80"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFE4D2] transition-transform duration-300 group-hover:scale-105">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm md:text-base font-semibold text-[#201C19] tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#736B63] font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 3. DEDICATED MOBILE FIRST EXPERIENCE (Kamera HP Tamu)        */}
      {/* ------------------------------------------------------------ */}
      <section id="kamera-hp" className="py-16 sm:py-24 bg-[#141210] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left: Mobile Phone Interactive Simulation */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[320px] sm:max-w-[340px] rounded-[44px] border-[6px] border-[#38312A] bg-[#000000] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative">
                {/* Dynamic Island / Notch */}
                <div className="mx-auto h-4 w-24 rounded-full bg-[#1F1B18] mb-2" />

                {/* Smartphone Screen Canvas */}
                <div className="relative overflow-hidden rounded-[32px] bg-[#141210] border border-white/10 aspect-[9/16] flex flex-col justify-between">
                  {/* Phone Header */}
                  <div className="p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-[#B88E4F] flex items-center justify-center text-[9px] font-bold text-white">P</div>
                      <span className="font-serif-luxury text-xs text-white">PicMe</span>
                    </div>
                    <span className="text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                      Andi &amp; Sari
                    </span>
                  </div>

                  {/* Phone Middle: Camera Viewfinder */}
                  <div className="relative flex-1 overflow-hidden m-2 rounded-2xl border border-white/20">
                    <Image
                      src="/images/wedding-candid.jpg"
                      alt="Guest camera viewfinder"
                      fill
                      className={`object-cover transition-all duration-300 ${
                        activeFilter === "Warm"
                          ? "sepia-[0.25] saturate-125"
                          : activeFilter === "B&W"
                          ? "grayscale"
                          : activeFilter === "Natural"
                          ? "brightness-105 contrast-95"
                          : ""
                      }`}
                    />

                    {/* Viewfinder Grid Overlay */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      <div className="border-r border-b border-white/15" />
                      <div className="border-r border-b border-white/15" />
                      <div className="border-b border-white/15" />
                      <div className="border-r border-b border-white/15" />
                      <div className="border-r border-b border-white/15" />
                      <div className="border-b border-white/15" />
                      <div className="border-r border-white/15" />
                      <div className="border-r border-white/15" />
                      <div />
                    </div>

                    {/* Watermark / Wedding Stamp */}
                    <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/60 backdrop-blur-sm p-1.5 text-center border border-white/15">
                      <p className="font-serif-luxury text-[11px] text-[#E5C794]">Best Wishes • Andi &amp; Sari</p>
                      <p className="text-[8px] text-white/70">12 Oktober 2026</p>
                    </div>
                  </div>

                  {/* Phone Controls: Filters + Shutter Button */}
                  <div className="p-3 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col gap-2.5 z-10">
                    {/* Filter Selector Pills */}
                    <div className="flex items-center justify-center gap-1.5">
                      {(["Original", "Warm", "Natural", "B&W"] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveFilter(filter)}
                          className={`rounded-full px-2.5 py-0.5 text-[9px] transition-all ${
                            activeFilter === filter
                              ? "bg-[#BA935D] text-white font-medium shadow-sm"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    {/* Shutter Bar */}
                    <div className="flex items-center justify-around pt-1">
                      <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 text-[10px]">
                        🖼️
                      </div>

                      {/* Main Big Shutter Button */}
                      <button
                        type="button"
                        onClick={() => alert("Simulasi jepretan kamera berhasil! Foto otomatis masuk ke antrean galeri PicMe.")}
                        aria-label="Ambil foto"
                        className="h-14 w-14 rounded-full border-4 border-[#BA935D] p-1 bg-white hover:scale-95 transition-transform flex items-center justify-center cursor-pointer shadow-lg"
                      >
                        <div className="h-full w-full rounded-full bg-white border-2 border-black/10" />
                      </button>

                      <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 text-[10px]">
                        🔄
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Explanatory features for phone usage */}
            <div className="lg:col-span-7">
              <span className="inline-block rounded-full bg-[#B88E4F]/15 border border-[#B88E4F]/30 px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-[#E5C794] mb-3">
                Mobile-First Experience
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white mb-4 sm:mb-6">
                Dirancang Khusus untuk Kamera Smartphone Para Tamu
              </h2>
              <p className="text-sm sm:text-base text-[#AEA59B] font-light mb-8 leading-relaxed">
                Karena sebagian besar tamu mengabadikan momen menggunakan ponsel, PicMe dibuat seringan mungkin. Tidak ada aplikasi yang harus diunduh, tidak perlu registrasi akun berbelit, dan langsung aktif hanya dengan scan QR meja.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="h-9 w-9 rounded-xl bg-[#B88E4F]/20 text-[#E5C794] flex items-center justify-center mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">Scan Kamera Langsung</h4>
                  <p className="text-xs text-[#A89F95] leading-relaxed">
                    Cukup buka kamera bawaan iOS atau Android. Tautan PicMe otomatis terbuka seketika.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="h-9 w-9 rounded-xl bg-[#B88E4F]/20 text-[#E5C794] flex items-center justify-center mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">Filter Romantis &amp; Frame</h4>
                  <p className="text-xs text-[#A89F95] leading-relaxed">
                    Tone warna warm cinematic dan frame bertuliskan nama pengantin langsung menempel di foto.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="h-9 w-9 rounded-xl bg-[#B88E4F]/20 text-[#E5C794] flex items-center justify-center mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">Kompresi Cepat &amp; Hemat Kuota</h4>
                  <p className="text-xs text-[#A89F95] leading-relaxed">
                    Upload tetap lancar meski di dalam ballroom dengan sinyal seluler yang padat ratusan tamu.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="h-9 w-9 rounded-xl bg-[#B88E4F]/20 text-[#E5C794] flex items-center justify-center mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">Kirim Ucapan &amp; Doa</h4>
                  <p className="text-xs text-[#A89F95] leading-relaxed">
                    Tamu dapat menyertakan ucapan selamat yang muncul elegan bersama foto mereka.
                  </p>
                </div>
              </div>

              {/* Direct Demo Trigger for Mobile Testing */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/events/sample-event/camera"
                  className="rounded-full bg-[#BA935D] px-6 py-2.5 text-xs sm:text-sm font-medium text-white shadow-md hover:bg-[#A8824E] inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Buka Kamera Tamu (Demo HP)
                </Link>
                <Link
                  href="/events/sample-event"
                  className="rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-xs sm:text-sm font-normal text-white hover:bg-white/10"
                >
                  Lihat Galeri Tamu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ------------------------------------------------------------ */}
      {/* 5. TEMPLATE & DESAIN SHOWCASE                                */}
      {/* ------------------------------------------------------------ */}
      <section className="py-16 sm:py-24 bg-[#141210] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14">
            <div>
              <span className="inline-block rounded-full bg-[#B88E4F]/15 border border-[#B88E4F]/30 px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-[#E5C794] mb-3">
                Kustomisasi Visual
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white">
                Pilih Tema yang Sesuai Konsep Acara
              </h2>
            </div>
            <p className="mt-2 md:mt-0 text-xs sm:text-sm text-[#A89F95] max-w-md font-light">
              Tiap pernikahan memiliki sentuhan kepribadian tersendiri. Ubah skema warna, bingkai foto, dan tipografi dalam sekali klik.
            </p>
          </div>

          {/* Grid of templates */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((tpl) => (
              <div
                key={tpl.name}
                className={`group relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${tpl.cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: tpl.accent + "25",
                        color: tpl.accent,
                        border: `1px solid ${tpl.accent}50`,
                      }}
                    >
                      {tpl.badge}
                    </span>
                    <span className="text-[11px] opacity-75">{tpl.tag}</span>
                  </div>

                  {/* Template Card Graphic Preview */}
                  <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border flex items-center justify-center p-3 ${tpl.previewBg}`}>
                    <div className="text-center">
                      <div
                        className="mx-auto mb-1.5 h-7 w-7 rounded-full flex items-center justify-center border"
                        style={{ borderColor: tpl.accent, color: tpl.accent }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <p className="font-serif-luxury text-xs sm:text-sm font-semibold tracking-wide">
                        {tpl.name}
                      </p>
                      <p className="text-[9px] opacity-75 mt-0.5">Frame &amp; Theme Preset</p>
                    </div>
                  </div>

                  <h3 className="font-serif-luxury text-lg sm:text-xl font-medium mb-1.5">
                    {tpl.name}
                  </h3>
                  <p className="text-xs leading-relaxed opacity-85">
                    {tpl.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#E5C794]">
                  <span className="font-medium">Gunakan Tema</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 6. UNTUK WEDDING ORGANIZER (Dedicated Value Proposition)    */}
      {/* ------------------------------------------------------------ */}
      <section id="wedding-organizer" className="py-16 sm:py-24 bg-[#FAF7F2] text-[#201C19] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: WO Benefits */}
            <div className="lg:col-span-6">
              <span className="inline-block rounded-full bg-[#EFE4D2] px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-[#8A673E] mb-3">
                Untuk Wedding Organizer
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#201C19] mb-4 sm:mb-6">
                Tingkatkan Nilai Paket Wedding Anda Tanpa Repot
              </h2>
              <p className="text-sm sm:text-base text-[#6B635A] font-light mb-6 sm:mb-8 leading-relaxed">
                Jadikan PicMe sebagai fitur unggulan dalam penawaran Anda ke calon pengantin. Tambahkan sensasi pesta yang modern, interaktif, dan tak terlupakan.
              </p>

              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 sm:p-4 border border-[#E8DFD3] shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE4D2] text-[#B88E4F]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#201C19]">Otomatis Sinkron ke Google Drive WO</h4>
                    <p className="text-xs text-[#6B635A] mt-0.5">
                      Semua foto dan video tamu tersimpan langsung dalam resolusi asli di folder Drive tim Anda. Pengantin dapat file bersih instan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 sm:p-4 border border-[#E8DFD3] shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE4D2] text-[#B88E4F]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#201C19]">Fitur Moderasi Foto Aman</h4>
                    <p className="text-xs text-[#6B635A] mt-0.5">
                      Pilihan aktivasi moderasi agar foto melalui persetujuan operator WO terlebih dahulu sebelum tampil di layar utama.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 sm:p-4 border border-[#E8DFD3] shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE4D2] text-[#B88E4F]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#201C19]">Watermark &amp; Branding Nama WO Anda</h4>
                    <p className="text-xs text-[#6B635A] mt-0.5">
                      Setiap tautan, QR stand, dan header menampilkan logo &amp; nama Wedding Organizer Anda untuk promosi elegan ke ratusan tamu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#BA935D] px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-medium text-white shadow-md hover:bg-[#A8824E] inline-flex items-center gap-2"
                >
                  Buka Dashboard WO
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Column: WO Dashboard Card */}
            <div className="lg:col-span-6">
              <div className="rounded-[28px] border border-white/15 bg-[#1C1916] p-4 sm:p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-[#B88E4F] flex items-center justify-center text-xs font-serif font-bold text-white">AW</div>
                    <div>
                      <p className="text-xs font-semibold text-white">Aluna Weddings</p>
                      <p className="text-[10px] text-[#A89F95]">Wedding Organizer Partner</p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] bg-[#B88E4F]/20 text-[#E5C794] border border-[#B88E4F]/30 px-2.5 py-1 rounded-full">
                    Paket Unlimited
                  </span>
                </div>

                {/* Dashboard Stats snippet */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-4">
                  <div className="rounded-xl bg-white/5 p-2.5 sm:p-3 border border-white/10">
                    <p className="text-[9px] sm:text-[10px] text-[#A89F95]">Total Acara</p>
                    <p className="font-serif-luxury text-lg sm:text-xl font-bold text-white">12</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 sm:p-3 border border-white/10">
                    <p className="text-[9px] sm:text-[10px] text-[#A89F95]">Foto &amp; Video</p>
                    <p className="font-serif-luxury text-lg sm:text-xl font-bold text-[#E5C794]">47.9K</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 sm:p-3 border border-white/10">
                    <p className="text-[9px] sm:text-[10px] text-[#A89F95]">Storage Drive</p>
                    <p className="font-serif-luxury text-lg sm:text-xl font-bold text-white">320GB</p>
                  </div>
                </div>

                {/* Event Card preview */}
                <div className="rounded-2xl border border-white/15 bg-[#25201C] p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-block text-[9px] sm:text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full mb-1">
                        Sedang Berlangsung
                      </span>
                      <h4 className="font-serif-luxury text-sm sm:text-base font-semibold text-white">Andi &amp; Sari</h4>
                      <p className="text-[10px] sm:text-[11px] text-[#A89F95]">Pavilion Garden, Jakarta</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] sm:text-xs font-medium text-white">328 Foto • 42 Video</p>
                      <p className="text-[9px] sm:text-[10px] text-[#E5C794]">185 Tamu Hadir</p>
                    </div>
                  </div>

                  {/* Progress bar storage */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#B88E4F] h-full w-[65%]" />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <Link href="/dashboard" className="text-[#E5C794] hover:underline font-medium">
                      Kelola Acara →
                    </Link>
                    <Link href="/events/sample-event" className="text-white/70 hover:text-white">
                      Lihat Galeri Tamu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 7. CARA KERJA                                                */}
      {/* ------------------------------------------------------------ */}
      <section className="py-16 sm:py-24 bg-[#141210] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="inline-block rounded-full bg-[#B88E4F]/15 border border-[#B88E4F]/30 px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-[#E5C794] mb-3">
              Alur Sangat Praktis
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white mb-3">
              Cara Kerja PicMe
            </h2>
            <p className="text-xs sm:text-sm text-[#AEA59B] font-light">
              Tiga langkah mudah tanpa instalasi aplikasi untuk pengantin, WO, dan seluruh tamu undangan.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((st) => (
              <div
                key={st.step}
                className="relative rounded-3xl border border-white/10 bg-[#1C1815] p-6 sm:p-8 shadow-sm transition-all hover:border-[#C5A059]/40 hover:-translate-y-1"
              >
                <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#C5A059] mb-3">
                  {st.step}
                </div>
                <h3 className="font-serif-luxury text-lg sm:text-xl font-semibold text-white mb-2">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-[#AEA59B]">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 8. PAKET & HARGA                                             */}
      {/* ------------------------------------------------------------ */}
      <section id="harga" className="py-16 sm:py-24 bg-[#FAF7F2] text-[#201C19]">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="inline-block rounded-full bg-[#EFE4D2] px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-[#8A673E] mb-3">
              Investasi &amp; Paket
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#201C19] mb-3">
              Pilihan Paket Transparan
            </h2>
            <p className="text-xs sm:text-sm text-[#6B635A] font-light">
              Investasi terjangkau untuk pengalaman dokumentasi pesta pernikahan tak terlupakan.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all ${
                  plan.highlight
                    ? "border-2 border-[#C5A059] bg-[#221D18] shadow-[0_12px_40px_rgba(197,160,89,0.2)] lg:-translate-y-2"
                    : "border border-white/15 bg-[#1B1815]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C5A059] px-3.5 py-0.5 text-[11px] font-semibold text-[#141210] uppercase tracking-wider shadow">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-white mb-1.5">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#AEA59B] mb-5 min-h-[32px]">
                    {plan.desc}
                  </p>

                  <div className="mb-6">
                    <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-[11px] text-[#A89F95] block mt-0.5">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6 text-xs sm:text-sm">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5 text-[#D6CECA]">
                        <svg className="w-4 h-4 text-[#C5A059] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/create"
                  className={`w-full text-center py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    plan.highlight
                      ? "bg-[#BA935D] text-white hover:bg-[#A8824E]"
                      : "border border-white/25 text-white hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 9. CALL TO ACTION BANNER                                     */}
      {/* ------------------------------------------------------------ */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-[#141210] text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,142,79,0.15)_0,transparent_70%)]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-8">
          <h2 className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal text-white mb-4 sm:mb-6">
            Siap Mengabadikan Momen Istimewa Bersama PicMe?
          </h2>
          <p className="text-sm sm:text-base text-[#AEA59B] font-light max-w-2xl mx-auto mb-7 sm:mb-8">
            Buat album pernikahan digital Anda sekarang. Biarkan setiap senyuman dan keceriaan para tamu berkumpul rapi dalam satu galeri eksklusif.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/create"
              className="rounded-full bg-[#BA935D] px-7 py-3 text-xs sm:text-sm font-medium text-white shadow-md hover:bg-[#A8824E]"
            >
              Buat Acara Sekarang
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/25 bg-white/5 px-6 py-3 text-xs sm:text-sm font-normal text-white hover:bg-white/10"
            >
              Masuk Dashboard WO
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 10. FOOTER                                                   */}
      {/* ------------------------------------------------------------ */}
      <footer id="kontak" className="border-t border-white/10 bg-[#0F0D0B] py-12 text-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-8 md:grid-cols-4 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                  <circle cx="12" cy="12" r="5" stroke="#C5A059" strokeWidth="1.8" />
                  <circle cx="20" cy="12" r="5" stroke="#C5A059" strokeWidth="1.8" />
                  <circle cx="12" cy="20" r="5" stroke="#C5A059" strokeWidth="1.8" />
                  <circle cx="20" cy="20" r="5" stroke="#C5A059" strokeWidth="1.8" />
                  <circle cx="16" cy="16" r="1.5" fill="#E8D5B5" />
                </svg>
                <span className="font-serif-luxury text-xl sm:text-2xl font-semibold text-white tracking-wide">
                  PicMe
                </span>
              </div>
              <p className="text-xs text-[#8C837A] max-w-sm font-light leading-relaxed">
                Platform dokumentasi kolaboratif foto dan video pernikahan untuk Wedding Organizer dan pengantin modern di Indonesia.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Navigasi
              </h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#kamera-hp" className="hover:text-white transition">Kamera HP Tamu</a></li>
                <li><a href="#wedding-organizer" className="hover:text-white transition">Untuk WO</a></li>
                <li><a href="#harga" className="hover:text-white transition">Paket Harga</a></li>
                <li><Link href="/create" className="hover:text-white transition">Buat Acara Baru</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Hubungi Kami
              </h4>
              <ul className="space-y-2 text-xs">
                <li>WhatsApp: +62 812-3456-7890</li>
                <li>Email: halo@picme.id</li>
                <li>Jakarta, Indonesia</li>
                <li className="pt-1.5 text-[11px] text-[#A89F95]">Senin - Minggu: 08:00 - 22:00 WIB</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#736B63] gap-3">
            <p>© 2026 PicMe. Seluruh hak cipta dilindungi undang-undang.</p>
            <div className="flex items-center gap-5">
              <span className="hover:text-white cursor-pointer">Syarat &amp; Ketentuan</span>
              <span className="hover:text-white cursor-pointer">Kebijakan Privasi</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------ */}
      {/* DEMO MODAL                                                   */}
      {/* ------------------------------------------------------------ */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#1A1714] p-5 sm:p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#B88E4F]/20 text-[#E5C794]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-white">Eksplorasi Demo PicMe</h3>
                <p className="text-xs text-[#AEA59B]">Coba modul utama langsung di perangkat Anda</p>
              </div>
            </div>

            <div className="grid gap-3 my-5">
              <Link
                href="/events/sample-event/camera"
                onClick={() => setDemoModalOpen(false)}
                className="group rounded-2xl border border-[#B88E4F]/40 bg-[#B88E4F]/10 p-3.5 transition-all hover:bg-[#B88E4F]/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#E5C794]">Kamera HP Tamu (Mobile Viewfinder)</span>
                  <span className="text-xs text-[#E5C794] group-hover:translate-x-1 transition-transform">Buka →</span>
                </div>
                <p className="text-xs text-[#C7BEB5]">
                  Buka kamera smartphone, coba shutter, filter live, dan upload instan seperti tamu di pesta.
                </p>
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setDemoModalOpen(false)}
                className="group rounded-2xl border border-white/15 bg-white/5 p-3.5 transition-all hover:bg-white/10 hover:border-[#C5A059]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">Dashboard Wedding Organizer</span>
                  <span className="text-xs text-white/50 group-hover:translate-x-1 transition-transform">Buka →</span>
                </div>
                <p className="text-xs text-[#A89F95]">
                  Kelola event aktif, template, sinkronisasi Google Drive, dan live moment wall.
                </p>
              </Link>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10"
              >
                Tutup
              </button>
              <Link
                href="/create"
                onClick={() => setDemoModalOpen(false)}
                className="rounded-full bg-[#BA935D] px-5 py-2 text-xs font-medium text-white hover:bg-[#A8824E]"
              >
                + Buat Acara Baru
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
