import { type Timestamp } from "firebase/firestore";

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface UserDoc {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
