import { listPublishedArticles } from "../lib/articles";

const SITE_URL = "https://dna63.com";

function escapeXml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildRss(articles) {
  const items = articles
    .map((a) => {
      const link = `${SITE_URL}/news/${a.slug}`;
      const pubDate = a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString();
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(a.authorName)}</author>
      <category>${escapeXml(a.category)}</category>
      <description>${escapeXml(a.excerpt)}</description>
      ${a.coverImageUrl ? `<enclosure url="${escapeXml(a.coverImageUrl)}" type="image/jpeg" />` : ""}
      <content:encoded><![CDATA[${a.coverImageUrl ? `<img src="${a.coverImageUrl}" alt="${escapeXml(a.title)}" />` : ""}${a.contentHtml}]]></content:encoded>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DNA63 Berita</title>
    <link>${SITE_URL}/news</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Berita &amp; kandungan terkini komuniti DNA63 Sabah</description>
    <language>ms-MY</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;
}

export async function getServerSideProps({ res }) {
  let articles = [];
  try {
    articles = await listPublishedArticles({ limit: 50 });
  } catch (err) {
    console.error("Failed to build RSS feed", err);
  }
  const xml = buildRss(articles);

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Feed() {
  return null;
}
