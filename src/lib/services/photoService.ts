import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { compressImage } from "@/lib/utils/imageCompressor";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { getFirebase } from "@/lib/firebase";
import {
  eventConverter,
  photoConverter,
  type PhotoDoc,
  type PhotoStatus,
  type GetPhotosOptions,
  type PaginatedPhotosResult,
} from "@/types";
import {
  QuotaExceededError,
  EventClosedError,
  EventNotFoundError,
  InvalidMediaError,
  UploadFailedError,
  UnauthorizedError,
  ValidationError,
  handleFirebaseError,
} from "@/lib/errors";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

const DEFAULT_MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export interface UploadPhotoOptions {
  eventId: string;
  file: File | Blob;
  customFilename?: string;
  uploaderUid?: string;
  uploaderName?: string;
  caption?: string;
  maxSizeBytes?: number;
  onProgress?: (progressPercent: number) => void;
}

export interface UploadPhotoResult {
  photo: PhotoDoc;
  storagePath: string;
  url: string;
}

/**
 * Validasi MIME type dan batasan ukuran file gambar sebelum kompresi dan transmisi.
 */
function validateMediaFile(file: File | Blob, maxSizeBytes: number): void {
  const mime = file.type.toLowerCase();
  if (!mime || !ALLOWED_MIME_TYPES.has(mime)) {
    throw new InvalidMediaError(
      `Format file tidak didukung (${mime || "tidak dikenal"}). Hanya format JPEG, PNG, WEBP, atau HEIC yang diizinkan.`
    );
  }

  if (file.size <= 0 || file.size > maxSizeBytes) {
    const sizeInMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    throw new InvalidMediaError(
      `Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal ${sizeInMB} MB.`
    );
  }
}

/**
 * Ekstraksi ekstensi file dari nama file atau MIME type.
 */
function getExtension(file: File | Blob, filename?: string): string {
  if (filename && filename.includes(".")) {
    const ext = filename.split(".").pop();
    if (ext) return ext.toLowerCase();
  }
  if (file instanceof File && file.name.includes(".")) {
    const ext = file.name.split(".").pop();
    if (ext) return ext.toLowerCase();
  }
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/gif": "gif",
  };
  return mimeToExt[file.type.toLowerCase()] || "jpg";
}

/**
 * Pipeline unggah foto dengan Atomic Quota Concurrency (Firestore Transaction)
 * dan Otomatis Rollback Storage jika transaksi kuota atau penulisan dokumen Firestore gagal.
 *
 * @param options - Parameter unggah foto
 * @returns UploadPhotoResult
 */
