"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Animated counter (count-up effect)                                 */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ------------------------------------------------------------------ */
/*  Feature card data                                                  */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: "📱",
    title: "Scan & Snap",
    desc: "Tamu cukup scan QR code, langsung buka kamera dan foto — tanpa install aplikasi.",
  },
  {
    icon: "⚡",
    title: "Realtime Album",
    desc: "Semua foto muncul langsung di album bersama secara realtime.",
  },
  {
    icon: "🔒",
    title: "Aman & Privat",
    desc: "Setiap acara punya album terpisah. Hanya yang punya link/QR yang bisa akses.",
  },
  {
    icon: "☁️",
    title: "Cloud Storage",
    desc: "Foto tersimpan aman di cloud. Tidak hilang meski HP tamu berganti.",
  },
  {
    icon: "🎨",
    title: "Tanpa Ribet",
    desc: "Buat acara dalam hitungan detik. Bagikan QR ke tamu. Selesai.",
  },
  {
    icon: "📷",
    title: "Kamera HD",
    desc: "Mendukung kamera depan & belakang dengan resolusi tinggi.",
  },
];

/* ------------------------------------------------------------------ */
/*  Steps data                                                         */
/* ------------------------------------------------------------------ */
const steps = [
  {
    num: "01",
    title: "Buat Acara",
    desc: "Masukkan nama acara Anda — wedding, ulang tahun, reuni, apapun.",
  },
  {
    num: "02",
    title: "Bagikan QR Code",
    desc: "Cetak atau tampilkan QR code ke semua tamu yang hadir.",
  },
  {
    num: "03",
    title: "Tamu Foto",
    desc: "Tamu scan QR → buka kamera → jepret. Sesimpel itu.",
  },
  {
    num: "04",
    title: "Nikmati Album",
    desc: "Semua foto terkumpul otomatis dalam satu album indah.",
  },
];

/* ------------------------------------------------------------------ */
/*  Home page                                                          */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // trigger entrance animations after mount
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* animated gradient background blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-[120px] dark:opacity-30"
          style={{
            background:
              "radial-gradient(circle, #6366f1 0%, #a855f7 40%, #ec4899 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full opacity-15 blur-[100px] dark:opacity-25"
          style={{
            background:
              "radial-gradient(circle, #06b6d4 0%, #3b82f6 100%)",
          }}
        />

        {/* content */}
        <div
          className="relative z-10 flex flex-col items-center gap-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-1.5 text-sm font-medium backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-800/70">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Album foto kolaboratif
          </span>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Event
            </span>
            Snap
          </h1>

          <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
            Satu QR code. Semua tamu jadi fotografer.
            <br className="hidden sm:block" />
            Kumpulkan momen indah acara Anda dalam satu album bersama.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/create"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.97]"
            >
              <span className="relative z-10">Buat Acara Gratis →</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 transition group-hover:opacity-100" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border-2 border-zinc-200 px-8 py-4 font-semibold transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.97] dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            >
              Album Saya
            </Link>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            className="text-zinc-400"
          >
            <path
              d="M12 5v14m0 0l-6-6m6 6l6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Cara Kerja
          </h2>
          <p className="mx-auto mb-16 max-w-md text-center text-zinc-500">
            Empat langkah simpel untuk mengumpulkan semua momen.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${200 + i * 100}ms`,
                }}
              >
                <span className="mb-3 block text-4xl font-black text-zinc-100 dark:text-zinc-800">
                  {s.num}
                </span>
                <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-zinc-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Fitur Unggulan
          </h2>
          <p className="mx-auto mb-16 max-w-md text-center text-zinc-500">
            Dirancang untuk pengalaman berbagi foto yang mudah dan menyenangkan.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 80}ms`,
                }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-2xl transition group-hover:scale-110 dark:bg-zinc-800">
                  {f.icon}
                </div>
                <h3 className="mb-2 font-bold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATS (social proof) ==================== */}
      <section className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-20 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-12 text-center">
          <Stat value={500} suffix="+" label="Acara dibuat" />
          <Stat value={10000} suffix="+" label="Foto terkumpul" />
          <Stat value={99} suffix="%" label="Kepuasan pengguna" />
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="relative overflow-hidden px-6 py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10 dark:opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Siap Mengabadikan Momen?
          </h2>
          <p className="text-zinc-500">
            Buat acara sekarang dan mulai kumpulkan foto dari semua tamu.
            Gratis, tanpa registrasi.
          </p>
          <Link
            href="/create"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-10 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.97]"
          >
            <span className="relative z-10">Buat Acara Sekarang →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 transition group-hover:opacity-100" />
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-zinc-100 px-6 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-zinc-400 sm:flex-row">
          <p>© 2026 EventSnap. Dibuat dengan ❤️</p>
          <div className="flex gap-6">
            <Link href="/create" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
              Buat Acara
            </Link>
            <Link href="/dashboard" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
              Album Saya
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat component with count-up                                       */
/* ------------------------------------------------------------------ */
function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const count = useCountUp(value, 1500);
  return (
    <div>
      <p className="text-4xl font-extrabold">
        {count.toLocaleString()}
        <span className="text-purple-500">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}
