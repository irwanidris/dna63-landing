import { adminAuth, adminDb } from "../../../../lib/firebaseAdmin";
import { withNewsroomAuth } from "../../../../lib/newsroomAuth";

async function handler(req, res, user) {
  const { uid } = req.query;

  if (req.method === "PATCH") {
    if (uid === user.uid) {
      return res.status(400).json({ error: "Tidak boleh ubah akaun sendiri di sini." });
    }
    const { role, disabled } = req.body || {};
    const update = {};
    if (role === "admin" || role === "author") update.role = role;
    if (typeof disabled === "boolean") {
      update.disabled = disabled;
      await adminAuth.updateUser(uid, { disabled });
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Tiada perubahan dihantar." });
    }
    await adminDb.collection("users").doc(uid).update(update);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    if (uid === user.uid) {
      return res.status(400).json({ error: "Tidak boleh padam akaun sendiri." });
    }
    await adminAuth.deleteUser(uid).catch(() => {});
    await adminDb.collection("users").doc(uid).delete();
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler, { requireAdmin: true });
