"use client";

// Daftar event milik user (pemilik = hostId / ownerUid).
import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, subscribeEventsByHost } from "@/lib/services";
import { type EventDoc } from "@/types";

export default function DashboardPage() {
  const [events, setEvents] = useState<EventDoc[] | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    signIn()
      .then((u) => setUid(u))
      .catch((e) => console.error("auth:", e));
  }, []);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeEventsByHost(
      uid,
      (fetchedEvents) => setEvents(fetchedEvents),
      (err) => console.error("Gagal memuat event:", err)
    );
    return () => unsub();
  }, [uid]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col gap-8 p-6 sm:p-12 text-[#ffffff]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#cfcfcf]">
            USER ARCHIVES // REPOSITORY
          </span>
          <h1 className="mt-2 font-['Unbounded'] text-2xl sm:text-4xl font-bold uppercase tracking-[0.067em] text-[#ffffff]">
            ALBUM SAYA
          </h1>
          <p className="mt-2 text-xs sm:text-sm uppercase tracking-[0.132em] text-[#cfcfcf]">
            {events === null
              ? "MEMUAT REPOSITORI ACARA…"
              : `${events.length} ACARA TERCATAT DALAM SISTEM`}
          </p>
        </div>
        <Link
          href="/create"
          className="btn-ghost-sm whitespace-nowrap self-start sm:self-auto"
        >
          + ACARA BARU
        </Link>
      </div>

      {/* Loading skeleton with sharp geometric blocks */}
      {events === null && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse surface-carbon border border-white/10"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {events?.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center border border-dashed border-white/20 surface-carbon p-8">
          <div className="flex h-16 w-16 items-center justify-center border border-white/40 bg-black">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
            >
              <rect x="3" y="3" width="18" height="18" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <p className="font-['Unbounded'] text-lg font-semibold uppercase tracking-[0.1em] text-[#ffffff]">
              BELUM ADA ACARA
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.15em] text-[#cfcfcf] max-w-sm">
              Inisialisasi acara pertama Anda dan mulai kumpulkan foto bersama seluruh tamu secara live.
            </p>
          </div>
          <Link
            href="/create"
            className="btn-ghost"
          >
            BUAT ACARA PERTAMA →
          </Link>
        </div>
      )}

      {/* Event list */}
      {events && events.length > 0 && (
        <div className="flex flex-col gap-4">
          {events.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="group flex items-center justify-between surface-carbon p-6 border border-white/15 transition-all hover:border-white hover:bg-[#181818]"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center border border-white/30 bg-black group-hover:border-white transition-colors">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-['Unbounded'] text-base sm:text-lg font-medium uppercase tracking-[0.08em] text-[#ffffff] group-hover:underline underline-offset-4">
                    {e.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-[11px] uppercase tracking-[0.188em] text-[#cfcfcf]">
                    <span>
                      {e.createdAt
                        ? new Date(e.createdAt.seconds * 1000).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "BARU"}
                    </span>
                    <span className="h-1 w-1 bg-white/40" />
                    <span className="font-mono text-[10px] text-[#888888]">
                      ID // {e.id.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-[11px] uppercase tracking-[0.188em] text-[#cfcfcf] opacity-0 group-hover:opacity-100 transition-opacity">
                  MASUK ALBUM
                </span>
                <div className="flex h-8 w-8 items-center justify-center border border-white/20 group-hover:border-white transition-colors">
                  <span className="text-white text-xs">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
