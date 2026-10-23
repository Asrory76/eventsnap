"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getEventById,
  getEventBySlug,
  subscribeEvent,
  updateEventStatus,
  updateEventQuota,
  deleteEvent,
} from "@/lib/services/eventService";
import { type EventDoc, type EventStatus } from "@/types";
import { AppError, handleFirebaseError } from "@/lib/errors";

export interface UseEventOptions {
  realtime?: boolean;
}

export interface UseEventReturn {
  event: EventDoc | null;
  loading: boolean;
  error: AppError | null;
  isActive: boolean;
  updateStatus: (status: EventStatus) => Promise<void>;
  updateQuota: (maxPhotoQuota: number) => Promise<void>;
  deleteCurrentEvent: () => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom React Hook untuk fetch data & mendengarkan pembaruan dokumen event.
 * Membersihkan listener Firestore secara otomatis saat komponen unmount.
 *
 * @param eventIdOrSlug - ID dokumen atau slug unik event
 * @param options - Konfigurasi hook (realtime listener)
 */
export function useEvent(
  eventIdOrSlug?: string | null,
  options: UseEventOptions = { realtime: true }
): UseEventReturn {
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchEvent = useCallback(async () => {
    const target = eventIdOrSlug?.trim();
    if (!target) {
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let data = await getEventById(target);
      if (!data) {
        data = await getEventBySlug(target);
      }
      setEvent(data);
    } catch (err) {
      setError(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }, [eventIdOrSlug]);

  useEffect(() => {
    const target = eventIdOrSlug?.trim();
    if (!target) {
      setEvent(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    setLoading(true);
    setError(null);

    // Initial resolution (handle whether target is ID or Slug)
    const resolveAndSubscribe = async () => {
      try {
        let initialDoc = await getEventById(target);
        if (!initialDoc) {
          initialDoc = await getEventBySlug(target);
        }

        if (!isMounted) return;

        setEvent(initialDoc);
        setLoading(false);

        if (options.realtime && initialDoc?.id) {
          unsubscribe = subscribeEvent(
            initialDoc.id,
            (updatedDoc) => {
              if (isMounted) {
                setEvent(updatedDoc);
                setLoading(false);
              }
            },
            (err) => {
              if (isMounted) {
                setError(handleFirebaseError(err));
                setLoading(false);
              }
            }
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(handleFirebaseError(err));
          setLoading(false);
        }
      }
    };

    resolveAndSubscribe();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [eventIdOrSlug, options.realtime]);

  const updateStatus = useCallback(
    async (status: EventStatus): Promise<void> => {
      if (!event?.id) return;
      try {
        await updateEventStatus(event.id, status);
      } catch (err) {
        const appErr = handleFirebaseError(err);
        setError(appErr);
        throw appErr;
      }
    },
    [event?.id]
  );

  const updateQuota = useCallback(
    async (maxPhotoQuota: number): Promise<void> => {
      if (!event?.id) return;
      try {
        await updateEventQuota(event.id, maxPhotoQuota);
      } catch (err) {
        const appErr = handleFirebaseError(err);
        setError(appErr);
        throw appErr;
      }
    },
    [event?.id]
  );

  const deleteCurrentEvent = useCallback(async (): Promise<void> => {
    if (!event?.id) return;
    try {
      await deleteEvent(event.id);
      setEvent(null);
    } catch (err) {
      const appErr = handleFirebaseError(err);
      setError(appErr);
      throw appErr;
    }
  }, [event?.id]);

  const isActive = Boolean(
    event && event.status === "active" && event.usedPhotoQuota < event.maxPhotoQuota
  );

  return {
    event,
    loading,
    error,
    isActive,
    updateStatus,
    updateQuota,
    deleteCurrentEvent,
    refetch: fetchEvent,
    clearError,
  };
}
