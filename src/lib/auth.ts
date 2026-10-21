// Session helpers — MVP: satu sesi anon per browser.
// Produksi: creator login Google di sini; guest tetap anon.
import { signInAnonymously } from "firebase/auth";
import { fb } from "./events";

export async function signIn(): Promise<string> {
  const { auth } = fb();
  if (auth.currentUser) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}
