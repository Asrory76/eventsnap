// Helpers Firestore/Storage — semua operasi lewat SDK klien,
// keamanan dijaga oleh firestore.rules & storage.rules (bukan kode di sini).
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { initFirebase, type FirebaseClients } from "./firebase";

let clients: FirebaseClients | null = null;
export function fb(): FirebaseClients {
  clients ??= initFirebase();
  return clients;
}

export type EventDoc = {
  id: string;
  title: string;
  ownerUid: string;
  createdAt?: { seconds: number };
};

export type PhotoDoc = {
  id: string;
  eventId: string;
  storagePath: string;
  url: string;
  uploadedBy: string;
  createdAt?: { seconds: number };
};

/** Buat event baru untuk user yang sedang login. Return eventId. */
export async function createEvent(title: string): Promise<string> {
  const { db } = fb();
  const auth = fb().auth;
  if (!auth.currentUser) throw new Error("Belum login");
  const ref = await addDoc(collection(db, "events"), {
    title,
    ownerUid: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Ambil satu event. Null kalau tidak ada. */
export async function getEvent(eventId: string): Promise<EventDoc | null> {
  const { db } = fb();
  const snap = await getDoc(doc(db, "events", eventId));
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<EventDoc, "id">;
  return { id: snap.id, ...data };
}

/** Subscribe daftar foto suatu event (realtime, urut terbaru). */
export function subscribePhotos(
  eventId: string,
  cb: (photos: PhotoDoc[]) => void,
  onError: (e: Error) => void
): () => void {
  const { db } = fb();
  const q = query(
    collection(db, "events", eventId, "photos"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => ({
          id: d.id,
          eventId,
          ...(d.data() as Omit<PhotoDoc, "id" | "eventId">),
        }))
      );
    },
    (err) => onError(err as Error)
  );
}

/** Upload file ke Cloudinary (atau Firebase Storage) + tulis dokumen metadata ke Firestore. */
export async function uploadPhoto(
  eventId: string,
  blob: Blob,
  filename: string
): Promise<PhotoDoc> {
  const { db, auth } = fb();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Belum login. Pastikan Anonymous Auth diaktifkan.");

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  let url = "";
  let storagePath = "";

  if (cloudinaryCloudName && cloudinaryPreset) {
    // Upload langsung ke Cloudinary REST API (100% Gratis, Tanpa Kartu Kredit)
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("upload_preset", cloudinaryPreset);
    formData.append("folder", `eventsnap/${eventId}`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData.error?.message ||
          `Gagal upload ke Cloudinary: status ${res.status}`
      );
    }

    const data = await res.json();
    url = data.secure_url || data.url;
    storagePath = data.public_id || filename;
  } else {
    // Fallback: Firebase Storage
    const { storage } = fb();
    storagePath = `events/${eventId}/${uid}/${Date.now()}_${filename}`;
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, blob, { contentType: blob.type });
    url = await getDownloadURL(fileRef);
  }

  const created = await addDoc(collection(db, "events", eventId, "photos"), {
    eventId,
    storagePath,
    url,
    uploadedBy: uid,
    createdAt: serverTimestamp(),
  });

  return { id: created.id, eventId, storagePath, url, uploadedBy: uid };
}

/** Hapus foto dari album (Firestore). */
export async function deletePhoto(
  eventId: string,
  photoId: string
): Promise<void> {
  const { db, auth } = fb();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Belum login. Pastikan Anonymous Auth aktif.");
  await deleteDoc(doc(db, "events", eventId, "photos", photoId));
}
