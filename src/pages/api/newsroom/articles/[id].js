import { adminDb } from "../../../../lib/firebaseAdmin";
import { withNewsroomAuth } from "../../../../lib/newsroomAuth";
import {
  ARTICLES_COLLECTION,
  slugify,
  sanitizeHtml,
  toExcerpt,
  uniqueSlug,
  serializeArticle,
} from "../../../../lib/articles";
import { FieldValue } from "firebase-admin/firestore";

async function handler(req, res, user) {
  const { id } = req.query;
  const ref = adminDb.collection(ARTICLES_COLLECTION).doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    return res.status(404).json({ error: "Artikel tidak dijumpai." });
  }

  const existing = snap.data();
  const isOwner = existing.authorId === user.uid;
  if (!isOwner && user.role !== "admin") {
    return res.status(403).json({ error: "Anda tiada akses ke artikel ini." });
  }

  if (req.method === "GET") {
    return res.status(200).json({ article: serializeArticle(snap) });
  }

  if (req.method === "PUT") {
    const { title, contentHtml, category, status, coverImageUrl, excerpt } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Tajuk diperlukan." });
    }

    const cleanHtml = sanitizeHtml(contentHtml);
    const finalStatus = status === "published" ? "published" : "draft";
    const wasPublished = existing.status === "published";

    const update = {
      title: title.trim(),
      contentHtml: cleanHtml,
      excerpt: (excerpt && excerpt.trim()) || toExcerpt(cleanHtml),
      coverImageUrl: coverImageUrl || null,
      category: (category && category.trim()) || "Umum",
      status: finalStatus,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Re-slug only if the title actually changed, to keep published URLs stable.
    if (title.trim() !== existing.title) {
      update.slug = await uniqueSlug(slugify(title), id);
    }

    if (finalStatus === "published" && !wasPublished) {
      update.publishedAt = FieldValue.serverTimestamp();
    }

    await ref.update(update);
    const saved = await ref.get();
    return res.status(200).json({ article: serializeArticle(saved) });
  }

  if (req.method === "DELETE") {
    await ref.delete();
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler);
