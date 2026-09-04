import DOMPurify from "isomorphic-dompurify";
import { adminDb } from "./firebaseAdmin";

export const ARTICLES_COLLECTION = "articles";

export function slugify(title) {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || "", {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "img", "figure", "figcaption",
      "code", "pre", "hr",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
  });
}

export function toExcerpt(html, maxLen = 200) {
  const text = (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text;
}

/** Ensures a slug is unique among articles, appending -2, -3, ... if needed. */
export async function uniqueSlug(baseSlug, excludeId = null) {
  let candidate = baseSlug || "artikel";
  let n = 1;
  // Bounded loop: at most 50 attempts, then fall back to a timestamp suffix.
  for (let i = 0; i < 50; i++) {
    const snap = await adminDb
      .collection(ARTICLES_COLLECTION)
      .where("slug", "==", candidate)
      .limit(1)
      .get();
    const clash = snap.docs.find((d) => d.id !== excludeId);
    if (!clash) return candidate;
    n += 1;
    candidate = `${baseSlug}-${n}`;
  }
  return `${baseSlug}-${Date.now()}`;
}

function serializeArticle(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || "",
    slug: data.slug || "",
    excerpt: data.excerpt || "",
    contentHtml: data.contentHtml || "",
    coverImageUrl: data.coverImageUrl || null,
    category: data.category || "Umum",
    status: data.status || "draft",
    authorId: data.authorId || null,
    authorName: data.authorName || "DNA63",
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
    publishedAt: data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
  };
}

export async function listPublishedArticles({ limit = 50 } = {}) {
  const snap = await adminDb
    .collection(ARTICLES_COLLECTION)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map(serializeArticle);
}

export async function getPublishedArticleBySlug(slug) {
  const snap = await adminDb
    .collection(ARTICLES_COLLECTION)
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();
  if (snap.empty) return null;
  return serializeArticle(snap.docs[0]);
}

export { serializeArticle };
