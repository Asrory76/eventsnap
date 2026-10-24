import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import {
  commentConverter,
  type CommentDoc,
  type GetCommentsOptions,
  type PaginatedCommentsResult,
} from "@/types";
import {
  UnauthorizedError,
  EventClosedError,
  ValidationError,
  handleFirebaseError,
} from "@/lib/errors";
import { getEventById } from "./eventService";

export interface AddCommentParams {
  eventId: string;
  photoId?: string;
  authorName?: string;
  message: string;
  authorUid?: string;
}

export interface SubscribeCommentsOptions {
  limitCount?: number;
  photoId?: string;
  onUpdate: (comments: CommentDoc[]) => void;
  onError?: (err: Error) => void;
}

const MAX_COMMENT_LENGTH = 500;

/**
 * Sanitasi dan validasi teks komentar.
 */
function sanitizeCommentMessage(message: string): string {
  const clean = message?.trim();
  if (!clean || clean.length < 1) {
    throw new ValidationError("Pesan ucapan tidak boleh kosong.");
  }
  if (clean.length > MAX_COMMENT_LENGTH) {
    throw new ValidationError(`Pesan ucapan maksimal ${MAX_COMMENT_LENGTH} karakter.`);
  }
  return clean;
}

/**
 * Tambah pesan ucapan atau komentar tamu pada event/foto.
 * Jika `photoId` disertakan, memperbarui `commentsCount` pada dokumen foto terkait secara atomik menggunakan WriteBatch.
 *
 * @param params - Parameter komentar
 * @returns CommentDoc
 */
export async function addComment(params: AddCommentParams): Promise<CommentDoc> {
  const cleanEventId = params.eventId?.trim();
  if (!cleanEventId) {
    throw new ValidationError("ID event wajib diisi.");
  }

  const cleanMessage = sanitizeCommentMessage(params.message);
  const cleanAuthorName = params.authorName?.trim() || "Tamu";
  const cleanPhotoId = params.photoId?.trim() || undefined;

  try {
    const { db, auth } = getFirebase();
    const currentUid = params.authorUid || auth.currentUser?.uid;

    if (!currentUid) {
      throw new UnauthorizedError("Pengguna harus terotentikasi untuk mengirim komentar.");
    }

    // Pastikan event aktif
    const event = await getEventById(cleanEventId);
    if (!event || event.status !== "active") {
      throw new EventClosedError("Event tidak aktif. Pengiriman pesan ucapan ditutup.");
    }

    const commentsColRef = collection(db, "events", cleanEventId, "comments").withConverter(
      commentConverter
    );
    const newCommentRef = doc(commentsColRef);
    const commentId = newCommentRef.id;

    const commentData: Omit<CommentDoc, "id"> = {
      eventId: cleanEventId,
      photoId: cleanPhotoId,
      authorUid: currentUid,
      authorName: cleanAuthorName,
      message: cleanMessage,
      createdAt: serverTimestamp() as unknown as Timestamp,
    };

    const batch = writeBatch(db);
    batch.set(newCommentRef, commentData as CommentDoc);

    // Jika terkait foto spesifik, increment counter foto secara atomik
    if (cleanPhotoId) {
      const photoRef = doc(db, "events", cleanEventId, "photos", cleanPhotoId);
      batch.update(photoRef, {
        commentsCount: increment(1),
      });
    }

    await batch.commit();

    return {
      id: commentId,
      ...commentData,
    };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Ambil daftar komentar per event atau per foto dengan Cursor-Based Pagination.
 *
 * @param options - Parameter query paginasi (eventId, photoId, pageSize, lastDoc)
 * @returns PaginatedCommentsResult
 */
export async function getCommentsPaginated(
  options: GetCommentsOptions
): Promise<PaginatedCommentsResult> {
  const { eventId, photoId, pageSize = 20, lastDoc } = options;
  const cleanEventId = eventId?.trim();
  if (!cleanEventId) {
    throw new ValidationError("ID event wajib diisi.");
  }

  try {
    const { db } = getFirebase();
    const commentsCol = collection(db, "events", cleanEventId, "comments").withConverter(
      commentConverter
    );

    let q = photoId
      ? query(
          commentsCol,
          where("photoId", "==", photoId),
          orderBy("createdAt", "desc"),
          limit(pageSize + 1)
        )
      : query(
          commentsCol,
          orderBy("createdAt", "desc"),
          limit(pageSize + 1)
        );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const comments = resultDocs.map((d) => d.data());
    const nextLastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

    return {
      comments,
      lastDoc: nextLastDoc,
      hasMore,
    };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Berlangganan pesan komentar secara real-time untuk Live Stream Wall.
 *
 * @param eventId - ID event
 * @param options - Opsi subscription
 * @returns Fungsi unsubscribe
 */
export function subscribeComments(
  eventId: string,
  options: SubscribeCommentsOptions
): Unsubscribe {
  const cleanEventId = eventId?.trim();
  const { db } = getFirebase();
  const { limitCount = 30, photoId, onUpdate, onError } = options;

  const baseCol = collection(db, "events", cleanEventId, "comments").withConverter(
    commentConverter
  );

  const q = photoId
    ? query(
        baseCol,
        where("photoId", "==", photoId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      )
    : query(baseCol, orderBy("createdAt", "desc"), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => docSnap.data());
      onUpdate(items);
    },
    (err) => {
      const appErr = handleFirebaseError(err);
      if (onError) onError(appErr);
    }
  );
}

/**
 * Hapus komentar secara atomik dan decrement commentsCount pada foto jika terkait.
 *
 * @param eventId - ID event
 * @param commentId - ID komentar
 * @param photoId - ID foto terkait (opsional)
 */
export async function deleteComment(
  eventId: string,
  commentId: string,
  photoId?: string
): Promise<void> {
  const cleanEventId = eventId?.trim();
  const cleanCommentId = commentId?.trim();

  if (!cleanEventId || !cleanCommentId) {
    throw new ValidationError("ID event dan ID komentar wajib disertakan.");
  }

  try {
    const { db, auth } = getFirebase();
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new UnauthorizedError();

    const commentRef = doc(db, "events", cleanEventId, "comments", cleanCommentId).withConverter(
      commentConverter
    );
    const existingSnap = await getDoc(commentRef);

    if (!existingSnap.exists()) return;
    const commentData = existingSnap.data();

    // Pastikan hanya author atau host yang bisa menghapus
    const event = await getEventById(cleanEventId);
    const isHost = event && event.hostId === currentUid;
    const isAuthor = commentData.authorUid === currentUid;

    if (!isHost && !isAuthor) {
      throw new UnauthorizedError("Anda tidak berhak menghapus komentar ini.");
    }

    const batch = writeBatch(db);
    batch.delete(commentRef);

    const targetPhotoId = photoId || commentData.photoId;
    if (targetPhotoId) {
      const photoRef = doc(db, "events", cleanEventId, "photos", targetPhotoId);
      batch.update(photoRef, {
        commentsCount: increment(-1),
      });
    }

    await batch.commit();
  } catch (error) {
    throw handleFirebaseError(error);
  }
}
