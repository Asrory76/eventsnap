import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type Timestamp,
  type WithFieldValue,
  serverTimestamp,
} from "firebase/firestore";

export interface CommentDoc {
  id: string;
  eventId: string;
  photoId?: string;
  authorUid: string;
  authorName: string;
  message: string;
  createdAt: Timestamp;
}

export type CreateCommentInput = Omit<CommentDoc, "id" | "createdAt">;

export interface GetCommentsOptions {
  eventId: string;
  photoId?: string;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot | null;
}

export interface PaginatedCommentsResult {
  comments: CommentDoc[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export const commentConverter: FirestoreDataConverter<CommentDoc> = {
  toFirestore(comment: WithFieldValue<CommentDoc>): DocumentData {
    const data: DocumentData = {};

    if (comment.eventId !== undefined) data.eventId = comment.eventId;
    if (comment.photoId !== undefined) data.photoId = comment.photoId;
    if (comment.authorUid !== undefined) data.authorUid = comment.authorUid;
    if (comment.authorName !== undefined) {
      data.authorName = typeof comment.authorName === "string" ? comment.authorName.trim() : comment.authorName;
    } else {
      data.authorName = "Tamu";
    }
    if (comment.message !== undefined) {
      data.message = typeof comment.message === "string" ? comment.message.trim() : comment.message;
    } else {
      data.message = "";
    }

    if (comment.createdAt !== undefined) {
      data.createdAt = comment.createdAt;
    } else {
      data.createdAt = serverTimestamp();
    }

    return data;
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): CommentDoc {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      eventId: (data.eventId as string) || "",
      photoId: data.photoId as string | undefined,
      authorUid: (data.authorUid as string) || "anonymous",
      authorName: (data.authorName as string) || "Tamu",
      message: (data.message as string) || "",
      createdAt: data.createdAt as Timestamp,
    };
  },
};
