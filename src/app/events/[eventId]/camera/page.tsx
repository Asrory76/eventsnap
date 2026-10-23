"use client";

import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getEvent, uploadPhoto, signIn } from "@/lib/services";
import { type EventDoc } from "@/types";
import {
  PicMeError,
  QuotaExceededError,
  EventClosedError,
  InvalidMediaError,
} from "@/lib/errors";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type ShotStatus = "pending" | "uploading" | "done" | "error";

type Shot = {
  id: string;
  blob: Blob;
  previewUrl: string;
  status: ShotStatus;
};

/* ------------------------------------------------------------------ */
/*  Wrapper — unwrap params promise                                    */
/* ------------------------------------------------------------------ */
export default function CameraPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CameraInner eventIdPromise={params} />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6 text-white bg-black">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 border border-white border-t-transparent animate-spin" />
        <div>
          <p className="font-['Unbounded'] text-sm uppercase tracking-[0.15em] text-white">
            MENYIAPKAN OPTIK KAMERA…
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#cfcfcf]">
            MEMUAT DETAIL ACARA & AKSES PERANGKAT
          </p>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
function CameraInner({
  eventIdPromise,
}: {
  eventIdPromise: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(eventIdPromise);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<EventDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [joined, setJoined] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [shots, setShots] = useState<Shot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // --- bootstrap: sign-in + fetch event ---
  useEffect(() => {
    (async () => {
      try {
        await signIn();
        const ev = await getEvent(eventId);
        if (!ev) setError("Acara tidak ditemukan. Periksa tautan atau scan ulang QR.");
        else setEvent(ev);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [eventId]);

  // --- camera start/stop ---
  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraReady(true);
      } catch (e) {
        setError(
          `Kamera tidak dapat diakses: ${
            e instanceof Error ? e.message : String(e)
          }. Pastikan izin kamera telah diberikan.`
        );
      }
    },
    []
  );

  // --- flip camera ---
  const flipCamera = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    if (cameraReady) {
      void startCamera(next);
    }
  }, [facingMode, cameraReady, startCamera]);

  // --- capture photo ---
  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    // flash animation
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 120);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const shot: Shot = {
          id: `shot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          blob,
          previewUrl: URL.createObjectURL(blob),
          status: "pending",
        };
        setShots((s) => [shot, ...s]);
      },
      "image/jpeg",
      0.92
    );
  }, [facingMode]);

  // --- file picker ---
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const newShots: Shot[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newShots.push({
          id: `file_${Date.now()}_${i}`,
          blob: file,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
        });
      }
      setShots((s) => [...newShots, ...s]);
      e.target.value = "";
    },
    []
  );

  // --- remove single shot ---
  const removeShot = useCallback((id: string) => {
    setShots((s) => s.filter((item) => item.id !== id));
  }, []);

  // --- upload single shot ---
  const uploadShot = useCallback(
    async (shotId: string) => {
      setUploading(true);
      setShots((s) =>
        s.map((p) => (p.id === shotId ? { ...p, status: "uploading" } : p))
      );
      try {
        const target = shots.find((s) => s.id === shotId);
        if (!target) return;
        await uploadPhoto(eventId, target.blob, `snap_${Date.now()}.jpg`);
        setShots((s) =>
          s.map((p) => (p.id === shotId ? { ...p, status: "done" } : p))
        );
      } catch (e) {
        console.error("Upload error:", e);
        const message =
          e instanceof PicMeError
            ? e.message
            : e instanceof Error
            ? e.message
            : "Gagal mengunggah foto ke album.";
        setError(message);
        setShots((s) =>
          s.map((p) => (p.id === shotId ? { ...p, status: "error" } : p))
        );
      } finally {
        setUploading(false);
      }
    },
    [shots, eventId]
  );

  // --- upload all pending ---
  const uploadAll = useCallback(async () => {
    const pending = shots.filter(
      (s) => s.status === "pending" || s.status === "error"
    );
    for (const shot of pending) {
      await uploadShot(shot.id);
    }
  }, [shots, uploadShot]);

  const pendingCount = shots.filter(
    (s) => s.status === "pending" || s.status === "error"
  ).length;
  const doneCount = shots.filter((s) => s.status === "done").length;

  // --- error screen ---
  if (error && !event) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center p-6 text-center text-white bg-black">
        <div className="max-w-md surface-carbon p-8 border border-white/20">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#cfcfcf]">
            SYSTEM ALERT
          </span>
          <h2 className="mt-2 font-['Unbounded'] text-lg font-bold uppercase tracking-[0.067em] text-white">
            TERJADI KESALAHAN
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

  if (!event) return <LoadingScreen />;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col p-4 sm:p-6 text-white bg-black">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ---------- HEADER ---------- */}
      <header className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-white animate-pulse" />
            <h1 className="truncate font-['Unbounded'] text-sm sm:text-base font-bold uppercase tracking-[0.08em] text-white">
              {event.title}
            </h1>
          </div>
          <p className="mt-1 truncate text-[11px] uppercase tracking-[0.15em] text-[#cfcfcf]">
            {doneCount > 0
              ? `${doneCount} FRAME TERSINKRONISASI KE ALBUM`
              : "MODE KAMERA TAMU // LIVE SYNC"}
          </p>
        </div>
        <Link
          href={`/events/${eventId}`}
          className="btn-ghost-ash text-xs py-1.5 px-3 shrink-0"
        >
          ALBUM ↗
        </Link>
      </header>

      {/* ---------- ERROR BANNER ---------- */}
      {error && event && (
        <div className="mb-4 flex items-center justify-between border border-white/40 bg-black p-3 text-xs uppercase tracking-[0.1em] text-white">
          <span>{error}</span>
          <button
            className="ml-2 font-bold underline cursor-pointer"
            onClick={() => setError(null)}
          >
            TUTUP
          </button>
        </div>
      )}

      {/* ---------- PRE-JOIN SCREEN ---------- */}
      {!joined && (
        <div className="flex flex-1 flex-col items-center justify-center py-10 surface-carbon border border-white/20 p-8 my-auto">
          <div className="mb-6 flex h-16 w-16 items-center justify-center border border-white/40 bg-black">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>

          <div className="mb-8 text-center">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#cfcfcf]">
              CONNECT OPTICAL FEED
            </span>
            <h2 className="mt-2 font-['Unbounded'] text-lg font-bold uppercase tracking-[0.067em] text-white">
              ABADIKAN MOMEN ACARA
            </h2>
            <p className="mt-2 max-w-xs text-xs uppercase tracking-[0.132em] text-[#cfcfcf] leading-relaxed">
              Setiap foto yang Anda ambil akan tersimpan otomatis ke galeri kolaboratif {event.title}.
            </p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={() => {
                setJoined(true);
                void startCamera(facingMode);
              }}
              className="btn-ghost w-full"
            >
              BUKA KAMERA SEKARANG
            </button>
            <button
              onClick={() => {
                setJoined(true);
                fileInputRef.current?.click();
              }}
              className="btn-ghost-ash w-full"
            >
              UNGGAH DARI GALERI
            </button>
          </div>
        </div>
      )}

      {/* ---------- CAMERA VIEW ---------- */}
      {joined && (
        <div className="flex flex-1 flex-col">
          <div className="relative mb-4 overflow-hidden border border-white/30 bg-black">
            {/* Viewfinder Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`aspect-[3/4] w-full object-cover ${
                facingMode === "user" ? "-scale-x-100" : ""
              }`}
            />

            {/* Flash Effect */}
            {flashEffect && (
              <div className="absolute inset-0 z-30 bg-white transition-opacity duration-100" />
            )}

            {/* Viewfinder Framing Grid */}
            {cameraReady && showGrid && (
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                <div className="border-b border-r border-white/10" />
                <div className="border-b border-r border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-b border-r border-white/10" />
                <div className="border-b border-r border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-r border-white/10" />
                <div className="border-r border-white/10" />
                <div />
              </div>
            )}

            {/* Sharp Architectural Corner Reticles (0px radius) */}
            {cameraReady && (
              <div className="pointer-events-none absolute inset-5 z-10">
                <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-white/80" />
                <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-white/80" />
                <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-white/80" />
                <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-white/80" />
              </div>
            )}

            {/* Top Toolbar Overlay */}
            {cameraReady && (
              <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex h-8 w-8 items-center justify-center border text-[11px] font-mono transition cursor-pointer ${
                    showGrid
                      ? "border-white bg-white/20 text-white"
                      : "border-white/30 bg-black/40 text-white/60"
                  }`}
                  title="Toggle Grid"
                >
                  GRID
                </button>
                <div className="border border-white/30 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
                  {facingMode === "environment" ? "REAR OPTICS" : "FRONT (SELFIE)"}
                </div>
              </div>
            )}

            {/* Inactive camera placeholder */}
            {!cameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center border border-white/40">
                  <span className="text-white text-xl">📷</span>
                </div>
                <div>
                  <p className="font-['Unbounded'] text-xs uppercase tracking-[0.15em] text-white">
                    KAMERA BELUM AKTIF
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#cfcfcf]">
                    IZINKAN AKSES KAMERA PADA BROWSER
                  </p>
                </div>
                <button
                  className="btn-ghost-sm mt-2"
                  onClick={() => void startCamera(facingMode)}
                >
                  AKTIFKAN KAMERA
                </button>
              </div>
            )}

            {/* Bottom Controls Bar */}
            {cameraReady && (
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-around bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 pb-6 pt-10">
                {/* Gallery Picker */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-11 w-11 items-center justify-center border border-white/30 bg-black/60 text-white hover:border-white transition cursor-pointer"
                  title="Pilih dari Galeri"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <rect x="3" y="3" width="18" height="18" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>

                {/* Shutter Button (Sharp geometric aesthetic) */}
                <button
                  onClick={snap}
                  className="group relative flex h-20 w-20 items-center justify-center border-2 border-white bg-black/40 cursor-pointer active:scale-95 transition"
                  title="Ambil Foto"
                  aria-label="Ambil foto"
                >
                  <div className="h-14 w-14 bg-white transition group-hover:scale-95 group-active:scale-90" />
                </button>

                {/* Switch Camera */}
                <button
                  onClick={flipCamera}
                  className="flex h-11 w-11 items-center justify-center border border-white/30 bg-black/60 text-white hover:border-white transition cursor-pointer"
                  title="Ganti Kamera"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <polyline points="23 20 23 14 17 14" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* ---------- SHOTS QUEUE / REVIEW ---------- */}
          {shots.length > 0 && (
            <section className="surface-carbon p-5 border border-white/20">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-['Unbounded'] text-xs font-semibold uppercase tracking-[0.1em] text-white">
                    ANTREAN FRAME ({shots.length})
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#cfcfcf]">
                    {pendingCount > 0
                      ? `${pendingCount} FRAME SIAP DIUNGGAH`
                      : "SELURUH FRAME TERSINKRONISASI"}
                  </p>
                </div>
                {pendingCount > 0 && (
                  <button
                    className="btn-ghost-sm text-xs py-1.5 px-3"
                    disabled={uploading}
                    onClick={() => void uploadAll()}
                  >
                    {uploading ? "MENGUNGGAH…" : `KIRIM SEMUA (${pendingCount})`}
                  </button>
                )}
              </div>

              <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                {shots.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 bg-black p-2.5 border border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.previewUrl}
                      alt="hasil jepretan"
                      className="h-12 w-12 object-cover border border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {s.status === "pending" && (
                          <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/80">
                            [SIAP KIRIM]
                          </span>
                        )}
                        {s.status === "uploading" && (
                          <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-cyan-400">
                            [MENGUNGGAH…]
                          </span>
                        )}
                        {s.status === "done" && (
                          <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-white">
                            [TERSINKRON ✓]
                          </span>
                        )}
                        {s.status === "error" && (
                          <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-red-400">
                            [GAGAL UNGGAH]
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate font-mono text-[10px] text-[#666666]">
                        {s.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {(s.status === "pending" || s.status === "error") && (
                        <button
                          className="btn-ghost-sm text-[10px] py-1 px-2.5"
                          disabled={uploading}
                          onClick={() => void uploadShot(s.id)}
                        >
                          KIRIM
                        </button>
                      )}
                      {s.status !== "uploading" && (
                        <button
                          onClick={() => removeShot(s.id)}
                          className="flex h-6 w-6 items-center justify-center border border-white/20 text-xs text-white/70 hover:border-white hover:text-white"
                          title="Hapus"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <Link
                  href={`/events/${eventId}`}
                  className="text-xs uppercase tracking-[0.188em] text-[#cfcfcf] hover:text-white underline underline-offset-4"
                >
                  BUKA GALERI ALBUM SEKARANG →
                </Link>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
