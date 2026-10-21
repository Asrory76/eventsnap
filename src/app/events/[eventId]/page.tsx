"use client";

// Album publik EventSnap — grid foto realtime dengan mode Presenter / Live Slideshow,
// download foto, QR badge popup, dan share link.
import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import {
  subscribePhotos,
  getEvent,
  deletePhoto,
  type EventDoc,
  type PhotoDoc,
} from "@/lib/events";
import { signIn } from "@/lib/auth";
import QrBadge from "@/components/QrBadge";

export default function AlbumPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<AlbumSkeleton />}>
      <Album eventIdPromise={params} />
    </Suspense>
  );
}

function AlbumSkeleton() {
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="h-8 w-56 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-36 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    </main>
  );
}

function Album({
  eventIdPromise,
}: {
  eventIdPromise: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(eventIdPromise);
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [photos, setPhotos] = useState<PhotoDoc[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<PhotoDoc | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeletePhoto = async (photo: PhotoDoc) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus foto ini dari album? Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmed) return;

    setDeletingId(photo.id);
    try {
      await deletePhoto(eventId, photo.id);
      setLightbox(null);
    } catch (err) {
      alert(
        "Gagal menghapus foto: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        await signIn();
        const ev = await getEvent(eventId);
        if (!ev) {
          setError("Acara tidak ditemukan. Periksa kembali tautan Anda.");
          setLoading(false);
          return;
        }
        setEvent(ev);
        unsub = subscribePhotos(eventId, setPhotos, (e) => {
          console.error(e);
          setError("Gagal memuat galeri foto realtime.");
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => unsub?.();
  }, [eventId]);

  // Slideshow interval
  useEffect(() => {
    if (slideshowIndex === null || !photos || photos.length === 0) return;
    const timer = setInterval(() => {
      setSlideshowIndex((prev) =>
        prev === null ? 0 : (prev + 1) % photos.length
      );
    }, 4000);
    return () => clearInterval(timer);
  }, [slideshowIndex, photos]);

  // keyboard shortcuts (Escape to close lightbox/slideshow, Arrow keys)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightbox(null);
        setSlideshowIndex(null);
      }
      if (slideshowIndex !== null && photos && photos.length > 0) {
        if (e.key === "ArrowRight") {
          setSlideshowIndex((prev) =>
            prev === null ? 0 : (prev + 1) % photos.length
          );
        } else if (e.key === "ArrowLeft") {
          setSlideshowIndex((prev) =>
            prev === null ? 0 : (prev - 1 + photos.length) % photos.length
          );
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slideshowIndex, photos]);

  const copyShareLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title || "Album Foto EventSnap",
          text: `Lihat dan bagikan foto acara di ${event?.title}!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const downloadPhoto = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Gagal download:", err);
      window.open(url, "_blank");
    }
  };

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50/80 p-8 shadow-sm backdrop-blur-sm dark:border-red-900/40 dark:bg-red-950/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl dark:bg-red-900/30">
            ⚠️
          </div>
          <h2 className="mb-2 text-lg font-bold text-red-900 dark:text-red-200">
            Gagal Memuat Acara
          </h2>
          <p className="mb-6 text-sm text-red-700 dark:text-red-300">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  if (loading || !event) {
    return <AlbumSkeleton />;
  }

  const cameraUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${eventId}/camera`
      : "";

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl p-4 sm:p-8">
      {/* ---------- HEADER ---------- */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {event.title}
            </h1>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              📸 {photos?.length ?? 0} foto
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Realtime Sync
            </span>
            {event.createdAt && (
              <>
                <span>•</span>
                <span>
                  {new Date(event.createdAt.seconds * 1000).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Slideshow Button */}
          {photos && photos.length > 0 && (
            <button
              onClick={() => setSlideshowIndex(0)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-sm transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Mulai Live Slideshow untuk proyektor"
            >
              <span>📺 Live Wall</span>
            </button>
          )}

          {/* Share / Copy Link */}
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-sm transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span>{copied ? "✓ Tersalin!" : "🔗 Bagikan"}</span>
          </button>

          {/* QR toggle */}
          <button
            onClick={() => setShowQr(!showQr)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-sm transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span>📱 {showQr ? "Tutup QR" : "QR Code"}</span>
          </button>

          {/* Open Camera */}
          <Link
            href={`/events/${eventId}/camera`}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
          >
            <span>📷 Buka Kamera</span>
          </Link>
        </div>
      </header>

      {/* ---------- QR CODE MODAL / PANEL ---------- */}
      {showQr && (
        <div className="mb-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 p-6 shadow-sm backdrop-blur-md dark:border-purple-500/10 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              Akses Langsung Tamu
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Scan untuk Mulai Berfoto
            </h2>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Arahkan kamera smartphone ke QR Code ini untuk membuka halaman kamera instan tanpa install aplikasi.
            </p>
            <div className="my-5 rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 dark:bg-white">
              <QrBadge value={cameraUrl} size={180} />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-1.5 shadow-sm dark:bg-zinc-800/80">
              <code className="text-[11px] text-zinc-600 dark:text-zinc-300">
                {cameraUrl}
              </code>
              <button
                onClick={copyShareLink}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Salin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- EMPTY STATE ---------- */}
      {photos?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-zinc-200/80 bg-white/80 text-4xl shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
              ✨
            </div>
          </div>
          <div className="max-w-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Belum Ada Foto
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Jadilah orang pertama yang mengabadikan momen di acara ini! Ketuk
              tombol di bawah atau scan QR Code.
            </p>
          </div>
          <Link
            href={`/events/${eventId}/camera`}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/35 active:scale-95"
          >
            <span>📸 Ambil Foto Pertama</span>
          </Link>
        </div>
      )}

      {/* ---------- PHOTO MASONRY / GRID ---------- */}
      {photos && photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setLightbox(p)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 shadow-sm ring-1 ring-zinc-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-800 dark:ring-zinc-800"
              style={{
                animation: `fadeIn 0.35s ease-out ${Math.min(i * 30, 600)}ms both`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt="Foto acara"
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-left translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-[11px] font-medium text-white/90">
                  {p.createdAt
                    ? new Date(p.createdAt.seconds * 1000).toLocaleString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        }
                      )
                    : "Baru saja"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ---------- LIGHTBOX VIEWER ---------- */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative flex max-h-[92vh] max-w-[92vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar */}
            <div className="mb-3 flex w-full items-center justify-between px-1">
              <span className="text-xs text-white/70">
                {lightbox.createdAt
                  ? new Date(
                      lightbox.createdAt.seconds * 1000
                    ).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Momen baru diunggah"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeletePhoto(lightbox)}
                  disabled={deletingId === lightbox.id}
                  className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 backdrop-blur-md transition hover:bg-red-500/35 active:scale-95 disabled:opacity-50"
                  title="Hapus foto dari album"
                >
                  <span>
                    {deletingId === lightbox.id ? "Menghapus…" : "🗑️ Hapus"}
                  </span>
                </button>
                <button
                  onClick={() =>
                    downloadPhoto(
                      lightbox.url,
                      `eventsnap_${event.title.toLowerCase().replace(/\s+/g, "_")}_${lightbox.id}.jpg`
                    )
                  }
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                >
                  <span>⬇️ Unduh</span>
                </button>
                <button
                  onClick={() => setLightbox(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt="Foto acara fullscreen"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      )}

      {/* ---------- LIVE SLIDESHOW / PRESENTER MODE ---------- */}
      {slideshowIndex !== null && photos && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Top presenter banner */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
                <span className="text-xs font-bold tracking-wider uppercase text-white/90">
                  Live Wall Slideshow
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white/80">
                {event.title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/75 backdrop-blur-md">
                {slideshowIndex + 1} / {photos.length}
              </span>
              <button
                onClick={() => setSlideshowIndex(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm text-white backdrop-blur-md hover:bg-white/30"
                title="Keluar dari Presenter Mode (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Slideshow image container */}
          <div className="flex flex-1 items-center justify-center p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={photos[slideshowIndex].id}
              src={photos[slideshowIndex].url}
              alt="Slideshow"
              className="max-h-[85vh] max-w-full object-contain shadow-2xl transition duration-700 ease-in-out"
            />
          </div>

          {/* Bottom QR hint */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between p-6 bg-gradient-to-t from-black/80 to-transparent text-white/70 text-xs">
            <span>Tekan ← / → untuk navigasi manual, Esc untuk keluar</span>
            <span>Scan QR untuk ikut menyumbang foto realtime</span>
          </div>
        </div>
      )}
    </main>
  );
}
