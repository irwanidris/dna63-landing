import { adminAuth, adminDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

/**
 * Verifies the Firebase ID token sent in the Authorization: Bearer <token>
 * header and loads (or auto-provisions) the caller's newsroom profile.
 *
 * Access is invite-only: an admin must first add the person's email to
 * `newsroomInvites`. On a user's first successful Google sign-in, if their
 * email matches a pending invite, a `users/{uid}` profile is created from
 * it automatically. Returns null if there is no valid, active, invited
 * newsroom user.
 */
export async function getNewsroomUser(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return null;

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(match[1]);
  } catch {
    return null;
  }

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const snap = await userRef.get();

  if (snap.exists) {
    const profile = snap.data();
    if (profile.disabled) return null;
    if (!["admin", "author"].includes(profile.role)) return null;
    return {
      uid: decoded.uid,
      email: decoded.email || profile.email,
      name: profile.name || decoded.name || decoded.email,
      role: profile.role,
    };
  }

  // No profile yet — check for a pending invite by email and auto-provision.
  const email = normalizeEmail(decoded.email);
  if (!email) return null;

  const inviteRef = adminDb.collection("newsroomInvites").doc(email);
  const inviteSnap = await inviteRef.get();
  if (!inviteSnap.exists) return null;

  const invite = inviteSnap.data();
  if (invite.status === "revoked") return null;
  if (!["admin", "author"].includes(invite.role)) return null;

  const name = decoded.name || decoded.email;
  await userRef.set({
    email: decoded.email,
    name,
    role: invite.role,
    disabled: false,
    createdAt: FieldValue.serverTimestamp(),
  });
  await inviteRef.update({
    status: "claimed",
    claimedUid: decoded.uid,
    claimedAt: FieldValue.serverTimestamp(),
  });

  return { uid: decoded.uid, email: decoded.email, name, role: invite.role };
}

/**
 * API route guard. Calls handler(req, res, user) only if the caller is an
 * authenticated, non-disabled, invited newsroom user. If `requireAdmin` is
 * true, only role === "admin" is allowed.
 */
export function withNewsroomAuth(handler, { requireAdmin = false } = {}) {
  return async (req, res) => {
    const user = await getNewsroomUser(req);
    if (!user) {
      return res.status(401).json({ error: "Emel anda belum diberi akses newsroom." });
    }
    if (requireAdmin && user.role !== "admin") {
      return res.status(403).json({ error: "Akses admin sahaja." });
    }
    return handler(req, res, user);
  };
}
