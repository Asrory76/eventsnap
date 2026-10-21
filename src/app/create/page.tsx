"use client";

// Halaman: buat event baru -> dapat eventId -> tampil tombol camera & QR.
import { signIn } from "@/lib/auth";
import { createEvent } from "@/lib/events";
import { useState } from "react";
import Link from "next/link";
import QrBadge from "@/components/QrBadge";

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      // MVP: guest session anon dibuat otomatis kalau belum ada.
      // (Produksi: ganti signInAnon -> signInWithPopup(Google) untuk creator.)
      await signIn();
      const id = await createEvent(title);
      setEventId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  /* ---- Success state ---- */
  if (eventId) {
    const albumUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/events/${eventId}`;
    const cameraUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/events/${eventId}/camera`;
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center gap-8 p-6 sm:p-8">
        {/* Success badge */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl dark:bg-green-900/30">
          ✅
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Acara Berhasil Dibuat!</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Bagikan QR code di bawah ke para tamu.
          </p>
        </div>

        {/* QR Code card */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <QrBadge value={cameraUrl} size={200} />
          <p className="max-w-xs text-center text-xs text-zinc-500">
            Cetak atau share QR di atas ke tamu → langsung buka kamera untuk
            ambil foto.
          </p>
        </div>

        {/* Album link */}
        <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-xs font-medium text-zinc-400">Link Album</p>
          <code className="block overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
            {albumUrl}
          </code>
        </div>

        {/* Action buttons */}
        <div className="flex w-full flex-col gap-3">
          <Link
            href={`/events/${eventId}/camera`}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl active:scale-[0.97]"
          >
            📸 Buka Kamera
          </Link>
          <Link
            href={`/events/${eventId}`}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 px-6 py-4 font-semibold transition hover:bg-zinc-50 active:scale-[0.97] dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            🖼️ Lihat Album
          </Link>
          <Link
            href="/dashboard"
            className="text-center text-sm text-zinc-500 underline transition hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            ← Kembali ke daftar acara
          </Link>
        </div>
      </main>
    );
  }

  /* ---- Create form ---- */
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center gap-8 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-3xl">
          🎉
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Buat Acara Baru</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Masukkan nama acara, lalu bagikan QR code ke tamu.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <label
          htmlFor="event-title"
          className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          Nama Acara
        </label>
        <input
          id="event-title"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base outline-none transition focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-purple-400 dark:focus:bg-zinc-900"
          placeholder="Contoh: Pernikahan Rani & Bima"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim().length > 0 && !busy) {
              void submit();
            }
          }}
        />
        <p className="mt-2 text-right text-xs text-zinc-400">
          {title.length}/120
        </p>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
          disabled={busy || title.trim().length === 0}
          onClick={submit}
        >
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Membuat…
            </span>
          ) : (
            "Buat Acara →"
          )}
        </button>
      </div>

      <Link
        href="/dashboard"
        className="text-center text-sm text-zinc-500 underline transition hover:text-zinc-800 dark:hover:text-zinc-300"
      >
        ← Kembali ke daftar acara
      </Link>
    </main>
  );
}
