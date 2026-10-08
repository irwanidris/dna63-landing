import { adminAuth, adminDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const NEWSROOM_USERS_COLLECTION = "newsroomUsers";

export function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

/**
 * Verifies the Firebase ID token sent in the Authorization: Bearer <token>
 * header and loads (or auto-provisions) the caller's newsroom profile.
 *
 * Access is invite-only: an admin must first add the person's email to
 * `newsroomInvites`. On a user's first successful Google sign-in, if their
 * email matches a pending invite, a `newsroomUsers/{uid}` profile is created
 * from it automatically. Returns null if there is no valid, active, invited
 * newsroom user.
 *
 * Newsroom profiles live in their own collection because `users/{uid}` is
 * the DNA63 mobile app's profile (with its own `role` field) for the same
 * Firebase Auth accounts. The newsroom only ever reads it, to let the app's
 * admins in without an invite.
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

  const userRef = adminDb.collection(NEWSROOM_USERS_COLLECTION).doc(decoded.uid);
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
  const inviteRef = adminDb.collection("newsroomInvites").doc(email || "-");
  const inviteSnap = await inviteRef.get();
  if (!inviteSnap.exists) {
    // Not invited: admins of the mobile app are newsroom admins too.
    const appProfile = (await adminDb.collection("users").doc(decoded.uid).get()).data();
    if (appProfile?.role !== "admin") return null;
    return {
      uid: decoded.uid,
      email: decoded.email || appProfile.email,
      name: appProfile.name || decoded.name || decoded.email,
      role: "admin",
    };
  }

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
