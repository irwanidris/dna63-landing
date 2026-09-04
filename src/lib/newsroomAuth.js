import { adminAuth, adminDb } from "./firebaseAdmin";

/**
 * Verifies the Firebase ID token sent in the Authorization: Bearer <token>
 * header and loads the caller's newsroom profile (role) from Firestore.
 * Returns null if there is no valid, active newsroom user.
 */
export async function getNewsroomUser(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(match[1]);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    if (!snap.exists) return null;

    const profile = snap.data();
    if (profile.disabled) return null;
    if (!["admin", "author"].includes(profile.role)) return null;

    return {
      uid: decoded.uid,
      email: decoded.email || profile.email,
      name: profile.name || decoded.email,
      role: profile.role,
    };
  } catch (err) {
    return null;
  }
}

/**
 * API route guard. Calls handler(req, res, user) only if the caller is an
 * authenticated, non-disabled newsroom user. If `requireAdmin` is true,
 * only role === "admin" is allowed.
 */
export function withNewsroomAuth(handler, { requireAdmin = false } = {}) {
  return async (req, res) => {
    const user = await getNewsroomUser(req);
    if (!user) {
      return res.status(401).json({ error: "Sila log masuk semula." });
    }
    if (requireAdmin && user.role !== "admin") {
      return res.status(403).json({ error: "Akses admin sahaja." });
    }
    return handler(req, res, user);
  };
}
