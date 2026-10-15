import Link from "next/link";
import Image from "next/image";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
}

/** "Bacaan berkaitan" cards at the end of an article, styled like /berita. */
export default function RelatedArticles({ articles }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Bacaan berkaitan</p>
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/berita/${article.slug}`}
            className="group block bg-white dark:bg-gray-900 rounded-xl sm:rounded-[1.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-shadow"
          >
            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
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
            <div className="p-2 sm:p-4">
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-sabah-blue">
                {article.category}
              </span>
              <h3 className="text-xs sm:text-base font-bold leading-snug sm:mt-1 sm:mb-2 group-hover:text-sabah-blue transition-colors line-clamp-3">
                {article.title}
              </h3>
              <p className="hidden sm:block text-xs text-gray-400">{formatDate(article.publishedAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
