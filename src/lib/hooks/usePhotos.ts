"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type QueryDocumentSnapshot } from "firebase/firestore";
import {
  subscribePhotos,
  getPhotosPaginated,
  uploadPhotoWithQuotaTransaction,
  deletePhotoWithQuotaRollback,
} from "@/lib/services/photoService";
import { type PhotoDoc } from "@/types";
import { AppError, handleFirebaseError } from "@/lib/errors";

export interface UsePhotosOptions {
  realtime?: boolean;
  pageSize?: number;
}

export interface UploadOptions {
  caption?: string;
  uploaderName?: string;
  customFilename?: string;
}

export interface UsePhotosReturn {
  photos: PhotoDoc[];
  loading: boolean;
  loadingMore: boolean;
  error: AppError | null;
  hasMore: boolean;
  uploading: boolean;
  uploadProgress: number;
  upload: (file: File | Blob, options?: UploadOptions) => Promise<PhotoDoc>;
  removePhoto: (photoId: string, storagePath?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom React Hook untuk data fetching dan mutasi foto event.
 * Mendukung real-time subscription (Live Feed) maupun cursor-based pagination (Galeri besar).
 *
 * @param eventId - ID event
 * @param options - Konfigurasi hook (mode real-time, ukuran halaman)
 */
export function usePhotos(
  eventId?: string | null,
  options: UsePhotosOptions = { realtime: true, pageSize: 20 }
): UsePhotosReturn {
  const [photos, setPhotos] = useState<PhotoDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const clearError = useCallback(() => setError(null), []);

  // Fetch halaman pertama untuk mode paginasi
  const fetchFirstPage = useCallback(async () => {
    const cleanId = eventId?.trim();
    if (!cleanId) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    lastDocRef.current = null;

    try {
      const result = await getPhotosPaginated({
        eventId: cleanId,
        pageSize: options.pageSize ?? 20,
      });

      if (!isMountedRef.current) return;
      setPhotos(result.photos);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (err) {
      if (isMountedRef.current) {
        setError(handleFirebaseError(err));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [eventId, options.pageSize]);

  // Muat halaman berikutnya (cursor-based pagination)
  const loadMore = useCallback(async () => {
    const cleanId = eventId?.trim();
    if (!cleanId || loadingMore || !hasMore || !lastDocRef.current) return;

    setLoadingMore(true);
    setError(null);

    try {
      const result = await getPhotosPaginated({
        eventId: cleanId,
        pageSize: options.pageSize ?? 20,
        lastDoc: lastDocRef.current,
      });

      if (!isMountedRef.current) return;
      setPhotos((prev) => [...prev, ...result.photos]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (err) {
      if (isMountedRef.current) {
        setError(handleFirebaseError(err));
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [eventId, hasMore, loadingMore, options.pageSize]);

  // Effect untuk real-time subscription atau initial paginated load
  useEffect(() => {
    isMountedRef.current = true;
    const cleanId = eventId?.trim();

    if (!cleanId) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    if (options.realtime) {
      setLoading(true);
      setError(null);

      const unsubscribe = subscribePhotos(
        cleanId,
        (updatedPhotos) => {
          if (isMountedRef.current) {
            setPhotos(updatedPhotos);
            setLoading(false);
          }
        },
        (err) => {
          if (isMountedRef.current) {
            setError(handleFirebaseError(err));
            setLoading(false);
          }
        }
      );

      return () => {
        isMountedRef.current = false;
        unsubscribe();
      };
    } else {
      fetchFirstPage();
      return () => {
        isMountedRef.current = false;
      };
    }
  }, [eventId, options.realtime, fetchFirstPage]);

  // Upload foto dengan tracking progress
  const upload = useCallback(
    async (file: File | Blob, uploadOptions?: UploadOptions): Promise<PhotoDoc> => {
      const cleanId = eventId?.trim();
      if (!cleanId) {
        const err = new AppError("ID event tidak ditemukan.", "INVALID_INPUT", 400);
        setError(err);
        throw err;
      }

      setUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const result = await uploadPhotoWithQuotaTransaction({
          eventId: cleanId,
          file,
          caption: uploadOptions?.caption,
          uploaderName: uploadOptions?.uploaderName,
          customFilename: uploadOptions?.customFilename,
          onProgress: (percent) => {
            if (isMountedRef.current) {
              setUploadProgress(percent);
            }
          },
        });

        // Jika bukan mode real-time, masukkan foto baru ke urutan paling atas secara optimis
        if (!options.realtime && isMountedRef.current) {
          setPhotos((prev) => [result.photo, ...prev]);
        }

        return result.photo;
      } catch (err) {
        const appErr = handleFirebaseError(err);
        if (isMountedRef.current) {
          setError(appErr);
        }
        throw appErr;
      } finally {
        if (isMountedRef.current) {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    },
    [eventId, options.realtime]
  );

  // Hapus foto
  const removePhoto = useCallback(
    async (photoId: string, storagePath?: string): Promise<void> => {
      const cleanId = eventId?.trim();
      if (!cleanId) return;

      setError(null);
      try {
        await deletePhotoWithQuotaRollback(cleanId, photoId, storagePath);

        if (!options.realtime && isMountedRef.current) {
          setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        }
      } catch (err) {
        const appErr = handleFirebaseError(err);
        if (isMountedRef.current) {
          setError(appErr);
        }
        throw appErr;
      }
    },
    [eventId, options.realtime]
  );

  return {
    photos,
    loading,
    loadingMore,
    error,
    hasMore,
    uploading,
    uploadProgress,
    upload,
    removePhoto,
    loadMore,
    refresh: fetchFirstPage,
    clearError,
  };
}
