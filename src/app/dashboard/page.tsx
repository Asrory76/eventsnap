"use client";

// Daftar event milik user (pemilik = ownerUid == uid sesi anon).
// Produksi: ganti anon -> Google login supaya daftar persisten lintas device.
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { fb, type EventDoc } from "@/lib/events";
import { signIn } from "@/lib/auth";

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
    const q = query(collection(fb().db, "events"), orderBy("createdAt", "desc"));
    // MVP filter klien-sisi; rules tetap jadi pengaman sesungguhnya.
    const unsub = onSnapshot(q, (snap) => {
      setEvents(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<EventDoc, "id">) }))
          .filter((e) => e.ownerUid === uid)
      );
    });
    return () => unsub();
  }, [uid]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col gap-6 p-6 sm:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Album Saya</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {events === null
              ? "Memuat acara…"
              : `${events.length} acara`}
          </p>
        </div>
        <Link
          href="/create"
          className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:shadow-purple-500/20 active:scale-[0.97]"
        >
          + Acara Baru
        </Link>
      </div>

      {/* Loading skeleton */}
      {events === null && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {events?.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 text-5xl dark:bg-zinc-800">
            📸
          </div>
          <div>
            <p className="font-semibold">Belum ada acara</p>
            <p className="mt-1 text-sm text-zinc-500">
              Buat acara pertama Anda dan mulai kumpulkan foto!
            </p>
          </div>
          <Link
            href="/create"
            className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl active:scale-[0.97]"
          >
            Buat Acara Pertama →
          </Link>
        </div>
      )}

      {/* Event list */}
      {events && events.length > 0 && (
        <div className="flex flex-col gap-3">
          {events.map((e, i) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              style={{
                animation: `fadeIn 0.4s ease-out ${i * 60}ms both`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-xl">
                  📷
                </div>
                <div>
                  <span className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {e.title}
                  </span>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {e.createdAt
                      ? new Date(e.createdAt.seconds * 1000).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "Baru dibuat"}
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-purple-500 dark:text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
