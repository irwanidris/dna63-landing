import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import NewsroomLayout from "../../components/NewsroomLayout";
import { useNewsroomUser, authedFetch } from "../../lib/useNewsroomUser";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }) {
  const isPublished = status === "published";
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
        isPublished ? "bg-sabah-green/10 text-sabah-green" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
      }`}
    >
      {isPublished ? "Diterbitkan" : "Draf"}
    </span>
  );
}

export default function NewsroomDashboard() {
  const { user, loading: authLoading } = useNewsroomUser();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/api/newsroom/articles");
      const data = await res.json();
      setArticles(data.articles || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Padam artikel ini? Tindakan ini tidak boleh diundur.")) return;
    const res = await authedFetch(`/api/newsroom/articles/${id}`, { method: "DELETE" });
    if (res.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered = articles.filter((a) => filter === "all" || a.status === filter);

  return (
    <NewsroomLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <p className="text-sabah-blue font-bold text-xs tracking-widest uppercase mb-2">Newsroom</p>
          <h1 className="text-3xl md:text-4xl font-bold">
            {user?.role === "admin" ? "Semua Artikel" : "Artikel Saya"} <span className="text-sabah-blue/50">({articles.length})</span>
          </h1>
        </div>
        <Link
          href="/newsroom/new"
          className="px-6 py-3 bg-sabah-blue text-white rounded-2xl font-bold shadow-lg shadow-sabah-blue/20 hover:scale-105 transition-all"
        >
          + Artikel Baru
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          ["all", "Semua"],
          ["draft", "Draf"],
          ["published", "Diterbitkan"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === key ? "bg-sabah-blue text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {authLoading || loading ? (
        <div className="flex flex-col items-center py-32 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-sabah-blue border-t-transparent mb-6"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Tajuk</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Status</th>
                  {user?.role === "admin" && (
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Penulis</th>
                  )}
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Kemaskini</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-sabah-blue/[0.02] dark:hover:bg-sabah-blue/[0.05] transition-colors">
                    <td className="px-6 py-4 font-bold max-w-xs truncate">{a.title}</td>
                    <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                    {user?.role === "admin" && <td className="px-6 py-4 text-sm text-gray-500">{a.authorName}</td>}
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(a.updatedAt)}</td>
                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                      {a.status === "published" && (
                        <Link href={`/news/${a.slug}`} target="_blank" className="text-sm text-gray-400 hover:text-sabah-blue font-medium">Lihat</Link>
                      )}
                      <Link href={`/newsroom/edit/${a.id}`} className="text-sm text-sabah-blue font-bold hover:underline">Sunting</Link>
                      <button onClick={() => handleDelete(a.id)} className="text-sm text-sabah-red font-bold hover:underline">Padam</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-24 text-center">
              <p className="text-gray-400 italic">Tiada artikel dalam kategori ini.</p>
            </div>
          )}
        </div>
      )}
    </NewsroomLayout>
  );
}
