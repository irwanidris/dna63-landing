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
    const { error, fields } = await buildArticleFields(req.body, user);
    if (error) {
      return res.status(400).json({ error });
    }

    const slug = await uniqueSlug(slugify(fields.title));

    const docRef = await adminDb.collection(ARTICLES_COLLECTION).add({
      publishedAt: null,
      ...fields,
      slug,
      authorId: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    const saved = await docRef.get();
    if (fields.status === "published") {
      await revalidateArticlePages(res, slug);
    }
    return res.status(201).json({ article: serializeArticle(saved) });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler);
