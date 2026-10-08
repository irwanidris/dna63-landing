import { adminDb } from "./firebaseAdmin";

export const CATEGORIES_COLLECTION = "newsroomCategories";
export const CATEGORY_NAME_MAX = 40;

// Seeded the first time the list is read (and again if an admin deletes
// every category, since the article form needs at least one choice).
const DEFAULT_CATEGORIES = ["Umum", "Komuniti", "Sejarah MA63", "Aduan Rakyat", "Acara", "Runner & Vendor"];

export function cleanCategoryName(name) {
  return (name || "").toString().replace(/\s+/g, " ").trim().slice(0, CATEGORY_NAME_MAX);
}

/** All categories as [{ id, name }], in the order they were created. */
export async function listCategories() {
  const col = adminDb.collection(CATEGORIES_COLLECTION);
  let snap = await col.get();
  if (snap.empty) {
    const batch = adminDb.batch();
    // Fixed ids keep two simultaneous first reads from seeding twice.
    DEFAULT_CATEGORIES.forEach((name, i) => batch.set(col.doc(`default-${i}`), { name, order: i }));
    await batch.commit();
    snap = await col.get();
  }
  return snap.docs
    .map((d) => ({ id: d.id, name: d.data().name, order: d.data().order || 0 }))
    .sort((a, b) => a.order - b.order)
    .map(({ id, name }) => ({ id, name }));
}

/** Case-insensitive lookup, so "Blog" and "blog" can't both exist. */
export async function findCategoryByName(name, excludeId = null) {
  const wanted = name.toLowerCase();
  const all = await listCategories();
  return all.find((c) => c.id !== excludeId && c.name.toLowerCase() === wanted) || null;
}
