import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type Timestamp,
  type WithFieldValue,
  serverTimestamp,
} from "firebase/firestore";

export type PhotoStatus = "approved" | "pending" | "rejected";

export interface PhotoDoc {
  id: string;
  eventId: string;
  storagePath: string;
  url: string;
  uploadedBy: string;
  uploaderName?: string;
  caption?: string;
  likesCount: number;
  commentsCount?: number;
  status: PhotoStatus;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: Timestamp;
}

export type CreatePhotoInput = Omit<
  PhotoDoc,
  "id" | "likesCount" | "commentsCount" | "status" | "createdAt"
> & {
  likesCount?: number;
  commentsCount?: number;
  status?: PhotoStatus;
};

export interface GetPhotosOptions {
  eventId: string;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot | null;
  status?: PhotoStatus;
}

export interface PaginatedPhotosResult {
  photos: PhotoDoc[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export const photoConverter: FirestoreDataConverter<PhotoDoc> = {
  toFirestore(photo: WithFieldValue<PhotoDoc>): DocumentData {
    const data: DocumentData = {};

    if (photo.eventId !== undefined) data.eventId = photo.eventId;
    if (photo.storagePath !== undefined) data.storagePath = photo.storagePath;
    if (photo.url !== undefined) data.url = photo.url;
    if (photo.uploadedBy !== undefined) data.uploadedBy = photo.uploadedBy;
    if (photo.uploaderName !== undefined) data.uploaderName = photo.uploaderName;
    if (photo.caption !== undefined) data.caption = photo.caption;
    data.likesCount = typeof photo.likesCount === "number" ? photo.likesCount : 0;
    data.commentsCount = typeof photo.commentsCount === "number" ? photo.commentsCount : 0;
    data.status = photo.status || "approved";
    data.fileSize = photo.fileSize ?? 0;
    data.mimeType = photo.mimeType || "image/jpeg";
    if (photo.width !== undefined) data.width = photo.width;
    if (photo.height !== undefined) data.height = photo.height;

    if (photo.createdAt !== undefined) {
      data.createdAt = photo.createdAt;
    } else {
      data.createdAt = serverTimestamp();
    }

    return data;
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): PhotoDoc {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      eventId: (data.eventId as string) || "",
      storagePath: (data.storagePath as string) || "",
      url: (data.url as string) || "",
      uploadedBy: (data.uploadedBy as string) || "anonymous",
      uploaderName: data.uploaderName as string | undefined,
      caption: data.caption as string | undefined,
      likesCount: typeof data.likesCount === "number" ? data.likesCount : 0,
      commentsCount: typeof data.commentsCount === "number" ? data.commentsCount : 0,
      status: (data.status as PhotoStatus) || "approved",
      fileSize: typeof data.fileSize === "number" ? data.fileSize : 0,
      mimeType: (data.mimeType as string) || "image/jpeg",
      width: data.width as number | undefined,
      height: data.height as number | undefined,
      createdAt: data.createdAt as Timestamp,
    };
  },
};
