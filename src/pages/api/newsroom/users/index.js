import { adminAuth, adminDb } from "../../../../lib/firebaseAdmin";
import { withNewsroomAuth } from "../../../../lib/newsroomAuth";
import { FieldValue } from "firebase-admin/firestore";

function generateTempPassword() {
  return `Dna63-${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 90 + 10)}`;
}

async function handler(req, res) {
  if (req.method === "GET") {
    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data(), createdAt: undefined }));
    return res.status(200).json({ users });
  }

  if (req.method === "POST") {
    const { email, name, role } = req.body || {};
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Emel diperlukan." });
    }
    const finalRole = role === "admin" ? "admin" : "author";
    const tempPassword = generateTempPassword();

    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email: email.trim(),
        password: tempPassword,
        displayName: (name && name.trim()) || email.trim(),
      });
    } catch (err) {
      if (err.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "Emel ini sudah didaftarkan." });
      }
      throw err;
    }

    await adminDb.collection("users").doc(userRecord.uid).set({
      email: email.trim(),
      name: (name && name.trim()) || email.trim(),
      role: finalRole,
      disabled: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Temp password is returned once so the admin can hand it to the author.
    // It is never stored or retrievable again — the author should change it
    // via Firebase's "forgot password" flow on first login.
    return res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      tempPassword,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler, { requireAdmin: true });
