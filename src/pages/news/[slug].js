import Head from "next/head";
import Image from "next/image";
import NewsLayout from "../../components/NewsLayout";
import { getPublishedArticleBySlug } from "../../lib/articles";

export async function getStaticPaths() {
  // No paths are pre-rendered at build time (Firebase App Hosting's build
  // step may not share the runtime service account's Firestore access).
  // Every article is instead rendered on first request and cached by ISR.
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  try {
    const article = await getPublishedArticleBySlug(params.slug);
    if (!article) return { notFound: true };
    return { props: { article }, revalidate: 60 };
  } catch (err) {
    console.error("Failed to load article", params.slug, err);
    return { notFound: true, revalidate: 10 };
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
      </Head>

      <article className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <span className="text-xs font-black uppercase tracking-widest text-sabah-blue">{article.category}</span>
        <h1 className="text-3xl md:text-5xl font-bold mt-3 mb-4">{article.title}</h1>
        <p className="text-sm text-gray-400 mb-8">
          {article.authorName} &middot; {formatDate(article.publishedAt)}
        </p>

        {article.coverImageUrl && (
          <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-10 bg-gray-100 dark:bg-gray-800">
            <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" unoptimized priority />
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </article>
    </NewsLayout>
  );
}
