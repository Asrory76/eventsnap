import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type Timestamp,
  type WithFieldValue,
  serverTimestamp,
} from "firebase/firestore";

export type EventStatus = "upcoming" | "active" | "ended";

export interface EventDoc {
  id: string;
  slug: string;
  title: string;
  description?: string;
  hostId: string;
  status: EventStatus;
  maxPhotoQuota: number;
  usedPhotoQuota: number;
  isModerationEnabled: boolean;
  coverUrl?: string;
  pin?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  hostId?: string;
  maxPhotoQuota?: number;
  isModerationEnabled?: boolean;
  coverUrl?: string;
  slug?: string;
  status?: EventStatus;
  pin?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  status?: EventStatus;
  maxPhotoQuota?: number;
  isModerationEnabled?: boolean;
  coverUrl?: string;
  slug?: string;
  pin?: string;
}

export const eventConverter: FirestoreDataConverter<EventDoc> = {
  toFirestore(event: WithFieldValue<EventDoc>): DocumentData {
    const data: DocumentData = {};

    if (event.slug !== undefined) data.slug = event.slug;
    if (event.title !== undefined) data.title = event.title;
    if (event.description !== undefined) data.description = event.description;
    if (event.hostId !== undefined) data.hostId = event.hostId;
    if (event.status !== undefined) data.status = event.status;
    if (event.maxPhotoQuota !== undefined) data.maxPhotoQuota = event.maxPhotoQuota;
    if (event.usedPhotoQuota !== undefined) data.usedPhotoQuota = event.usedPhotoQuota;
    if (event.isModerationEnabled !== undefined) {
      data.isModerationEnabled = event.isModerationEnabled;
    }
    if (event.coverUrl !== undefined) data.coverUrl = event.coverUrl;
    if (event.pin !== undefined) data.pin = event.pin;

    if (event.createdAt !== undefined) {
      data.createdAt = event.createdAt;
    } else {
      data.createdAt = serverTimestamp();
    }
    data.updatedAt = serverTimestamp();

    return data;
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): EventDoc {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      slug: (data.slug as string) || snapshot.id,
      title: (data.title as string) || "Untitled Event",
      description: data.description as string | undefined,
      hostId: (data.hostId || data.ownerUid || "") as string,
      status: (data.status as EventStatus) || "active",
      maxPhotoQuota: typeof data.maxPhotoQuota === "number" ? data.maxPhotoQuota : 500,
      usedPhotoQuota: typeof data.usedPhotoQuota === "number" ? data.usedPhotoQuota : 0,
      isModerationEnabled: Boolean(data.isModerationEnabled),
      coverUrl: data.coverUrl as string | undefined,
      pin: data.pin as string | undefined,
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp,
    };
  },
};
