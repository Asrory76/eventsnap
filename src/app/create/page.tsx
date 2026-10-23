"use client";

// Halaman: buat event baru -> dapat eventId -> tampil tombol camera & QR.
import { signIn, createEvent, getEventCameraUrl } from "@/lib/services";
import { PicMeError } from "@/lib/errors";
import { useState } from "react";
import Link from "next/link";
import QrBadge from "@/components/QrBadge";

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await signIn();
      const newEvent = await createEvent(title);
      setEventId(newEvent.id);
    } catch (e) {
      if (e instanceof PicMeError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setBusy(false);
    }
  }

  /* ---- Success state ---- */
  if (eventId) {
    const cameraUrl = getEventCameraUrl(eventId);

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(cameraUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error(e);
      }
    };

    return (
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col items-center justify-center p-6 sm:p-12 text-[#ffffff]">
        {/* Geometric indicator mark */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center border border-white/40 bg-[#111111]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#cfcfcf]">
            INITIALIZATION COMPLETE
          </span>
          <h1 className="mt-2 font-['Unbounded'] text-2xl sm:text-3xl font-bold uppercase tracking-[0.067em] text-[#ffffff]">
            ACARA BERHASIL DIBUAT
          </h1>
          <p className="mt-3 text-xs sm:text-sm uppercase tracking-[0.132em] text-[#cfcfcf]">
            Bagikan QR code akses di bawah ke seluruh tamu yang hadir.
          </p>
        </div>

        {/* QR Code Frame per DESIGN.md (0px radius, 1px border) */}
        <div className="w-full surface-carbon p-8 flex flex-col items-center border border-white/20 mb-6">
          <div className="border border-white/30 p-4 bg-white">
            <QrBadge value={cameraUrl} size={220} />
          </div>
          <p className="mt-5 text-center text-[11px] uppercase tracking-[0.188em] text-[#cfcfcf] max-w-sm">
            Scan QR via smartphone untuk membuka akses langsung ke viewfinder kamera tanpa instalasi.
          </p>
        </div>

        {/* Shareable Link Box */}
        <div className="w-full border border-white/20 bg-[#111111] p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.188em] text-[#cfcfcf]">
              DIRECT CAMERA URL
            </span>
            <button
              onClick={copyToClipboard}
              className="text-[11px] uppercase tracking-[0.15em] text-white hover:underline underline-offset-4 cursor-pointer"
            >
              {copied ? "TERSALIN ✓" : "SALIN TAUTAN"}
            </button>
          </div>
          <code className="block overflow-x-auto text-xs text-white/90 bg-black p-3 border border-white/10 font-mono">
            {cameraUrl}
          </code>
        </div>

        {/* Actions per DESIGN.md (Ghost Buttons) */}
        <div className="flex w-full flex-col gap-4">
          <Link
            href={`/events/${eventId}/camera`}
            className="btn-ghost w-full"
          >
            BUKA KAMERA INSTAN →
          </Link>

          <Link
            href={`/events/${eventId}`}
            className="btn-ghost-ash w-full"
          >
            LIHAT LIVE ALBUM
          </Link>

          <Link
            href="/dashboard"
            className="text-center text-xs uppercase tracking-[0.188em] text-[#cfcfcf] hover:text-white transition mt-2 underline underline-offset-4"
          >
            ← KEMBALI KE DAFTAR ACARA
          </Link>
        </div>
      </main>
    );
  }

  /* ---- Create form ---- */
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col justify-center p-6 sm:p-12 text-[#ffffff]">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#cfcfcf]">
          DEPLOY NEW PORTAL
        </span>
        <h1 className="mt-2 font-['Unbounded'] text-2xl sm:text-4xl font-bold uppercase tracking-[0.067em] text-[#ffffff]">
          BUAT ACARA BARU
        </h1>
        <p className="mt-3 text-xs sm:text-sm uppercase tracking-[0.132em] text-[#cfcfcf]">
          Masukkan parameter nama acara untuk meng-generate link & QR kolaboratif.
        </p>
      </div>

      {/* Form Container per DESIGN.md: Carbon surface, 0px radius, 1px border */}
      <div className="surface-carbon p-8 sm:p-10 border border-white/20">
        <label
          htmlFor="event-title"
          className="block text-xs uppercase tracking-[0.188em] text-[#cfcfcf] mb-3"
        >
          NAMA ACARA // EVENT TITLE
        </label>

        <input
          id="event-title"
          className="w-full bg-[#000000] border border-white/30 px-5 py-4 text-sm text-[#ffffff] uppercase tracking-[0.12em] placeholder:text-[#666666] outline-none transition focus:border-white focus:ring-0"
          placeholder="CONTOH: PERNIKAHAN RANI & BIMA"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim().length > 0 && !busy) {
              void submit();
            }
          }}
        />

        <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.15em] text-[#666666]">
          <span>MAKSIMAL 120 KARAKTER</span>
          <span>{title.length}/120</span>
        </div>

        {error && (
          <div className="mt-4 border border-white/40 bg-black p-4 text-xs text-white uppercase tracking-[0.1em]">
            ERROR // {error}
          </div>
        )}

        {/* Ghost CTA Button for submit */}
        <button
          className="btn-ghost mt-8 w-full disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={busy || title.trim().length === 0}
          onClick={submit}
        >
          {busy ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block h-3.5 w-3.5 animate-spin border border-white border-t-transparent" />
              MEMPROSES INISIALISASI…
            </span>
          ) : (
            "GENERATE QR CODE & ACARA →"
          )}
        </button>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="text-xs uppercase tracking-[0.188em] text-[#cfcfcf] hover:text-white transition underline underline-offset-4"
        >
          ← KEMBALI KE DAFTAR ACARA
        </Link>
      </div>
    </main>
  );
}
