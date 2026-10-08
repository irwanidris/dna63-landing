import { adminDb } from "../../../../lib/firebaseAdmin";
import { withNewsroomAuth } from "../../../../lib/newsroomAuth";
import { ARTICLES_COLLECTION } from "../../../../lib/articles";
import {
  CATEGORIES_COLLECTION,
  cleanCategoryName,
  listCategories,
  findCategoryByName,
} from "../../../../lib/categories";

async function handler(req, res, user) {
  if (req.method === "GET") {
    const categories = await listCategories();

    // The admin screen also shows how many articles use each category.
    if (req.query.counts === "1" && user.role === "admin") {
      await Promise.all(
        categories.map(async (c) => {
          const agg = await adminDb.collection(ARTICLES_COLLECTION).where("category", "==", c.name).count().get();
          c.articleCount = agg.data().count;
        })
      );
    }
    return res.status(200).json({ categories });
  }

  if (req.method === "POST") {
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Akses admin sahaja." });
    }
    const name = cleanCategoryName(req.body?.name);
    if (!name) {
      return res.status(400).json({ error: "Nama kategori diperlukan." });
    }
    if (await findCategoryByName(name)) {
      return res.status(400).json({ error: "Kategori ini sudah wujud." });
    }
    const ref = await adminDb.collection(CATEGORIES_COLLECTION).add({ name, order: Date.now() });
    return res.status(201).json({ category: { id: ref.id, name } });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler);
