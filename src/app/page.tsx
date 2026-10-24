"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  4 Fitur Utama Grid Data                                           */
/* ------------------------------------------------------------------ */
const keyFeatures = [
  {
    title: "Foto & Video dari para tamu",
    desc: "Kumpulkan seluruh dokumentasi candid tamu lewat scan QR tanpa aplikasi.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    title: "Kustomisasi desain acara",
    desc: "Sesuaikan bingkai foto, filter, dan tema galeri selaras dengan konsep acara.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M12 19l7-7 3 3-7 7-3-3z"
        />
      </svg>
    ),
  },
  {
    title: "Sinkronisasi Google Drive",
    desc: "Cadangkan otomatis ribuan foto dan video resolusi asli ke penyimpanan awan.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
    ),
  },
  {
    title: "Live Moment Wall",
    desc: "Tampilkan slideshow foto kiriman tamu secara real-time di layar besar venue.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Cara Kerja 3 Langkah                                              */
/* ------------------------------------------------------------------ */
const howItWorksSteps = [
  {
    number: "01",
    title: "Buat Galeri & Cetak QR Code",
    desc: "Tentukan nama acara, tanggal, dan sesuaikan template visual. Cetak QR code di meja resepsi, kartu undangan, atau layar sambutan.",
  },
  {
    number: "02",
    title: "Tamu Scan & Jepret Langsung",
    desc: "Tanpa download aplikasi atau registrasi ribet. Kamera smartphone tamu langsung terbuka dalam web browser dan mengunggah foto otomatis.",
  },
  {
    number: "03",
    title: "Live Wall & Unduh Resolusi Asli",
    desc: "Foto-foto langsung tayang di proyektor ballroom secara real-time dan tersimpan rapi untuk diunduh pengantin maupun Wedding Organizer.",
  },
];

/* ------------------------------------------------------------------ */
/*  Paket Harga                                                       */
/* ------------------------------------------------------------------ */
const pricingPlans = [
  {
    name: "Intimate Gathering",
    badge: "Acara Kecil",
    price: "Rp 349.000",
    period: "per acara",
    desc: "Sempurna untuk lamaran, bridal shower, atau akad nikah intim.",
    features: [
      "Hingga 200 Foto & Video",
      "Akses Galeri 3 Bulan",
      "QR Code Standee Siap Cetak",
      "Unduh Massal File Asli",
      "Buku Tamu & Ucapan Digital",
    ],
    popular: false,
    cta: "Pilih Paket",
    href: "/create",
  },
  {
    name: "Grand Wedding",
    badge: "Paling Populer",
    price: "Rp 699.000",
    period: "per acara",
    desc: "Solusi lengkap resepsi pernikahan modern dengan Live Wall.",
    features: [
      "Hingga 1.000 Foto & Video",
      "Akses Galeri 12 Bulan",
      "Live Stream Moment Wall Pro",
      "Moderasi Foto Real-time",
      "Sinkronisasi Google Drive Otomatis",
      "Kustomisasi Logo & Frame Foto",
      "Bantuan Setup oleh Tim Teknis",
    ],
    popular: true,
    cta: "Mulai Sekarang",
    href: "/create",
  },
  {
    name: "Partner WO (Multi-Event)",
    badge: "Paket Organizer",
    price: "Rp 1.490.000",
    period: "5 acara / kuota fleksibel",
    desc: "Dirancang untuk Wedding Organizer yang ingin menambah portofolio layanan.",
    features: [
      "5 Event Bebas Jadwal",
      "Dashboard Manajemen Khusus WO",
      "Branding Wedding Organizer Anda",
      "Prioritas Dukungan Teknis 24/7",
      "Backup Drive & Ekspor Arsip Instan",
      "Custom Domain Galeri Pasangan",
    ],
    popular: false,
    cta: "Hubungi Kemitraan",
    href: "#kontak",
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Items                                                         */
/* ------------------------------------------------------------------ */
const faqs = [
  {
    q: "Apakah tamu undangan harus menginstal aplikasi tertentu?",
    a: "Sama sekali tidak. Tamu cukup memindai (scan) QR code dengan kamera smartphone bawaan. Halaman web camera instan MomenKita akan langsung terbuka di browser mereka.",
  },
  {
    q: "Bagaimana jika ada tamu yang mengunggah foto tidak pantas?",
    a: "MomenKita dilengkapi fitur Moderasi Host. Anda dapat menyalakan mode peninjauan sehingga setiap foto harus disetujui terlebih dahulu sebelum muncul di Live Moment Wall publik.",
  },
  {
    q: "Apakah kualitas foto yang diunggah terkompresi hingga pecah?",
    a: "Tidak. Kompresi kami menggunakan algoritma adaptif yang menjaga ketajaman resolusi foto tetap prima untuk dicetak, namun tetap hemat kuota internet dan cepat diunggah.",
  },
  {
    q: "Berapa lama galeri foto dapat diakses setelah acara selesai?",
    a: "Tergantung paket yang dipilih, galeri tetap aktif antara 3 hingga 12 bulan. Pengantin dan WO dapat mengunduh seluruh arsip foto beresolusi penuh kapan saja.",
  },
];

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative z-10 flex flex-col w-full">
      {/* ============================================================ */}
      {/* 1. HERO SECTION (2-Column Grid Layout)                       */}
      {/* ============================================================ */}
      <section className="relative pt-6 sm:pt-10 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Kolom Kiri: Copywriting & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Pill Tag Editorial */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6F0] border border-[#E5DAC9] text-xs font-medium text-[#7E5E36] mb-6 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#9E7B4F] animate-pulse" />
              <span>Platform Dokumentasi Pernikahan & Event</span>
            </div>

            {/* Headline Utama dengan Ornamen Sparkle Emas */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] font-bold leading-[1.14] text-[#231C16] tracking-tight mb-6">
              Abadikan Setiap{" "}
              <span className="relative inline-block text-[#7E5E36]">
                Cerita
                {/* 4-Point Sparkle Icon di Sekitar Kata Cerita */}
                <svg
                  className="absolute -top-3 -right-6 w-6 h-6 text-[#9E7B4F] animate-bounce"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </span>{" "}
              Bersama Kami
            </h1>

            {/* Sub-headline */}
            <p className="text-[#5C4E43] text-base sm:text-lg leading-relaxed mb-8 max-w-xl font-normal">
              Platform dokumentasi acara yang memudahkan tamu berbagi foto dan video dalam satu galeri.
              Elegan, aman, dan dirancang khusus untuk memperkuat layanan Wedding Organizer.
            </p>

            {/* CTA Group: Primary & Secondary Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              {/* Primary CTA */}
              <Link
                href="/create"
                className="btn-gold-gradient inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-semibold shadow-lg hover:opacity-95 transition-all text-center"
              >
                <span>Mulai Sekarang</span>
                <span className="text-lg">›</span>
              </Link>

              {/* Secondary CTA: Lihat Demo */}
              <Link
                href="/events/sample-event"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#231C16]/30 bg-[#FAF6F0]/70 backdrop-blur-sm px-6 py-4 text-base font-medium text-[#231C16] hover:bg-white hover:border-[#231C16]/60 transition-all text-center"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#231C16]/10 text-[#231C16]">
                  <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span>Lihat Demo Galeri</span>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4 border-t border-[#E5DAC9]/60 w-full">
              {/* 4 Avatar Melingkar Bertumpuk */}
              <div className="flex -space-x-3 overflow-hidden">
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-[#F6F1E9] bg-[#E2D6C5] flex items-center justify-center text-xs font-bold text-[#5A4325]">
                  AD
                </div>
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-[#F6F1E9] bg-[#CBB8A1] flex items-center justify-center text-xs font-bold text-[#44331C]">
                  RN
                </div>
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-[#F6F1E9] bg-[#BFA88D] flex items-center justify-center text-xs font-bold text-[#352514]">
                  WO
                </div>
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-[#F6F1E9] bg-[#9E7B4F] flex items-center justify-center text-xs font-bold text-white">
                  +5k
                </div>
              </div>

              <div className="text-sm text-[#5C4E43]">
                Dipercaya oleh <strong className="text-[#231C16] font-semibold">500+ Wedding Organizer</strong> & Ribuan Pasangan
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Layered Photo Collage & Floating Badges */}
          <div className="lg:col-span-6 relative w-full">
            <div className="relative mx-auto max-w-[500px] lg:max-w-none h-[440px] sm:h-[500px] lg:h-[540px]">
              {/* Ornamen Lingkaran Emas di Latar Belakang Kolase */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#9E7B4F]/10 to-[#E5DAC9]/40 blur-2xl pointer-events-none" />

              {/* FOTO UTAMA (Tengah Besar) */}
              <div className="absolute top-6 left-10 sm:left-14 right-10 sm:right-14 bottom-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 transition-transform duration-500 hover:scale-[1.01]">
                <Image
                  src="/images/hero-wedding.jpg"
                  alt="Momen Pernikahan Romantis"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <p className="text-xs font-light tracking-widest uppercase opacity-85">Koleksi Resepsi</p>
                  <p className="font-serif text-lg font-medium">Andi & Sari — Royal Ballroom</p>
                </div>
              </div>

              {/* FOTO LAYER KIRI BAWAH (Overlap) */}
              <div className="absolute -bottom-2 -left-2 sm:left-2 w-36 sm:w-48 h-44 sm:h-56 rounded-2xl overflow-hidden shadow-xl border-4 border-[#F6F1E9] rotate-[-5deg] transition-transform duration-300 hover:rotate-0 hover:z-20">
                <Image
                  src="/images/wedding-candid.jpg"
                  alt="Candid Tamu Pernikahan"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 150px, 200px"
                />
              </div>

              {/* FOTO LAYER KANAN ATAS (Overlap) */}
              <div className="absolute -top-4 -right-2 sm:right-2 w-32 sm:w-44 h-40 sm:h-52 rounded-2xl overflow-hidden shadow-xl border-4 border-[#F6F1E9] rotate-[6deg] transition-transform duration-300 hover:rotate-0 hover:z-20">
                <Image
                  src="/images/wedding-table-qr.jpg"
                  alt="QR Code Meja Resepsi"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 130px, 180px"
                />
              </div>

              {/* FLOATING GLASS BADGE 1: Di Kiri Atas Foto Utama */}
              <div className="absolute top-1 left-2 sm:left-4 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FAF6F0]/90 backdrop-blur-md border border-[#E5DAC9] shadow-lg animate-float">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE8DC] text-[#7E5E36]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-bold text-[#231C16] leading-none">+1.240</div>
                  <div className="text-[11px] text-[#6E5D4F] font-medium mt-0.5">Foto Terkirim</div>
                </div>
              </div>

              {/* FLOATING GLASS BADGE 2: Di Kanan Bawah Foto Utama */}
              <div className="absolute bottom-2 right-1 sm:right-4 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FAF6F0]/90 backdrop-blur-md border border-[#E5DAC9] shadow-lg">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9E7B4F] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#7E5E36]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#231C16] leading-none">Live Moment Wall</div>
                  <div className="text-[11px] text-[#7E5E36] font-medium mt-0.5 flex items-center gap-1">
                    <span>Sedang Aktif di Proyektor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. 4 KARTU FITUR UTAMA (Feature Highlights Grid)             */}
      {/* ============================================================ */}
      <section id="fitur" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="group bg-[#FAF6F0]/80 backdrop-blur-md border border-[#E6DDD0] rounded-3xl p-7 text-center shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Lingkaran Lembut Ikon Emas */}
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#EFE5D5] flex items-center justify-center text-[#7E5E36] group-hover:scale-110 group-hover:bg-[#E5DAC9] transition-transform duration-300">
                {feat.icon}
              </div>

              <h3 className="font-serif text-lg font-bold text-[#231C16] mb-2 leading-snug">
                {feat.title}
              </h3>

              <p className="text-sm text-[#6E5D4F] leading-relaxed font-normal">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. DIBUAT KHUSUS UNTUK WEDDING ORGANIZER                    */}
      {/* ============================================================ */}
      <section id="wedding-organizer" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-[#FAF6F0]/85 backdrop-blur-md border border-[#E5DAC9] p-8 sm:p-12 lg:p-16 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#9E7B4F]">
                Nilai Tambah Layanan WO
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#231C16] mt-2 mb-4 leading-tight">
                Tingkatkan Daya Jual Paket Wedding Anda dengan Sentuhan Modern
              </h2>
              <p className="text-[#5C4E43] text-base leading-relaxed mb-6">
                Kini klien pengantin mendambakan pengalaman yang interaktif dan instan. MomenKita memberikan
                layanan eksklusif yang siap Anda tawarkan ke calon klien tanpa beban infrastruktur teknis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F6F1E9]/80 border border-[#E5DAC9]/60">
                  <div className="flex h-6 w-6 rounded-full bg-[#9E7B4F]/15 items-center justify-center text-[#7E5E36] text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#231C16]">Tanpa Setup Aplikasi</h4>
                    <p className="text-xs text-[#6E5D4F] mt-0.5">Tamu segala usia bisa langsung pakai kamera browser.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F6F1E9]/80 border border-[#E5DAC9]/60">
                  <div className="flex h-6 w-6 rounded-full bg-[#9E7B4F]/15 items-center justify-center text-[#7E5E36] text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#231C16]">Moderasi Foto Realtime</h4>
                    <p className="text-xs text-[#6E5D4F] mt-0.5">Kontrol penuh tim WO terhadap foto yang tampil di proyektor.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F6F1E9]/80 border border-[#E5DAC9]/60">
                  <div className="flex h-6 w-6 rounded-full bg-[#9E7B4F]/15 items-center justify-center text-[#7E5E36] text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#231C16]">Branding Wedding Organizer</h4>
                    <p className="text-xs text-[#6E5D4F] mt-0.5">Sematkan nama dan logo WO Anda di footer setiap album.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F6F1E9]/80 border border-[#E5DAC9]/60">
                  <div className="flex h-6 w-6 rounded-full bg-[#9E7B4F]/15 items-center justify-center text-[#7E5E36] text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#231C16]">Backup Cloud Otomatis</h4>
                    <p className="text-xs text-[#6E5D4F] mt-0.5">Langsung tersinkronisasi ke Google Drive pengantin.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#EFE8DC]/60 border border-[#E5DAC9]">
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden shadow-md border-2 border-white mb-4">
                <Image
                  src="/images/wedding-table-qr.jpg"
                  alt="QR Code Meja Resepsi"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-serif text-lg font-semibold text-[#231C16]">Cetak Instan untuk Meja Tamu</p>
              <p className="text-xs text-[#6E5D4F] max-w-xs mt-1">
                Tersedia template cetak siap pakai format PDF/PNG resolusi tinggi dengan desain hangat & mewah.
              </p>
              <Link
                href="/create"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#231C16] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#382E25] transition"
              >
                Coba Buat Acara Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CARA KERJA (3 LANGKAH MUDAH)                              */}
      {/* ============================================================ */}
      <section id="cara-kerja" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#9E7B4F]">
            Alur Penggunaan
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#231C16] mt-2 mb-3">
            Hanya 3 Langkah Sederhana
          </h2>
          <p className="text-sm sm:text-base text-[#6E5D4F]">
            Dirancang seringkas mungkin agar tamu dari segala usia dapat berpartisipasi tanpa kendala teknis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {howItWorksSteps.map((s, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-3xl bg-[#FAF6F0]/80 border border-[#E6DDD0] shadow-xs flex flex-col items-start"
            >
              <span className="font-serif text-4xl sm:text-5xl font-bold text-[#9E7B4F]/40 mb-4 block">
                {s.number}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#231C16] mb-2.5">
                {s.title}
              </h3>
              <p className="text-sm text-[#6E5D4F] leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. PRICING SECTION (Pilihan Investasi)                       */}
      {/* ============================================================ */}
      <section id="harga" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#9E7B4F]">
            Investasi Transparan
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#231C16] mt-2 mb-3">
            Pilihan Paket untuk Berbagai Ukuran Acara
          </h2>
          <p className="text-sm sm:text-base text-[#6E5D4F]">
            Biaya satu kali per event tanpa biaya tersembunyi. Termasuk dukungan teknis hingga hari H.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? "bg-[#FAF6F0] border-2 border-[#9E7B4F] shadow-xl lg:-translate-y-2"
                  : "bg-[#FAF6F0]/70 border border-[#E6DDD0] shadow-sm hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#A68458] to-[#805F35] text-white text-xs font-semibold shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl font-bold text-[#231C16]">{plan.name}</h3>
                  {!plan.popular && (
                    <span className="text-xs font-medium text-[#7E5E36] bg-[#EFE8DC] px-2.5 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl font-bold text-[#231C16] font-serif">
                    {plan.price}
                  </span>
                  <span className="text-xs text-[#6E5D4F] ml-1.5">{plan.period}</span>
                </div>

                <p className="text-xs text-[#6E5D4F] mb-6 leading-relaxed">{plan.desc}</p>

                <div className="space-y-3 pt-6 border-t border-[#E5DAC9]/60 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-xs text-[#231C16]">
                      <svg className="w-4 h-4 text-[#9E7B4F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={plan.href}
                className={`w-full py-3.5 rounded-xl text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? "btn-gold-gradient"
                    : "bg-[#231C16] text-white hover:bg-[#382E25]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. FAQ SECTION                                               */}
      {/* ============================================================ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#9E7B4F]">
            Pertanyaan Umum
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#231C16] mt-2">
            Hal yang Sering Ditanyakan
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#FAF6F0]/85 border border-[#E5DAC9] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-medium text-[#231C16]"
                >
                  <span className="text-base font-semibold">{faq.q}</span>
                  <span className="text-lg text-[#9E7B4F] shrink-0 font-bold">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-[#5C4E43] leading-relaxed border-t border-[#E5DAC9]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. BOTTOM CTA BANNER                                         */}
      {/* ============================================================ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#231C16] to-[#3A2E24] text-white p-8 sm:p-14 text-center shadow-xl">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Siap Menghadirkan Galeri Momen Terbaik di Acara Anda?
            </h2>
            <p className="text-sm sm:text-base text-white/80 mb-8 leading-relaxed font-light">
              Buat album acara pertama Anda hanya dalam 1 menit. Tanpa biaya awal untuk mencoba mode preview demo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/create"
                className="btn-gold-gradient px-8 py-4 rounded-xl text-base font-semibold shadow-lg hover:opacity-95 transition"
              >
                Buat Album Acara Sekarang
              </Link>
              <Link
                href="/events/sample-event"
                className="px-8 py-4 rounded-xl border border-white/30 text-white hover:bg-white/10 transition text-base font-medium"
              >
                Jelajahi Demo Publik
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FOOTER                                                    */}
      {/* ============================================================ */}
      <footer id="kontak" className="mt-16 border-t border-[#E5DAC9] bg-[#FAF6F0]/90 py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <span className="font-serif text-2xl font-bold text-[#231C16]">
              MomenKita
            </span>
            <p className="text-xs sm:text-sm text-[#6E5D4F] mt-2 max-w-sm leading-relaxed">
              Platform dokumentasi interaktif berbasis QR untuk pernikahan dan event berkelas di Indonesia.
              Dirancang untuk kemudahan tamu dan keindahan arsip kenangan abadi.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-[#231C16] uppercase tracking-wider mb-3">Navigasi</h4>
            <ul className="space-y-2 text-xs text-[#6E5D4F]">
              <li><Link href="#fitur" className="hover:text-[#9E7B4F] transition">Fitur Utama</Link></li>
              <li><Link href="#wedding-organizer" className="hover:text-[#9E7B4F] transition">Untuk Wedding Organizer</Link></li>
              <li><Link href="#cara-kerja" className="hover:text-[#9E7B4F] transition">Cara Kerja</Link></li>
              <li><Link href="#harga" className="hover:text-[#9E7B4F] transition">Daftar Harga</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-[#231C16] uppercase tracking-wider mb-3">Bantuan & Kontak</h4>
            <ul className="space-y-2 text-xs text-[#6E5D4F]">
              <li>WhatsApp: +62 812-3456-7890</li>
              <li>Email: halo@momenkita.id</li>
              <li>Jakarta & Surabaya, Indonesia</li>
              <li className="pt-2 text-[11px] text-[#9E7B4F]">Tersedia Konsultasi Paket WO</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#E5DAC9]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E7D6F] gap-3">
          <p>© {new Date().getFullYear()} MomenKita. Seluruh hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#231C16] transition">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-[#231C16] transition">Syarat & Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
