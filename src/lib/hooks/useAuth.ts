"use client";

import { useState, useEffect, useCallback } from "react";
import {
  subscribeToAuthState,
  signInWithGoogle as authSignInWithGoogle,
  signInAsGuest as authSignInAsGuest,
  signOutUser as authSignOutUser,
  getCurrentUser,
  type AuthUserProfile,
} from "@/lib/services/authService";
import { AppError, handleFirebaseError } from "@/lib/errors";

export interface UseAuthReturn {
  user: AuthUserProfile | null;
  loading: boolean;
  error: AppError | null;
  signInWithGoogle: () => Promise<AuthUserProfile>;
  signInAsGuest: () => Promise<AuthUserProfile>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom React Hook untuk manajemen status autentikasi Firebase.
 * Menangani state user, loading, error, dan pembersihan listener saat unmount.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUserProfile | null>(() => getCurrentUser());
  const [loading, setLoading] = useState<boolean>(!user);
  const [error, setError] = useState<AppError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToAuthState((authUser) => {
      if (isMounted) {
        setUser(authUser);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthUserProfile> => {
    setLoading(true);
    setError(null);
    try {
      const profile = await authSignInWithGoogle();
      setUser(profile);
      return profile;
    } catch (err) {
      const appErr = handleFirebaseError(err);
      setError(appErr);
      throw appErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInAsGuest = useCallback(async (): Promise<AuthUserProfile> => {
    setLoading(true);
    setError(null);
    try {
      const profile = await authSignInAsGuest();
      setUser(profile);
      return profile;
    } catch (err) {
      const appErr = handleFirebaseError(err);
      setError(appErr);
      throw appErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authSignOutUser();
      setUser(null);
    } catch (err) {
      const appErr = handleFirebaseError(err);
      setError(appErr);
      throw appErr;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    clearError,
  };
}
