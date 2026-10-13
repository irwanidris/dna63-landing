import { adminDb } from "./firebaseAdmin";
import { decodeImageDataUrl } from "./storageUpload";

// Shown when an account already has an application awaiting review.
export const PENDING_APPLICATION_MESSAGE =
  "Permohonan anda sedang disemak. Anda tidak perlu menghantar semula. Untuk pembetulan, sila hubungi support@dna63.com.";

// Statuses set by the mobile app's admin pages while an application is
// still open (APPROVED and REJECTED close it).
const OPEN_STATUSES = ["PENDING", "VERIFIED_BY_STAFF"];

/** Trimmed string within maxLen, or null if missing, not a string or too long. */
export function cleanText(value, maxLen) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maxLen ? text : null;
}

/** "YYYY-MM-DD", as sent by <input type="date">. */
export function isDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

/** "HH:MM" in 24-hour time, as sent by <input type="time">. */
export function isTimeString(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/**
 * Validates the given photos before anything is stored, so a request that
 * is going to fail leaves no files or documents behind. Returns a message
 * for the applicant, or null if every photo is a real image.
 */
export function checkPhotos(photos, keys) {
  for (const key of keys) {
    if (!photos[key]) return `Gambar wajib tiada: ${key}`;
    try {
      decodeImageDataUrl(photos[key]);
    } catch (err) {
      return `${err.message} (${key})`;
    }
  }
  return null;
}

/**
 * True if this account already has an application awaiting review, whether
 * it was sent from this site or from the mobile app. Filters on uid only and
 * checks the status here, so no composite index is needed.
 */
export async function hasPendingApplication(collection, uid) {
  const snap = await adminDb.collection(collection).where("uid", "==", uid).select("status").get();
  return snap.docs.some((doc) => OPEN_STATUSES.includes(doc.get("status")));
}
