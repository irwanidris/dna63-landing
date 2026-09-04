import { adminDb } from "../../../lib/firebaseAdmin";
import { normalizeEmail } from "../../../lib/newsroomAuth";
import { FieldValue } from "firebase-admin/firestore";

// One-time setup endpoint: invites the first newsroom admin by email.
// Protected by ADMIN_BOOTSTRAP_SECRET (server-only env var), not by login,
// since at this point no admin account exists yet. The invited person then
// signs in with Google using this exact email at /newsroom/login, which
// auto-provisions their admin profile.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { secret, email } = req.body || {};
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!expected) {
    return res.status(500).json({ error: "ADMIN_BOOTSTRAP_SECRET tidak ditetapkan pada server." });
  }
  if (!secret || secret !== expected) {
    return res.status(401).json({ error: "Secret salah." });
  }
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return res.status(400).json({ error: "Emel tidak sah." });
  }

  await adminDb.collection("newsroomInvites").doc(normalized).set(
    {
      role: "admin",
      status: "pending",
      invitedBy: "bootstrap",
      invitedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return res.status(201).json({ email: normalized });
}
