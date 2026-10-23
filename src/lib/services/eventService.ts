import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  writeBatch,
  onSnapshot,
  setDoc,
  type Unsubscribe,
  type Timestamp,
  limit,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import {
  eventConverter,
  type EventDoc,
  type EventStatus,
  type CreateEventInput,
  type UpdateEventInput,
} from "@/types";
import {
  EventNotFoundError,
  UnauthorizedError,
  ValidationError,
  handleFirebaseError,
} from "@/lib/errors";

export interface CreateEventParams {
  title: string;
  description?: string;
  maxPhotoQuota?: number;
  isModerationEnabled?: boolean;
  coverUrl?: string;
  slug?: string;
  hostId?: string;
}

/**
 * Menghasilkan slug URL yang bersih dari judul event dan akhiran acak.
 */
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || "event"}-${randomSuffix}`;
}

/**
 * Validasi payload pembuatan event sebelum eksekusi ke database.
 */
function validateCreateEventPayload(title: string, maxPhotoQuota?: number): string {
  const cleanTitle = title.trim();
  if (!cleanTitle || cleanTitle.length < 1 || cleanTitle.length > 120) {
    throw new ValidationError("Judul event wajib diisi dan maksimal 120 karakter.");
  }
  if (maxPhotoQuota !== undefined && (maxPhotoQuota < 1 || maxPhotoQuota > 50000)) {
    throw new ValidationError("Batas kuota foto harus antara 1 dan 50.000 foto.");
  }
  return cleanTitle;
}

/**
 * Memeriksa apakah suatu event masih aktif dan masih memiliki kuota tersisa untuk menerima foto baru.
 *
 * @param eventOrId - Objek EventDoc atau ID string event
 * @returns boolean - true jika event berstatus 'active' dan usedPhotoQuota < maxPhotoQuota
 */
export async function isEventActive(eventOrId: EventDoc | string): Promise<boolean> {
  try {
    let event: EventDoc | null = null;
    if (typeof eventOrId === "string") {
      event = await getEventById(eventOrId);
    } else {
      event = eventOrId;
    }

    if (!event) return false;
    return event.status === "active" && event.usedPhotoQuota < event.maxPhotoQuota;
  } catch {
    return false;
  }
}

/**
 * Buat event baru oleh Host terautentikasi.
 * Mendukung input berupa string judul langsung atau objek CreateEventParams lengkap.
 *
 * @param paramsOrTitle - Judul string atau objek parameter event
 * @returns Objek EventDoc yang berhasil dibuat
 */
export async function createEvent(
  paramsOrTitle: string | CreateEventParams | CreateEventInput
): Promise<EventDoc> {
  try {
    const params: CreateEventParams =
      typeof paramsOrTitle === "string" ? { title: paramsOrTitle } : paramsOrTitle;

    const { db, auth } = getFirebase();
    const currentUid = params.hostId || auth.currentUser?.uid;

    if (!currentUid) {
      throw new UnauthorizedError("Harus login terlebih dahulu untuk membuat event.");
    }

    const cleanTitle = validateCreateEventPayload(params.title, params.maxPhotoQuota);

    const eventsCollectionRef = collection(db, "events").withConverter(eventConverter);
    const newEventRef = doc(eventsCollectionRef);
    const slug = (params.slug?.trim() || generateSlug(cleanTitle)).toLowerCase();

    const newEventData: Omit<EventDoc, "id" | "createdAt" | "updatedAt"> = {
      slug,
      title: cleanTitle,
      description: params.description?.trim(),
      hostId: currentUid,
      status: "active",
      maxPhotoQuota: Math.max(10, params.maxPhotoQuota ?? 500),
      usedPhotoQuota: 0,
      isModerationEnabled: Boolean(params.isModerationEnabled),
      coverUrl: params.coverUrl?.trim() || undefined,
    };

    await setDoc(newEventRef, newEventData as EventDoc);

    const snapshot = await getDoc(newEventRef);
    if (!snapshot.exists()) {
      throw new EventNotFoundError("Gagal memuat dokumen event yang baru dibuat.");
    }

    return snapshot.data();
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Ambil detail event berdasarkan Document ID.
 * Menyediakan fallback data demo terisolasi jika eventId === "sample-event".
 *
 * @param eventId - ID dokumen event
 * @returns EventDoc jika ditemukan, atau null jika tidak ada
 */
export async function getEventById(eventId: string): Promise<EventDoc | null> {
  const cleanId = eventId?.trim();
  if (!cleanId) return null;

  if (cleanId === "sample-event") {
    try {
      const { db } = getFirebase();
      const eventRef = doc(db, "events", cleanId).withConverter(eventConverter);
      const snapshot = await getDoc(eventRef);
      if (snapshot.exists()) return snapshot.data();
    } catch {
      // Abaikan kegagalan jaringan saat mode demo preview
    }

    const nowTimestamp = {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    } as unknown as Timestamp;

    return {
      id: "sample-event",
      slug: "sample-event",
      title: "Pernikahan Andi & Sari",
      description: "Album demo kolaboratif resepsi pernikahan Andi & Sari di Pavilion Garden, Jakarta.",
      hostId: "demo-host-andi-sari",
      status: "active",
      maxPhotoQuota: 500,
      usedPhotoQuota: 18,
      isModerationEnabled: false,
      coverUrl: "/images/hero-wedding.jpg",
      createdAt: nowTimestamp,
      updatedAt: nowTimestamp,
    };
  }

  try {
    const { db } = getFirebase();
    const eventRef = doc(db, "events", cleanId).withConverter(eventConverter);
    const snapshot = await getDoc(eventRef);

    if (!snapshot.exists()) return null;
    return snapshot.data();
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/** Alias getEventById untuk kemudahan impor */
export const getEvent = getEventById;

/**
 * Ambil detail event berdasarkan slug unik (untuk URL publik ramah SEO).
 *
 * @param slug - Slug unik event
 * @returns EventDoc atau null
 */
export async function getEventBySlug(slug: string): Promise<EventDoc | null> {
  const cleanSlug = slug?.trim().toLowerCase();
  if (!cleanSlug) return null;

  try {
    const { db } = getFirebase();
    const q = query(
      collection(db, "events").withConverter(eventConverter),
      where("slug", "==", cleanSlug),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Perbarui metadata event (Host only).
 *
 * @param eventId - ID dokumen event
 * @param updates - Properti yang ingin diperbarui
 */
export async function updateEvent(
  eventId: string,
  updates: UpdateEventInput
): Promise<void> {
  const cleanId = eventId?.trim();
  if (!cleanId) throw new ValidationError("ID event tidak boleh kosong.");

  try {
    const { db, auth } = getFirebase();
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new UnauthorizedError();

    const eventRef = doc(db, "events", cleanId).withConverter(eventConverter);
    const existing = await getDoc(eventRef);

    if (!existing.exists()) throw new EventNotFoundError();
    const data = existing.data();
    if (data.hostId !== currentUid) {
      throw new UnauthorizedError("Hanya Host yang berhak mengubah event ini.");
    }

    const payloadToUpdate: Record<string, unknown> = {};

    if (updates.title !== undefined) {
      const cleanTitle = updates.title.trim();
      if (!cleanTitle || cleanTitle.length > 120) {
        throw new ValidationError("Judul event harus antara 1 dan 120 karakter.");
      }
      payloadToUpdate.title = cleanTitle;
    }

    if (updates.description !== undefined) {
      payloadToUpdate.description = updates.description.trim();
    }

    if (updates.status !== undefined) {
      if (!["upcoming", "active", "ended"].includes(updates.status)) {
        throw new ValidationError("Status event tidak valid.");
      }
      payloadToUpdate.status = updates.status;
    }

    if (updates.maxPhotoQuota !== undefined) {
      if (updates.maxPhotoQuota < 1 || updates.maxPhotoQuota < data.usedPhotoQuota) {
        throw new ValidationError(
          `Batas kuota tidak boleh kurang dari jumlah foto yang sudah terunggah (${data.usedPhotoQuota}).`
        );
      }
      payloadToUpdate.maxPhotoQuota = updates.maxPhotoQuota;
    }

    if (updates.isModerationEnabled !== undefined) {
      payloadToUpdate.isModerationEnabled = Boolean(updates.isModerationEnabled);
    }

    if (updates.coverUrl !== undefined) {
      payloadToUpdate.coverUrl = updates.coverUrl.trim();
    }

    if (updates.slug !== undefined) {
      payloadToUpdate.slug = updates.slug.trim().toLowerCase();
    }

    await updateDoc(eventRef, payloadToUpdate);
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Perbarui status event secara aman (misal 'upcoming' -> 'active' -> 'ended').
 *
 * @param eventId - ID dokumen event
 * @param status - Status baru
 */
export async function updateEventStatus(
  eventId: string,
  status: EventStatus
): Promise<void> {
  await updateEvent(eventId, { status });
}

/**
 * Perbarui batas kuota foto event (Host only).
 *
 * @param eventId - ID dokumen event
 * @param maxPhotoQuota - Batas foto baru
 */
export async function updateEventQuota(
  eventId: string,
  maxPhotoQuota: number
): Promise<void> {
  await updateEvent(eventId, { maxPhotoQuota });
}

/**
 * Ambil seluruh event yang dibuat oleh Host tertentu.
 *
 * @param hostId - UID Host
 * @returns Daftar array EventDoc
 */
export async function listEventsByHost(hostId: string): Promise<EventDoc[]> {
  const cleanHostId = hostId?.trim();
  if (!cleanHostId) return [];

  try {
    const { db } = getFirebase();
    const q = query(
      collection(db, "events").withConverter(eventConverter),
      where("hostId", "==", cleanHostId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Real-time listener untuk daftar event milik Host tertentu.
 *
 * @param hostId - UID Host
 * @param onUpdate - Callback saat data berubah
 * @param onError - Callback saat terjadi error
 * @returns Fungsi unsubscribe untuk melepaskan listener
 */
export function subscribeEventsByHost(
  hostId: string,
  onUpdate: (events: EventDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const { db } = getFirebase();
  const cleanHostId = hostId?.trim();

  const q = query(
    collection(db, "events").withConverter(eventConverter),
    where("hostId", "==", cleanHostId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.docs.map((d) => d.data()));
    },
    (err) => {
      const appErr = handleFirebaseError(err);
      if (onError) onError(appErr);
    }
  );
}

/**
 * Real-time listener untuk satu dokumen event tertentu.
 *
 * @param eventId - ID event
 * @param onUpdate - Callback saat snapshot berubah
 * @param onError - Callback saat listener gagal
 * @returns Fungsi unsubscribe
 */
export function subscribeEvent(
  eventId: string,
  onUpdate: (event: EventDoc | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const cleanId = eventId?.trim();
  const { db } = getFirebase();
  const eventRef = doc(db, "events", cleanId).withConverter(eventConverter);

  return onSnapshot(
    eventRef,
    (snap) => {
      onUpdate(snap.exists() ? snap.data() : null);
    },
    (err) => {
      const appErr = handleFirebaseError(err);
      if (onError) onError(appErr);
    }
  );
}

/**
 * Hapus event secara atomik menggunakan WriteBatch untuk menjamin integritas data (Host only).
 *
 * @param eventId - ID event yang akan dihapus
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const cleanId = eventId?.trim();
  if (!cleanId) throw new ValidationError("ID event tidak boleh kosong.");

  try {
    const { db, auth } = getFirebase();
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new UnauthorizedError();

    const eventRef = doc(db, "events", cleanId).withConverter(eventConverter);
    const existing = await getDoc(eventRef);

    if (!existing.exists()) return;
    if (existing.data().hostId !== currentUid) {
      throw new UnauthorizedError("Hanya Host yang dapat menghapus event ini.");
    }

    // Gunakan writeBatch untuk atomicity
    const batch = writeBatch(db);
    batch.delete(eventRef);
    await batch.commit();
  } catch (error) {
    throw handleFirebaseError(error);
  }
}
