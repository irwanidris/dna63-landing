import DOMPurify from "isomorphic-dompurify";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin";
import { getCoverImageInfo, checkCoverImage } from "./storageUpload";
import { cleanCategoryName } from "./categories";

export const ARTICLES_COLLECTION = "articles";
export const EXCERPT_MAX = 300;

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

const ENTITIES = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

/** Plain-text summary (no HTML), capped at maxLen characters including the ellipsis. */
export function toExcerpt(html, maxLen = EXCERPT_MAX) {
  const text = (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m])
    .replace(/\s+/g, " ")
    .trim();
  const chars = Array.from(text);
  return chars.length > maxLen ? chars.slice(0, maxLen - 1).join("").trim() + "…" : text;
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

/** True once a scheduled article's publish time has arrived. */
function isDue(data) {
  return data.status === "scheduled" && !!data.publishedAt && data.publishedAt.toMillis() <= Date.now();
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
    coverImageBytes: data.coverImageBytes || null,
    coverImageType: data.coverImageType || null,
    category: data.category || "Umum",
    status: isDue(data) ? "published" : data.status || "draft",
    authorId: data.authorId || null,
    authorName: data.authorName || "DNA63",
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
    publishedAt: data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
  };
}

/**
 * Best-effort: stores "published" on scheduled articles whose time has come,
 * so the status in Firestore catches up with what readers already see.
 */
async function promoteDue(docs) {
  const due = docs.filter((d) => isDue(d.data()));
  if (due.length === 0) return;
  try {
    const batch = adminDb.batch();
    due.forEach((d) => batch.update(d.ref, { status: "published" }));
    await batch.commit();
  } catch (err) {
    console.warn("Failed to promote scheduled articles", err.message);
  }
}

// Scheduled articles go live by themselves: public reads include them as
// soon as their publishedAt has passed, with no background job involved.
export async function listPublishedArticles({ limit = 50 } = {}) {
  const snap = await adminDb
    .collection(ARTICLES_COLLECTION)
    .where("status", "in", ["published", "scheduled"])
    .where("publishedAt", "<=", Timestamp.now())
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();
  await promoteDue(snap.docs);
  return snap.docs.map(serializeArticle);
}

/**
 * Up to `count` other published articles for the end of an article page:
 * newest in the same category first, topped up with the newest overall.
 * Reuses the listing query, so it needs no extra Firestore index.
 */
export async function listRelatedArticles(article, { count = 3 } = {}) {
  const others = (await listPublishedArticles({ limit: 30 })).filter((a) => a.id !== article.id);
  const sameCategory = others.filter((a) => a.category === article.category);
  const rest = others.filter((a) => a.category !== article.category);
  return [...sameCategory, ...rest].slice(0, count).map(({ contentHtml, ...card }) => card);
}

export async function getPublishedArticleBySlug(slug) {
  const snap = await adminDb
    .collection(ARTICLES_COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data();
  if (data.status !== "published" && !isDue(data)) return null;
  await promoteDue([doc]);
  return serializeArticle(doc);
}

/**
 * Validates an article create/update request body and returns the Firestore
 * fields shared by both. `existing` is the current document data on update.
 * Returns { error } (a message for the author) or { fields }.
 */
export async function buildArticleFields(body, user, existing = null) {
  const { title, contentHtml, category, status, coverImageUrl, excerpt, authorName, publishedAt } = body || {};
  if (!title || !title.trim()) {
    return { error: "Tajuk diperlukan." };
  }

  const publishing = status === "published";
  const cleanHtml = sanitizeHtml(contentHtml);
  const fields = {
    title: title.trim(),
    contentHtml: cleanHtml,
    excerpt: toExcerpt(excerpt) || toExcerpt(cleanHtml),
    coverImageUrl: coverImageUrl || null,
    coverImageBytes: null,
    coverImageType: null,
    category: cleanCategoryName(category) || "Umum",
    status: publishing ? "published" : "draft",
    authorName: (authorName && authorName.trim().slice(0, 80)) || existing?.authorName || user.name,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // The cover image is mandatory once an article is public: the RSS feed's
  // <enclosure> and the page's og:image both depend on it.
  if (publishing && !coverImageUrl) {
    return { error: "Gambar utama diperlukan sebelum artikel boleh diterbitkan." };
  }
  if (coverImageUrl) {
    let info = null;
    try {
      info = await getCoverImageInfo(coverImageUrl);
    } catch (err) {
      if (publishing) return { error: err.message };
    }
    if (info) {
      const problem = publishing ? checkCoverImage(info) : null;
      if (problem) return { error: problem };
      fields.coverImageBytes = info.bytes;
      fields.coverImageType = info.type;
    }
  }

  if (publishing) {
    let goLive = existing?.publishedAt ? existing.publishedAt.toDate() : null;
    if (publishedAt) {
      const date = new Date(publishedAt);
      if (Number.isNaN(date.getTime())) {
        return { error: "Tarikh terbit tidak sah." };
      }
      fields.publishedAt = Timestamp.fromDate(date);
      goLive = date;
    } else if (!existing?.publishedAt) {
      fields.publishedAt = FieldValue.serverTimestamp();
    }
    // A publish date in the future schedules the article instead.
    if (goLive && goLive.getTime() > Date.now()) {
      fields.status = "scheduled";
    }
  }

  return { fields };
}

/**
 * Best-effort refresh of the public pages after a newsroom write, so a
 * publish/unpublish shows up at once instead of after the ISR window.
 */
export async function revalidateArticlePages(res, slug) {
  for (const path of ["/berita", slug && `/berita/${slug}`]) {
    if (!path) continue;
    try {
      await res.revalidate(path);
    } catch (err) {
      console.warn("Revalidate failed for", path, err.message);
    }
  }
}

export { serializeArticle };
