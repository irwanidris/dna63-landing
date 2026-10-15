import Head from "next/head";
import Image from "next/image";
import NewsLayout from "../../components/NewsLayout";
import dynamic from "next/dynamic";
import ShareButtons from "../../components/ShareButtons";
import { getPublishedArticleBySlug } from "../../lib/articles";

const ArticleEditLink = dynamic(() => import("../../components/ArticleEditLink"), { ssr: false });

// Rendered per request (CDN-cached for a minute) rather than with ISR: on
// Firebase Hosting the regenerated ISR page is never persisted, so edits and
// unpublishes would not reach readers.
export async function getServerSideProps({ params, res }) {
  try {
    const article = await getPublishedArticleBySlug(params.slug);
    // Uncached 404: the slug may belong to a draft that is about to be published.
    if (!article) {
      res.setHeader("Cache-Control", "no-store");
      return { notFound: true };
    }
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    return { props: { article } };
  } catch (err) {
    console.error("Failed to load article", params.slug, err);
    res.setHeader("Cache-Control", "no-store");
    return { notFound: true };
  }
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ArticlePage({ article }) {
  return (
    <NewsLayout>
      <Head>
        <title>{article.title} | DNA63 Berita</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        {article.coverImageUrl && <meta property="og:image" content={article.coverImageUrl} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://dna63.com/berita/${article.slug}`} />
        <link rel="canonical" href={`https://dna63.com/berita/${article.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <article className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <span className="text-xs font-black uppercase tracking-widest text-sabah-blue">{article.category}</span>
        <h1 className="text-3xl md:text-5xl font-bold mt-3 mb-4">{article.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <p className="text-sm text-gray-400">
            {article.authorName} &middot; {formatDate(article.publishedAt)}
          </p>
          <ArticleEditLink articleId={article.id} authorId={article.authorId} />
        </div>

        {article.coverImageUrl && (
          <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-10 bg-gray-100 dark:bg-gray-800">
            <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" unoptimized priority />
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        <ShareButtons url={`https://dna63.com/berita/${article.slug}`} title={article.title} />
      </article>
    </NewsLayout>
  );
}
