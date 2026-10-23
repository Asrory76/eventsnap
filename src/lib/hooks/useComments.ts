"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type QueryDocumentSnapshot } from "firebase/firestore";
import {
  subscribeComments,
  getCommentsPaginated,
  addComment as serviceAddComment,
  deleteComment as serviceDeleteComment,
} from "@/lib/services/commentService";
import { type CommentDoc } from "@/types";
import { AppError, handleFirebaseError } from "@/lib/errors";

export interface UseCommentsOptions {
  photoId?: string;
  realtime?: boolean;
  limitCount?: number;
  pageSize?: number;
}

export interface UseCommentsReturn {
  comments: CommentDoc[];
  loading: boolean;
  loadingMore: boolean;
  error: AppError | null;
  hasMore: boolean;
  submitting: boolean;
  postComment: (message: string, authorName?: string) => Promise<CommentDoc>;
  removeComment: (commentId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom React Hook untuk data fetching dan interaksi komentar tamu / ucapan selamat.
 *
 * @param eventId - ID event
 * @param options - Konfigurasi hook
 */
export function useComments(
  eventId?: string | null,
  options: UseCommentsOptions = { realtime: true, limitCount: 30, pageSize: 20 }
): UseCommentsReturn {
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const clearError = useCallback(() => setError(null), []);

  // Fetch paginasi non-realtime
  const fetchFirstPage = useCallback(async () => {
    const cleanId = eventId?.trim();
    if (!cleanId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    lastDocRef.current = null;

    try {
      const result = await getCommentsPaginated({
        eventId: cleanId,
        photoId: options.photoId,
        pageSize: options.pageSize ?? 20,
      });

      if (!isMountedRef.current) return;
      setComments(result.comments);
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
  }, [eventId, options.photoId, options.pageSize]);

  const loadMore = useCallback(async () => {
    const cleanId = eventId?.trim();
    if (!cleanId || loadingMore || !hasMore || !lastDocRef.current) return;

    setLoadingMore(true);
    setError(null);

    try {
      const result = await getCommentsPaginated({
        eventId: cleanId,
        photoId: options.photoId,
        pageSize: options.pageSize ?? 20,
        lastDoc: lastDocRef.current,
      });

      if (!isMountedRef.current) return;
      setComments((prev) => [...prev, ...result.comments]);
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
  }, [eventId, hasMore, loadingMore, options.photoId, options.pageSize]);

  useEffect(() => {
    isMountedRef.current = true;
    const cleanId = eventId?.trim();

    if (!cleanId) {
      setComments([]);
      setLoading(false);
      return;
    }

    if (options.realtime) {
      setLoading(true);
      setError(null);

      const unsubscribe = subscribeComments(cleanId, {
        limitCount: options.limitCount ?? 30,
        photoId: options.photoId,
        onUpdate: (updatedComments) => {
          if (isMountedRef.current) {
            setComments(updatedComments);
            setLoading(false);
          }
        },
        onError: (err) => {
          if (isMountedRef.current) {
            setError(handleFirebaseError(err));
            setLoading(false);
          }
        },
      });

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
  }, [eventId, options.realtime, options.limitCount, options.photoId, fetchFirstPage]);

  const postComment = useCallback(
    async (message: string, authorName?: string): Promise<CommentDoc> => {
      const cleanId = eventId?.trim();
      if (!cleanId) {
        const err = new AppError("ID event tidak ditemukan.", "INVALID_INPUT", 400);
        setError(err);
        throw err;
      }

      setSubmitting(true);
      setError(null);
      try {
        const newComment = await serviceAddComment({
          eventId: cleanId,
          photoId: options.photoId,
          message,
          authorName,
        });

        if (!options.realtime && isMountedRef.current) {
          setComments((prev) => [newComment, ...prev]);
        }

        return newComment;
      } catch (err) {
        const appErr = handleFirebaseError(err);
        if (isMountedRef.current) {
          setError(appErr);
        }
        throw appErr;
      } finally {
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [eventId, options.photoId, options.realtime]
  );

  const removeComment = useCallback(
    async (commentId: string): Promise<void> => {
      const cleanId = eventId?.trim();
      if (!cleanId) return;

      setError(null);
      try {
        await serviceDeleteComment(cleanId, commentId, options.photoId);
        if (!options.realtime && isMountedRef.current) {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
      } catch (err) {
        const appErr = handleFirebaseError(err);
        if (isMountedRef.current) {
          setError(appErr);
        }
        throw appErr;
      }
    },
    [eventId, options.photoId, options.realtime]
  );

  return {
    comments,
    loading,
    loadingMore,
    error,
    hasMore,
    submitting,
    postComment,
    removeComment,
    loadMore,
    clearError,
  };
}