export async function uploadPhotoWithQuotaTransaction(
  options: UploadPhotoOptions
): Promise<UploadPhotoResult> {
  const {
    eventId,
    file,
    customFilename,
    uploaderUid,
    uploaderName,
    caption,
    maxSizeBytes = DEFAULT_MAX_FILE_SIZE,
    onProgress,
  } = options;

  const cleanEventId = eventId?.trim();
  if (!cleanEventId) {
    throw new ValidationError("ID event wajib diisi.");
  }

  const { db, storage, auth } = getFirebase();

  // 1. Validasi Autentikasi Pengunggah (User login atau Anonymous Guest)
  const currentUid = uploaderUid || auth.currentUser?.uid;
  if (!currentUid) {
    throw new UnauthorizedError(
      "Sesi pengunggah tidak valid. Pastikan telah terotentikasi (Anonymous atau Host)."
    );
  }

  // 2. Validasi Media Client-Side
  validateMediaFile(file, maxSizeBytes);

  // 3. Fast Pre-Check: Cegah upload jika event tidak aktif atau kuota penuh
  try {
    const preCheckSnap = await getDoc(
      doc(db, "events", cleanEventId).withConverter(eventConverter)
    );
    if (!preCheckSnap.exists()) {
      throw new EventNotFoundError(`Event dengan ID '${cleanEventId}' tidak ditemukan.`);
    }
    const preCheckEvent = preCheckSnap.data();
    if (preCheckEvent.status !== "active") {
      throw new EventClosedError(
        `Event '${preCheckEvent.title}' saat ini berstatus '${preCheckEvent.status}'. Pengunggahan ditutup.`
      );
    }
    if (preCheckEvent.usedPhotoQuota >= preCheckEvent.maxPhotoQuota) {
      throw new QuotaExceededError(
        `Batas kuota foto untuk event ini (${preCheckEvent.maxPhotoQuota} foto) telah terpenuhi.`
      );
    }
  } catch (err) {
    throw handleFirebaseError(err);
  }

  // 4. Kompresi gambar client-side via HTML5 Canvas
  const uploadableFile = await compressImage(file, {
    maxDimension: 2048,
    quality: 0.85,
    mimeType: "image/jpeg",
  });

  // 5. Generate ID Dokumen & Path Storage Terstruktur
  const photosCollectionRef = collection(db, "events", cleanEventId, "photos");
  const newPhotoDocRef = doc(photosCollectionRef);
  const photoId = newPhotoDocRef.id;

  const timestamp = Date.now();
  const ext = getExtension(uploadableFile, customFilename);
  const storagePath = `events/${cleanEventId}/photos/${photoId}_${timestamp}.${ext}`;
  const storageRef = ref(storage, storagePath);

  // 6. Upload ke Firebase Cloud Storage dengan Progress Tracking
  let uploadSucceeded = false;

  try {
    const uploadTask = uploadBytesResumable(storageRef, uploadableFile, {
      contentType: uploadableFile.type || "image/jpeg",
      customMetadata: {
        eventId: cleanEventId,
        photoId,
        uploadedBy: currentUid,
        uploadedAt: new Date().toISOString(),
      },
    });

    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.min(100, Math.round(percent)));
          }
        },
        (error) => {
          reject(new UploadFailedError(`Gagal mengunggah file ke Storage: ${error.message}`, error));
        },
        () => {
          resolve();
        }
      );
    });

    uploadSucceeded = true;
  } catch (uploadError) {
    throw handleFirebaseError(uploadError);
  }

  // 7. Ambil Public Download URL
  let downloadUrl = "";
  try {
    downloadUrl = await getDownloadURL(storageRef);
  } catch (urlError) {
    // Rollback file di Storage jika URL gagal diambil
    await deleteObject(storageRef).catch(() => null);
    throw handleFirebaseError(urlError);
  }

  // 8. Atomic Concurrency Transaction di Firestore dengan Rollback Safety
  let finalStatus: PhotoStatus = "approved";

  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, "events", cleanEventId).withConverter(eventConverter);
      const eventSnap = await transaction.get(eventRef);

      if (!eventSnap.exists()) {
        throw new EventNotFoundError(`Event dengan ID '${cleanEventId}' tidak ditemukan.`);
      }

      const eventData = eventSnap.data();

      // Periksa status event dalam transaksi
      if (eventData.status !== "active") {
        throw new EventClosedError(
          `Event '${eventData.title}' saat ini berstatus '${eventData.status}'. Pengunggahan ditutup.`
        );
      }

      // Periksa kuota event secara atomik
      if (eventData.usedPhotoQuota >= eventData.maxPhotoQuota) {
        throw new QuotaExceededError(
          `Batas kuota foto untuk event ini (${eventData.maxPhotoQuota} foto) telah terpenuhi.`
        );
      }

      const initialStatus: PhotoStatus = eventData.isModerationEnabled ? "pending" : "approved";
      finalStatus = initialStatus;

      const photoDataToSet: Omit<PhotoDoc, "id"> = {
        eventId: cleanEventId,
        storagePath,
        url: downloadUrl,
        uploadedBy: currentUid,
        uploaderName: uploaderName?.trim() || undefined,
        caption: caption?.trim() || undefined,
        likesCount: 0,
        commentsCount: 0,
        status: initialStatus,
        fileSize: uploadableFile.size,
        mimeType: uploadableFile.type || "image/jpeg",
        createdAt: serverTimestamp() as unknown as Timestamp,
      };

      const typedPhotoRef = doc(db, "events", cleanEventId, "photos", photoId).withConverter(
        photoConverter
      );
      transaction.set(typedPhotoRef, photoDataToSet as PhotoDoc);

      // Tingkatkan kuota foto secara atomik
      transaction.update(eventRef, {
        usedPhotoQuota: increment(1),
        updatedAt: serverTimestamp(),
      });
    });

    const resultPhoto: PhotoDoc = {
      id: photoId,
      eventId: cleanEventId,
      storagePath,
      url: downloadUrl,
      uploadedBy: currentUid,
      uploaderName: uploaderName?.trim(),
      caption: caption?.trim(),
      likesCount: 0,
      commentsCount: 0,
      status: finalStatus,
      fileSize: uploadableFile.size,
      mimeType: uploadableFile.type || "image/jpeg",
      createdAt: { seconds: Math.floor(timestamp / 1000), nanoseconds: 0 } as Timestamp,
    };

    return {
      photo: resultPhoto,
      storagePath,
      url: downloadUrl,
    };
  } catch (transactionError) {
    // STORAGE ROLLBACK: Hapus file di Storage jika penyimpanan metadata Firestore gagal
    if (uploadSucceeded) {
      try {
        await deleteObject(storageRef);
      } catch {
        // Rollback silent catch
      }
    }

    throw handleFirebaseError(transactionError);
  }
}

