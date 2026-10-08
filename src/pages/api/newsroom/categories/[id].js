import { adminDb } from "../../../../lib/firebaseAdmin";
import { withNewsroomAuth } from "../../../../lib/newsroomAuth";
import { ARTICLES_COLLECTION, revalidateArticlePages } from "../../../../lib/articles";
import { CATEGORIES_COLLECTION, cleanCategoryName, findCategoryByName } from "../../../../lib/categories";

async function handler(req, res) {
  const { id } = req.query;
  const ref = adminDb.collection(CATEGORIES_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return res.status(404).json({ error: "Kategori tidak dijumpai." });
  }
  const oldName = snap.data().name;

  if (req.method === "PATCH") {
    const name = cleanCategoryName(req.body?.name);
    if (!name) {
      return res.status(400).json({ error: "Nama kategori diperlukan." });
    }
    if (await findCategoryByName(name, id)) {
      return res.status(400).json({ error: "Kategori ini sudah wujud." });
    }
    await ref.update({ name });

    // Carry the new name over to every article filed under the old one.
    let updated = 0;
    if (name !== oldName) {
      const articles = await adminDb.collection(ARTICLES_COLLECTION).where("category", "==", oldName).get();
      for (let i = 0; i < articles.docs.length; i += 400) {
        const batch = adminDb.batch();
        articles.docs.slice(i, i + 400).forEach((d) => batch.update(d.ref, { category: name }));
        await batch.commit();
      }
      updated = articles.size;
      if (updated) await revalidateArticlePages(res);
    }
    return res.status(200).json({ category: { id, name }, articlesUpdated: updated });
  }

  if (req.method === "DELETE") {
    // Only removes the choice from the article form: articles already filed
    // under this category keep its name.
    await ref.delete();
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withNewsroomAuth(handler, { requireAdmin: true });
