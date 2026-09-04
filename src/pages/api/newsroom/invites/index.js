import { adminDb } from "../../../../lib/firebaseAdmin";
import { withNewsroomAuth, normalizeEmail } from "../../../../lib/newsroomAuth";
import { FieldValue } from "firebase-admin/firestore";

async function handler(req, res, user) {
  if (req.method === "GET") {
    const [invitesSnap, usersSnap] = await Promise.all([
      adminDb.collection("newsroomInvites").get(),
      adminDb.collection("users").get(),
    ]);

    const usersByUid = new Map(usersSnap.docs.map((d) => [d.id, { uid: d.id, ...d.data() }]));
    const people = invitesSnap.docs.map((d) => {
      const invite = d.data();
      const activeUser = invite.claimedUid ? usersByUid.get(invite.claimedUid) : null;
      return {
        email: d.id,
        role: activeUser?.role || invite.role,
        status: activeUser ? (activeUser.disabled ? "disabled" : "active") : "pending",
        uid: activeUser?.uid || null,
        name: activeUser?.name || null,
      };
    });

    return res.status(200).json({ people });
  }

  if (req.method === "POST") {
    const { email, role } = req.body || {};
    const normalized = normalizeEmail(email);
    if (!normalized || !normalized.includes("@")) {
      return res.status(400).json({ error: "Emel tidak sah." });
    }
    const finalRole = role === "admin" ? "admin" : "author";

    const inviteRef = adminDb.collection("newsroomInvites").doc(normalized);
    const existing = await inviteRef.get();

    if (existing.exists && existing.data().claimedUid) {
      // Already an active/known account — just update their role, don't
      // reset their invite status back to "pending".
      await inviteRef.update({ role: finalRole });
      await adminDb.collection("users").doc(existing.data().claimedUid).update({ role: finalRole });
    } else {
      await inviteRef.set({
        role: finalRole,
        status: "pending",
        invitedBy: user.uid,
        invitedAt: FieldValue.serverTimestamp(),
      });
    }

    return res.status(201).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler, { requireAdmin: true });
