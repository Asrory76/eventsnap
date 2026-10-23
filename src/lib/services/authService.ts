import {
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { type AuthUserProfile } from "@/types";
import { handleFirebaseError } from "@/lib/errors";

export type { AuthUserProfile };

/**
 * Memetakan objek Firebase User ke profil antarmuka internal PicMe.
 */
function mapFirebaseUser(user: User | null): AuthUserProfile | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.isAnonymous ? "Tamu" : "Pengguna"),
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    createdAt: user.metadata.creationTime,
    lastLoginAt: user.metadata.lastSignInTime,
  };
}

/**
 * Menyinkronkan profil pengguna ke koleksi Firestore 'users/{uid}'
 * untuk pencatatan riwayat sesi dan kepemilikan data.
 */
async function syncUserProfileToFirestore(user: User): Promise<void> {
  try {
    const { db } = getFirebase();
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || (user.isAnonymous ? "Tamu" : "Pengguna"),
        photoURL: user.photoURL || null,
        isAnonymous: user.isAnonymous,
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Sync profil bersifat non-blocking agar kegagalan izin/jaringan tidak menghambat flow UX
  }
}

/**
 * Autentikasi Tamu Cepat (Anonymous Authentication).
 * Digunakan saat tamu scan QR code agar dapat langsung mengunggah foto tanpa perlu registrasi manual.
 *
 * @returns AuthUserProfile
 */
export async function signInAsGuest(): Promise<AuthUserProfile> {
  try {
    const { auth } = getFirebase();
    if (auth.currentUser) {
      const profile = mapFirebaseUser(auth.currentUser)!;
      syncUserProfileToFirestore(auth.currentUser).catch(() => null);
      return profile;
    }

    const credential = await signInAnonymously(auth);
    syncUserProfileToFirestore(credential.user).catch(() => null);
    return mapFirebaseUser(credential.user)!;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Helper signIn standar: Mengembalikan UID string pengguna saat ini.
 * Memastikan kompatibilitas backward dengan seluruh komponen UI yang ada.
 *
 * @returns UID string
 */
export async function signIn(): Promise<string> {
  const profile = await signInAsGuest();
  return profile.uid;
}

/**
 * Login Host / Event Creator menggunakan Akun Google (Google OAuth Popup).
 *
 * @returns AuthUserProfile
 */
export async function signInWithGoogle(): Promise<AuthUserProfile> {
  try {
    const { auth } = getFirebase();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    await syncUserProfileToFirestore(result.user);
    return mapFirebaseUser(result.user)!;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Logout pengguna saat ini dari Firebase Auth session.
 */
export async function signOutUser(): Promise<void> {
  try {
    const { auth } = getFirebase();
    await signOut(auth);
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

/**
 * Dapatkan data user yang sedang aktif secara sinkron dari memory cache Firebase Auth.
 *
 * @returns AuthUserProfile | null
 */
export function getCurrentUser(): AuthUserProfile | null {
  try {
    const { auth } = getFirebase();
    return mapFirebaseUser(auth.currentUser);
  } catch {
    return null;
  }
}

/**
 * Berlangganan perubahan status autentikasi Firebase secara real-time.
 * Mengembalikan fungsi Unsubscribe untuk membersihkan listener saat unmount di React lifecycle.
 *
 * @param callback - Fungsi penerima profil user
 * @returns Unsubscribe
 */
export function subscribeToAuthState(
  callback: (user: AuthUserProfile | null) => void
): Unsubscribe {
  const { auth } = getFirebase();
  return onAuthStateChanged(auth, (user) => {
    callback(mapFirebaseUser(user));
  });
}
