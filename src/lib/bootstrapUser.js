import { adminDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Creates a minimum users/{uid} profile matching register_page.dart's
 * isSocialSetup path, for applicants who verify by phone OTP only and have
 * no existing DNA63 Community account. Never overwrites an existing profile
 * (e.g. a phone number that was already registered, or a duplicate submit).
 */
export async function ensureUserBootstrap(uid, { name, phone }) {
  const userRef = adminDb.collection("users").doc(uid);
  const snap = await userRef.get();
  if (snap.exists) return;

  await userRef.set({
    uid,
    name,
    email: "",
    zon: "TIDAK DITETAPKAN",
    referredBy: null,
    photoURL: null,
    createdAt: FieldValue.serverTimestamp(),
    reputationScore: 0,
    isRider: false,
    isVendor: false,
  });
  await userRef.collection("private").doc("main").set({
    walletBalance: 0,
    heldBalance: 0,
    phone: phone || "",
  });
}
