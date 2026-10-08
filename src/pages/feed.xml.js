import { listPublishedArticles, toExcerpt } from "../lib/articles";

const SITE_URL = "https://dna63.com";
const FEED_LIMIT = 20;

function escapeXml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date with a numeric zone, e.g. "Thu, 08 Oct 2026 06:22:56 +0000". */
function rfc822(date) {
  return date.toUTCString().replace(/GMT$/, "+0000");
}

function buildRss(articles) {
  const items = articles
    .map((a) => {
      const link = `${SITE_URL}/berita/${encodeURIComponent(a.slug)}`;
      const pubDate = rfc822(a.publishedAt ? new Date(a.publishedAt) : new Date());
      const enclosure = a.coverImageUrl
        ? `<enclosure url="${escapeXml(a.coverImageUrl)}" type="${escapeXml(a.coverImageType || "image/jpeg")}" length="${a.coverImageBytes || 0}" />`
        : "";
      const cover = a.coverImageUrl ? `<img src="${escapeXml(a.coverImageUrl)}" alt="${escapeXml(a.title)}" />` : "";
      const content = `${cover}${a.contentHtml}`.replace(/]]>/g, "]]]]><![CDATA[>");
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(a.authorName)}</dc:creator>
      <category>${escapeXml(a.category)}</category>
      <description>${escapeXml(toExcerpt(a.excerpt))}</description>
      ${enclosure}
      <content:encoded><![CDATA[${content}]]></content:encoded>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DNA63 Berita</title>
    <link>${SITE_URL}/berita</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Berita &amp; kandungan terkini komuniti DNA63 Sabah</description>
    <language>ms-MY</language>
    <lastBuildDate>${rfc822(new Date())}</lastBuildDate>${items}
  </channel>
</rss>`;
}

export async function getServerSideProps({ res }) {
  let articles;
  try {
    articles = await listPublishedArticles({ limit: FEED_LIMIT });
  } catch (err) {
    // Fail loudly and uncached rather than serve readers an empty feed.
    console.error("Failed to build RSS feed", err);
    res.statusCode = 503;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "60");
    res.end();
    return { props: {} };
  }

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  res.write(buildRss(articles));
  res.end();

  return { props: {} };
}

export default function Feed() {
  return null;
}
