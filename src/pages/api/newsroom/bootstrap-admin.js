import { adminAuth, adminDb } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// One-time setup endpoint: creates (or promotes) the first newsroom admin.
// Protected by ADMIN_BOOTSTRAP_SECRET (server-only env var), not by login,
// since at this point no admin account exists yet.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { secret, email, password, name } = req.body || {};
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!expected) {
    return res.status(500).json({ error: "ADMIN_BOOTSTRAP_SECRET tidak ditetapkan pada server." });
  }
  if (!secret || secret !== expected) {
    return res.status(401).json({ error: "Secret salah." });
  }
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: "Emel diperlukan dan kata laluan mesti sekurang-kurangnya 8 aksara." });
  }

  let userRecord;
  try {
    userRecord = await adminAuth.createUser({
      email: email.trim(),
      password,
      displayName: (name && name.trim()) || email.trim(),
    });
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      userRecord = await adminAuth.getUserByEmail(email.trim());
    } else {
      return res.status(500).json({ error: err.message });
    }
  }

  await adminDb.collection("users").doc(userRecord.uid).set(
    {
      email: email.trim(),
      name: (name && name.trim()) || email.trim(),
      role: "admin",
      disabled: false,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
}
