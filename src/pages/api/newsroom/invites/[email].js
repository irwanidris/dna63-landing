import { adminDb } from "../../../../lib/firebaseAdmin";
import { withNewsroomAuth, normalizeEmail, NEWSROOM_USERS_COLLECTION } from "../../../../lib/newsroomAuth";

async function handler(req, res, user) {
  const email = normalizeEmail(req.query.email);
  const inviteRef = adminDb.collection("newsroomInvites").doc(email);
  const inviteSnap = await inviteRef.get();
  if (!inviteSnap.exists) {
    return res.status(404).json({ error: "Jemputan tidak dijumpai." });
  }
  const invite = inviteSnap.data();

  if (invite.claimedUid === user.uid) {
    return res.status(400).json({ error: "Tidak boleh ubah akaun sendiri di sini." });
  }

  if (req.method === "PATCH") {
    const { disabled } = req.body || {};
    if (typeof disabled !== "boolean") {
      return res.status(400).json({ error: "Tiada perubahan dihantar." });
    }
    if (!invite.claimedUid) {
      return res.status(400).json({ error: "Jemputan belum dituntut — belum ada akaun untuk dinyahaktifkan." });
    }
    // Only the newsroom profile is touched: the Firebase Auth account and
    // users/{uid} belong to the person's DNA63 mobile app account.
    await adminDb.collection(NEWSROOM_USERS_COLLECTION).doc(invite.claimedUid).set({ disabled }, { merge: true });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    if (invite.claimedUid) {
      await adminDb.collection(NEWSROOM_USERS_COLLECTION).doc(invite.claimedUid).delete();
    }
    await inviteRef.delete();
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler, { requireAdmin: true });
