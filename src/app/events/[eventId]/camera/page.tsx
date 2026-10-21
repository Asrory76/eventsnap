"use client";

// Halaman kamera tamu modern EventSnap — buka getUserMedia, jepret, upload ke Storage+Firestore.
// Fitur:
// - Viewfinder modern dengan grid overlay & corner markers
// - Shutter button premium dengan ripple & haptic visual
// - Switch kamera depan/belakang
// - Batch upload dengan progress bar & status badge
// - Integrasi galeri upload
// - Review & delete sebelum kirim
import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getEvent, uploadPhoto, type EventDoc } from "@/lib/events";
import { signIn } from "@/lib/auth";

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
/*  Wrapper — unwrap params promise (App Router convention)            */
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
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-purple-500/30 border-t-purple-600" />
        </div>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            Menyiapkan Kamera…
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Memuat detail acara & akses perangkat
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

    // Mirror if user-facing
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

  // --- stats ---
  const pendingCount = shots.filter(
    (s) => s.status === "pending" || s.status === "error"
  ).length;
  const doneCount = shots.filter((s) => s.status === "done").length;

  // --- error screen ---
  if (error && !event) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50/80 p-8 shadow-sm backdrop-blur-sm dark:border-red-900/40 dark:bg-red-950/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl dark:bg-red-900/30">
            ⚠️
          </div>
          <h2 className="mb-2 text-lg font-bold text-red-900 dark:text-red-200">
            Terjadi Kesalahan
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

  if (!event) return <LoadingScreen />;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col p-4 sm:p-6">
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
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h1 className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl">
              {event.title}
            </h1>
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {doneCount > 0
              ? `🎉 ${doneCount} foto berhasil terkirim ke album`
              : "Mode Kamera Tamu — Foto otomatis masuk ke album bersama"}
          </p>
        </div>
        <Link
          href={`/events/${eventId}`}
          className="shrink-0 rounded-xl border border-zinc-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-sm transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          Lihat Album ↗
        </Link>
      </header>

      {/* ---------- ERROR BANNER ---------- */}
      {error && event && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-800 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <span>{error}</span>
          <button
            className="ml-2 font-semibold underline"
            onClick={() => setError(null)}
          >
            Tutup
          </button>
        </div>
      )}

      {/* ---------- PRE-JOIN ONBOARDING SCREEN ---------- */}
      {!joined && (
        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-zinc-200/80 bg-white/90 text-5xl shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
              📸
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Abadikan Momen Acara
            </h2>
            <p className="max-w-xs text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Setiap foto yang kamu ambil akan langsung tersimpan di galeri
              kolaboratif {event.title}.
            </p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={() => {
                setJoined(true);
                void startCamera(facingMode);
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 text-center font-bold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/35 active:scale-[0.98]"
            >
              <span>📷 Buka Kamera Sekarang</span>
            </button>
            <button
              onClick={() => {
                setJoined(true);
                fileInputRef.current?.click();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200/90 bg-white/80 px-6 py-3.5 text-center text-sm font-semibold text-zinc-700 shadow-sm backdrop-blur-sm transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <span>🖼️ Unggah dari Galeri Foto</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------- CAMERA VIEW ---------- */}
      {joined && (
        <div className="flex flex-1 flex-col">
          <div className="relative mb-4 overflow-hidden rounded-3xl bg-zinc-950 shadow-2xl ring-1 ring-zinc-800/80">
            {/* Viewfinder Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`aspect-[3/4] w-full object-cover transition-transform duration-300 ${
                facingMode === "user" ? "-scale-x-100" : ""
              }`}
            />

            {/* Flash Effect */}
            {flashEffect && (
              <div className="absolute inset-0 z-30 bg-white transition-opacity duration-100" />
            )}

            {/* Viewfinder Framing Grid & Overlay */}
            {cameraReady && showGrid && (
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                <div className="border-b border-r border-white/15" />
                <div className="border-b border-r border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-b border-r border-white/15" />
                <div className="border-b border-r border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div />
              </div>
            )}

            {/* Corner Viewfinder Indicators */}
            {cameraReady && (
              <div className="pointer-events-none absolute inset-4 z-10">
                <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-white/60 rounded-tl" />
                <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-white/60 rounded-tr" />
                <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
                <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-white/60 rounded-br" />
              </div>
            )}

            {/* Top Toolbar overlay */}
            {cameraReady && (
              <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition backdrop-blur-md ${
                    showGrid
                      ? "bg-white/30 text-white"
                      : "bg-black/30 text-white/60"
                  }`}
                  title="Toggle Grid"
                >
                  #
                </button>
                <div className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">
                  {facingMode === "environment" ? "Belakang" : "Depan (Selfie)"}
                </div>
              </div>
            )}

            {/* Inactive camera placeholder */}
            {!cameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950 p-6 text-zinc-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-3xl">
                  📷
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-200">
                    Kamera belum aktif
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Klik tombol di bawah untuk mengaktifkan izin kamera
                  </p>
                </div>
                <button
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 active:scale-95"
                  onClick={() => void startCamera(facingMode)}
                >
                  Aktifkan Kamera
                </button>
              </div>
            )}

            {/* Bottom Controls Bar */}
            {cameraReady && (
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-around bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-6 pt-12">
                {/* Gallery Picker */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl text-white backdrop-blur-md transition hover:bg-white/30 active:scale-90"
                  title="Pilih dari Galeri"
                >
                  🖼️
                </button>

                {/* Shutter Button */}
                <button
                  onClick={snap}
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/90 bg-white/20 backdrop-blur-md transition active:scale-95"
                  title="Ambil Foto"
                  aria-label="Ambil foto"
                >
                  <div className="h-14 w-14 rounded-full bg-white transition group-hover:scale-95 group-active:scale-90 shadow-lg" />
                </button>

                {/* Switch Camera */}
                <button
                  onClick={flipCamera}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl text-white backdrop-blur-md transition hover:bg-white/30 active:scale-90"
                  title="Ganti Kamera"
                >
                  🔄
                </button>
              </div>
            )}
          </div>

          {/* ---------- SHOTS QUEUE / REVIEW ---------- */}
          {shots.length > 0 && (
            <section className="mt-2 rounded-3xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Antrean Foto ({shots.length})
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    {pendingCount > 0
                      ? `${pendingCount} foto siap diunggah`
                      : "Semua foto telah tersimpan"}
                  </p>
                </div>
                {pendingCount > 0 && (
                  <button
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition hover:shadow-lg disabled:opacity-50"
                    disabled={uploading}
                    onClick={() => void uploadAll()}
                  >
                    {uploading ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Mengunggah…
                      </>
                    ) : (
                      `🚀 Kirim Semua (${pendingCount})`
                    )}
                  </button>
                )}
              </div>

              <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
                {shots.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-2.5 transition dark:border-zinc-800/60 dark:bg-zinc-800/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.previewUrl}
                      alt="hasil jepretan"
                      className="h-14 w-14 rounded-xl object-cover ring-1 ring-black/5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {s.status === "pending" && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            Siap Kirim
                          </span>
                        )}
                        {s.status === "uploading" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            <span className="h-2 w-2 animate-spin rounded-full border border-blue-600 border-t-transparent" />
                            Mengunggah…
                          </span>
                        )}
                        {s.status === "done" && (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ Berhasil Masuk Album
                          </span>
                        )}
                        {s.status === "error" && (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                            ✕ Gagal Unggah
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                        {s.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(s.status === "pending" || s.status === "error") && (
                        <button
                          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                          disabled={uploading}
                          onClick={() => void uploadShot(s.id)}
                        >
                          Kirim
                        </button>
                      )}
                      {s.status !== "uploading" && (
                        <button
                          onClick={() => removeShot(s.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                          title="Hapus"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                <Link
                  href={`/events/${eventId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  <span>Buka galeri album sekarang</span>
                  <span>→</span>
                </Link>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
