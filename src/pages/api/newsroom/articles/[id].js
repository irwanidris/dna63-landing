import { adminDb } from "../../../../lib/firebaseAdmin";
import { withNewsroomAuth } from "../../../../lib/newsroomAuth";
import {
  ARTICLES_COLLECTION,
  slugify,
  uniqueSlug,
  serializeArticle,
  buildArticleFields,
  revalidateArticlePages,
} from "../../../../lib/articles";

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
    const { error, fields: update } = await buildArticleFields(req.body, user, existing);
    if (error) {
      return res.status(400).json({ error });
    }

    // The slug is the article's permanent URL (and its RSS guid): it follows
    // the title only until the article first goes live, then never changes.
    const wasLive = existing.publishedAt && existing.publishedAt.toMillis() <= Date.now();
    if (!wasLive && update.title !== existing.title) {
      update.slug = await uniqueSlug(slugify(update.title), id);
    }

    await ref.update(update);
    const saved = await ref.get();
    if (existing.status === "published" || update.status === "published") {
      await revalidateArticlePages(res, saved.data().slug);
    }
    return res.status(200).json({ article: serializeArticle(saved) });
  }

  if (req.method === "DELETE") {
    await ref.delete();
    if (existing.status === "published") {
      await revalidateArticlePages(res, existing.slug);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler);
