"use client";

// Album publik PicMe — Galeri Album Kolaboratif Real-Time & Ucapan Tamu
import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import {
  getEvent,
  deletePhoto,
  signIn,
  getEventCameraUrl,
  subscribePhotos,
  subscribeComments,
  addComment,
} from "@/lib/services";
import { type EventDoc, type PhotoDoc, type CommentDoc } from "@/types";
import { PicMeError } from "@/lib/errors";
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
    <main className="mx-auto max-w-6xl p-6 sm:p-12 text-[#ffffff]">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="h-8 w-64 animate-pulse bg-white/10" />
          <div className="mt-3 h-4 w-40 animate-pulse bg-white/5" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 animate-pulse border border-white/10" />
          <div className="h-10 w-36 animate-pulse border border-white/10" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="aspect-square animate-pulse bg-black" />
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
  const [photos, setPhotos] = useState<PhotoDoc[]>([]);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<PhotoDoc | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form input ucapan & doa
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);

  // Active Tab: "photos" (galeri foto) vs "wishes" (ucapan & doa)
  const [activeTab, setActiveTab] = useState<"photos" | "wishes">("photos");

  const handleDeletePhoto = async (photo: PhotoDoc) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus frame foto ini dari album? Tindakan tidak dapat dibatalkan."
    );
    if (!confirmed) return;

    setDeletingId(photo.id);
    try {
      await deletePhoto(eventId, photo.id, photo.storagePath);
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmittingComment(true);
    setCommentFeedback(null);

    try {
      await addComment({
        eventId,
        authorName: authorName.trim() || undefined,
        message: message.trim(),
        authorUid: currentUid || undefined,
      });
      setMessage("");
      setCommentFeedback("Ucapan dan doa berhasil dikirim!");
      setTimeout(() => setCommentFeedback(null), 3000);
    } catch (err) {
      setCommentFeedback(
        err instanceof PicMeError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengirim ucapan."
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  useEffect(() => {
    let unsubPhotos: (() => void) | undefined;
    let unsubComments: (() => void) | undefined;

    (async () => {
      try {
        const uid = await signIn();
        setCurrentUid(uid);

        const ev = await getEvent(eventId);
        if (!ev) {
          setError("Acara tidak ditemukan. Periksa kembali tautan Anda.");
        } else {
          setEvent(ev);
        }

        // Subscribe real-time foto
        unsubPhotos = subscribePhotos(
          eventId,
          (livePhotos) => setPhotos(livePhotos),
          (err) => console.error("Error live photos:", err)
        );

        // Subscribe real-time ucapan/komentar
        unsubComments = subscribeComments(eventId, {
          limitCount: 50,
          onUpdate: (liveComments) => setComments(liveComments),
          onError: (err) => console.error("Error live comments:", err),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      unsubPhotos?.();
      unsubComments?.();
    };
  }, [eventId]);

  // Keyboard shortcut: Esc to close lightbox
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightbox(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const copyShareLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title || "PICME ALBUM",
          text: `Akses galeri foto bersama: ${event?.title}`,
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
      <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center p-6 text-center text-[#ffffff]">
        <div className="max-w-md surface-carbon p-8 border border-white/20">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#cfcfcf]">
            SYSTEM ALERT
          </span>
          <h2 className="mt-2 font-['Unbounded'] text-lg font-bold uppercase tracking-[0.067em] text-[#ffffff]">
            GAGAL MEMUAT ACARA
          </h2>
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#cfcfcf] leading-relaxed">
            {error}
          </p>
          <div className="mt-6">
            <Link href="/" className="btn-ghost-sm">
              ← KEMBALI KE BERANDA
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !event) {
    return <AlbumSkeleton />;
  }

  const cameraUrl = getEventCameraUrl(eventId);

  return (
    <main className="mx-auto min-h-[calc(100vh-5rem)] max-w-6xl p-6 sm:p-12 text-[#ffffff]">
      {/* ---------- HEADER ---------- */}
      <header className="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#cfcfcf]">
            COLLABORATIVE ALBUM // PICME
          </span>
          <h1 className="mt-2 font-['Unbounded'] text-2xl sm:text-3xl font-bold uppercase tracking-[0.067em] text-[#ffffff]">
            {event.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.188em] text-[#cfcfcf]">
            <span className="text-white font-medium">
              {photos.length} FRAME FOTO
            </span>
            <span className="h-1 w-1 bg-white/40" />
            {/* Foto Quota Counter */}
            <span className="text-[#C5A059] font-medium">
              {event.usedPhotoQuota} / {event.maxPhotoQuota} KUOTA FRAME
            </span>
            <span className="h-1 w-1 bg-white/40" />
            <span className="inline-flex items-center gap-2 text-white">
              <span className="h-1.5 w-1.5 bg-white animate-pulse" />
              LIVE SYNC
            </span>
            {event.createdAt && (
              <>
                <span className="h-1 w-1 bg-white/40" />
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

        {/* Action Buttons (0px radius ghost style) */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copyShareLink}
            className="btn-ghost-ash"
          >
            {copied ? "TERSALIN ✓" : "BAGIKAN"}
          </button>

          <button
            onClick={() => setShowQr(!showQr)}
            className="btn-ghost-ash"
          >
            {showQr ? "TUTUP QR" : "QR CODE"}
          </button>

          <Link
            href={`/events/${eventId}/camera`}
            className="btn-ghost-sm"
          >
            + BUKA KAMERA
          </Link>
        </div>
      </header>

      {/* ---------- QR CODE MODAL / PANEL ---------- */}
      {showQr && (
        <div className="mb-10 surface-carbon p-8 border border-white/20">
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#cfcfcf]">
              TAMU ACCESS KEY
            </span>
            <h2 className="mt-2 font-['Unbounded'] text-lg font-bold uppercase tracking-[0.067em] text-[#ffffff]">
              SCAN UNTUK MEMBUKA KAMERA
            </h2>
            <p className="mt-2 max-w-md text-xs uppercase tracking-[0.132em] text-[#cfcfcf]">
              Arahkan kamera smartphone ke QR Code di bawah untuk membuka viewfinder kamera instan tanpa registrasi.
            </p>

            <div className="my-6 border border-white/40 p-4 bg-white">
              <QrBadge value={cameraUrl} size={180} />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 bg-black p-3 border border-white/20">
              <code className="text-xs font-mono text-white/90">
                {cameraUrl}
              </code>
              <button
                onClick={copyShareLink}
                className="text-xs uppercase tracking-[0.15em] text-white underline underline-offset-4 cursor-pointer"
              >
                SALIN URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- TABS NAVIGATION ---------- */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 pb-1">
        <button
          onClick={() => setActiveTab("photos")}
          className={`px-5 py-2.5 font-['Unbounded'] text-xs uppercase tracking-[0.15em] transition border-b-2 cursor-pointer ${
            activeTab === "photos"
              ? "border-white text-white font-bold"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          GALERI FOTO ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab("wishes")}
          className={`px-5 py-2.5 font-['Unbounded'] text-xs uppercase tracking-[0.15em] transition border-b-2 cursor-pointer ${
            activeTab === "wishes"
              ? "border-white text-white font-bold"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          UCAPAN &amp; DOA TAMU ({comments.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: GALERI FOTO                                           */}
      {/* ============================================================ */}
      {activeTab === "photos" && (
        <>
          {/* Empty state */}
          {photos.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center surface-carbon border border-dashed border-white/20 p-8">
              <div className="flex h-14 w-14 items-center justify-center border border-white/30 bg-black">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                >
                  <rect x="3" y="3" width="18" height="18" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div>
                <h2 className="font-['Unbounded'] text-lg font-bold uppercase tracking-[0.08em] text-[#ffffff]">
                  BELUM ADA FRAME FOTO
                </h2>
                <p className="mt-2 text-xs uppercase tracking-[0.132em] text-[#cfcfcf] max-w-sm">
                  Jadilah kontributor pertama di album ini. Buka kamera browser atau bagikan QR ke tamu.
                </p>
              </div>
              <Link
                href={`/events/${eventId}/camera`}
                className="btn-ghost mt-2"
              >
                AMBIL FOTO PERTAMA →
              </Link>
            </div>
          )}

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-px bg-white/20 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 border border-white/20">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setLightbox(p)}
                  className="group relative aspect-square overflow-hidden bg-black text-left cursor-pointer focus:outline-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt="Foto acara"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Minimalist Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 p-3 flex flex-col justify-between">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-white/70">
                      #{String(i + 1).padStart(3, "0")}
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white">
                        {p.uploaderName ? `DARI: ${p.uploaderName}` : (
                          p.createdAt
                            ? new Date(p.createdAt.seconds * 1000).toLocaleTimeString(
                                "id-ID",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : "BARU"
                        )}
                      </p>
                      <span className="text-[9px] tracking-[0.188em] uppercase text-white/60">
                        LIHAT FRAME →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* TAB 2: UCAPAN & DOA TAMU                                      */}
      {/* ============================================================ */}
      {activeTab === "wishes" && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Form input ucapan */}
          <div className="lg:col-span-5 surface-carbon p-6 sm:p-8 border border-white/20">
            <h2 className="font-['Unbounded'] text-sm sm:text-base font-bold uppercase tracking-[0.1em] text-white mb-2">
              KIRIM UCAPAN &amp; DOA
            </h2>
            <p className="text-xs text-[#cfcfcf] mb-5">
              Sampaikan pesan bahagia dan doa terbaik Anda untuk kedua mempelai di buku tamu digital ini.
            </p>

            <form onSubmit={handleAddComment} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#cfcfcf] mb-1.5">
                  NAMA ANDA (OPSIONAL)
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Contoh: Sarah &amp; Keluarga"
                  maxLength={60}
                  className="w-full bg-black border border-white/25 px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#cfcfcf] mb-1.5">
                  PESAN UCAPAN &amp; DOA *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan doa restu Anda di sini..."
                  maxLength={500}
                  required
                  className="w-full bg-black border border-white/25 px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-white focus:outline-none resize-none"
                />
                <div className="mt-1 text-right text-[10px] text-white/40 font-mono">
                  {message.length}/500
                </div>
              </div>

              {commentFeedback && (
                <div className="p-3 border border-white/30 bg-black text-xs text-[#E5C794]">
                  {commentFeedback}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingComment || !message.trim()}
                className="btn-ghost mt-2 disabled:opacity-40"
              >
                {submittingComment ? "MENGIRIMKAN…" : "KIRIM UCAPAN →"}
              </button>
            </form>
          </div>

          {/* Daftar ucapan real-time */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <h2 className="font-['Unbounded'] text-sm font-semibold uppercase tracking-[0.1em] text-white mb-2">
              BUKU TAMU DIGITAL ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <div className="surface-carbon p-8 border border-white/15 text-center text-xs uppercase tracking-[0.15em] text-[#cfcfcf]">
                Belum ada ucapan. Jadilah yang pertama mengirimkan doa restu!
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="surface-carbon p-5 border border-white/15 hover:border-white/30 transition"
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                      <span className="font-serif-luxury text-sm font-semibold text-[#E5C794]">
                        {c.authorName || "Tamu"}
                      </span>
                      <span className="text-[10px] font-mono text-white/50">
                        {c.createdAt
                          ? new Date(c.createdAt.seconds * 1000).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "Baru saja"}
                      </span>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
                      {c.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- LIGHTBOX VIEWER ---------- */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative flex max-h-[92vh] max-w-[92vw] flex-col items-center surface-carbon border border-white/30 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar */}
            <div className="mb-4 flex w-full items-center justify-between border-b border-white/15 pb-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.188em] text-[#cfcfcf]">
                {lightbox.createdAt
                  ? new Date(lightbox.createdAt.seconds * 1000).toLocaleString(
                      "id-ID",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "MOMEN DIUNGGAH"}
              </span>

              <div className="flex items-center gap-3">
                {/* Tombol HAPUS hanya ditampilkan untuk Host event atau pemilik foto */}
                {currentUid &&
                  (currentUid === event.hostId ||
                    currentUid === lightbox.uploadedBy) && (
                    <button
                      onClick={() => handleDeletePhoto(lightbox)}
                      disabled={deletingId === lightbox.id}
                      className="btn-ghost-sm text-xs border-red-500/60 text-red-300 hover:bg-red-950/40"
                      title="Hapus foto dari album"
                    >
                      {deletingId === lightbox.id ? "MENGHAPUS…" : "HAPUS"}
                    </button>
                  )}

                <button
                  onClick={() =>
                    downloadPhoto(
                      lightbox.url,
                      `picme_${event.title.toLowerCase().replace(/\s+/g, "_")}_${lightbox.id}.jpg`
                    )
                  }
                  className="btn-ghost-sm text-xs"
                >
                  UNDUH
                </button>

                <button
                  onClick={() => setLightbox(null)}
                  className="flex h-8 w-8 items-center justify-center border border-white/30 text-white hover:border-white cursor-pointer"
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
              className="max-h-[75vh] max-w-full object-contain border border-white/10"
            />
          </div>
        </div>
      )}
    </main>
  );
}
