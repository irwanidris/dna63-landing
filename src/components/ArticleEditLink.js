import Link from "next/link";
import { useNewsroomUser } from "../lib/useNewsroomUser";

/**
 * Shortcut to the newsroom editor, shown on a public article only to the
 * signed-in author of that article (or a newsroom admin). Loaded client-side
 * only: the article page itself is CDN-cached and identical for every reader.
 */
export default function ArticleEditLink({ articleId, authorId }) {
  const { user } = useNewsroomUser();
  if (!user || (user.uid !== authorId && user.role !== "admin")) return null;

  return (
    <Link
      href={`/newsroom/edit/${articleId}`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sabah-blue/10 text-sabah-blue text-sm font-bold hover:bg-sabah-blue hover:text-white transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      Edit Artikel
    </Link>
  );
}
