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
  if (req.method === "GET") {
    let query = adminDb.collection(ARTICLES_COLLECTION);

    // Authors only see their own articles; admins can see everyone's.
    if (user.role !== "admin" || req.query.mine === "1") {
      query = query.where("authorId", "==", user.uid);
    }
    if (req.query.status) {
      query = query.where("status", "==", req.query.status);
    }

    const snap = await query.orderBy("updatedAt", "desc").limit(200).get();
    return res.status(200).json({ articles: snap.docs.map(serializeArticle) });
  }

  if (req.method === "POST") {
    const { title, contentHtml, category, status, coverImageUrl, excerpt } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Tajuk diperlukan." });
    }

    const cleanHtml = sanitizeHtml(contentHtml);
    const baseSlug = slugify(title);
    const slug = await uniqueSlug(baseSlug);
    const finalStatus = status === "published" ? "published" : "draft";
    const now = FieldValue.serverTimestamp();

    const docRef = await adminDb.collection(ARTICLES_COLLECTION).add({
      title: title.trim(),
      slug,
      contentHtml: cleanHtml,
      excerpt: (excerpt && excerpt.trim()) || toExcerpt(cleanHtml),
      coverImageUrl: coverImageUrl || null,
      category: (category && category.trim()) || "Umum",
      status: finalStatus,
      authorId: user.uid,
      authorName: user.name,
      createdAt: now,
      updatedAt: now,
      publishedAt: finalStatus === "published" ? now : null,
    });

    const saved = await docRef.get();
    return res.status(201).json({ article: serializeArticle(saved) });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler);