/**
 * Hapus foto beserta file fisiknya di Storage, dan kurangi usedPhotoQuota secara atomik.
 *
 * @param eventId - ID event
 * @param photoId - ID foto
 * @param storagePath - Path file di Storage (opsional)
 */
export async function deletePhotoWithQuotaRollback(
  eventId: string,
  photoId: string,
  storagePath?: string
): Promise<void> {
  const cleanEventId = eventId?.trim();
  const cleanPhotoId = photoId?.trim();

  if (!cleanEventId || !cleanPhotoId) {
    throw new ValidationError("ID event dan ID foto wajib disertakan.");
  }

  const { db, storage, auth } = getFirebase();
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new UnauthorizedError("Anda harus login untuk menghapus foto.");
  }

  let resolvedStoragePath = storagePath;

  try {
    // 1. Jalankan transaksi untuk menghapus dokumen foto dan decrement usedPhotoQuota
    await runTransaction(db, async (transaction) => {
      const photoRef = doc(db, "events", cleanEventId, "photos", cleanPhotoId).withConverter(
        photoConverter
      );
      const photoSnap = await transaction.get(photoRef);

      if (!photoSnap.exists()) {
        return;
      }

      const photoData = photoSnap.data();
      if (!resolvedStoragePath && photoData.storagePath) {
        resolvedStoragePath = photoData.storagePath;
      }

      const eventRef = doc(db, "events", cleanEventId).withConverter(eventConverter);
      const eventSnap = await transaction.get(eventRef);

      transaction.delete(photoRef);

      if (eventSnap.exists()) {
        const currentQuota = eventSnap.data().usedPhotoQuota;
        if (currentQuota > 0) {
          transaction.update(eventRef, {
            usedPhotoQuota: increment(-1),
            updatedAt: serverTimestamp(),
          });
        }
      }
    });

    // 2. Hapus file fisik dari Cloud Storage
    if (resolvedStoragePath) {
      try {
        const storageRef = ref(storage, resolvedStoragePath);
        await deleteObject(storageRef);
      } catch {
        // Abaikan jika file sudah tidak ada di storage
      }
    }
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Ambil daftar foto per event dengan Cursor-Based Pagination.
 * Menggunakan QueryDocumentSnapshot dan startAfter untuk efisiensi kuota baca Firestore.
 *
 * @param options - Parameter query paginasi (eventId, pageSize, lastDoc, status)
 * @returns PaginatedPhotosResult
 */
export async function getPhotosPaginated(
  options: GetPhotosOptions
): Promise<PaginatedPhotosResult> {
  const { eventId, pageSize = 20, lastDoc, status } = options;
  const cleanId = eventId?.trim();
  if (!cleanId) {
    throw new ValidationError("ID event wajib disertakan.");
  }

  try {
    const { db } = getFirebase();
    const photosCol = collection(db, "events", cleanId, "photos").withConverter(photoConverter);

    let q = query(
      photosCol,
      orderBy("createdAt", "desc"),
      limit(pageSize + 1)
    );

    if (status) {
      q = query(
        photosCol,
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1)
      );
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const photos = resultDocs.map((d) => d.data());
    const nextLastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

    return {
      photos,
      lastDoc: nextLastDoc,
      hasMore,
    };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Upload helper standar: mengunggah file media dengan atomic quota check dan storage rollback.
 *
 * @param eventId - ID event
 * @param file - File atau Blob gambar
 * @param filename - Nama kustom file opsional
 * @param uploaderName - Nama pengunggah opsional
 * @param caption - Keterangan foto opsional
 * @returns Objek PhotoDoc lengkap
 */
export async function uploadPhoto(
  eventId: string,
  file: File | Blob,
  filename?: string,
  uploaderName?: string,
  caption?: string
): Promise<PhotoDoc> {
  const result = await uploadPhotoWithQuotaTransaction({
    eventId,
    file,
    customFilename: filename,
    uploaderName,
    caption,
  });
  return result.photo;
}

/** Alias deletePhotoWithQuotaRollback */
export const deletePhoto = deletePhotoWithQuotaRollback;

/**
 * Berlangganan foto event secara real-time (urut terbaru).
 *
 * @param eventId - ID event
 * @param onUpdate - Callback saat snapshot foto diperbarui
 * @param onError - Callback saat listener gagal
 * @returns Fungsi unsubscribe
 */
export function subscribePhotos(
  eventId: string,
  onUpdate: (photos: PhotoDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const cleanId = eventId?.trim();
  const { db } = getFirebase();
  const q = query(
    collection(db, "events", cleanId, "photos").withConverter(photoConverter),
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
