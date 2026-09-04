import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import NewsLayout from "../../components/NewsLayout";
import { listPublishedArticles } from "../../lib/articles";

export async function getStaticProps() {
  try {
    const articles = await listPublishedArticles({ limit: 60 });
    return { props: { articles }, revalidate: 60 };
  } catch (err) {
    console.error("Failed to load published articles", err);
    return { props: { articles: [] }, revalidate: 10 };
  }
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" });
}

export default function NewsIndex({ articles }) {
  const [featured, ...rest] = articles;

  return (
    <NewsLayout>
      <Head>
        <title>Berita | DNA63</title>
        <meta name="description" content="Berita &amp; kandungan terkini komuniti DNA63 Sabah." />
        <link rel="alternate" type="application/rss+xml" title="DNA63 Berita RSS" href="/feed.xml" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="mb-12">
          <p className="text-sabah-blue font-bold text-xs tracking-widest uppercase mb-2">DNA63</p>
          <h1 className="text-4xl md:text-5xl font-bold">Berita</h1>
        </div>

        {articles.length === 0 && (
          <div className="p-24 text-center bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 italic">Belum ada artikel diterbitkan.</p>
          </div>
        )}

        {featured && (
          <Link href={`/news/${featured.slug}`} className="group block mb-12">
            <div className="rounded-[2rem] overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl grid md:grid-cols-2">
              <div className="relative aspect-video md:aspect-auto bg-gray-100 dark:bg-gray-800">
                {featured.coverImageUrl && (
                  <Image
                    src={featured.coverImageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                )}
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-xs font-black uppercase tracking-widest text-sabah-blue mb-3">
                  {featured.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-sabah-blue transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">{featured.excerpt}</p>
                <p className="text-xs text-gray-400">
                  {featured.authorName} &middot; {formatDate(featured.publishedAt)}
                </p>
              </div>
            </div>
          </Link>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group block bg-white dark:bg-gray-900 rounded-[1.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                {article.coverImageUrl && (
                  <Image
                    src={article.coverImageUrl}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                )}
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-sabah-blue">
                  {article.category}
                </span>
                <h3 className="text-lg font-bold mt-2 mb-2 group-hover:text-sabah-blue transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{article.excerpt}</p>
                <p className="text-xs text-gray-400">
                  {article.authorName} &middot; {formatDate(article.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </NewsLayout>
  );
}
