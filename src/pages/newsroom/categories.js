import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NewsroomLayout from "../../components/NewsroomLayout";
import { useNewsroomUser, authedFetch } from "../../lib/useNewsroomUser";

const NAME_MAX = 40;

export default function NewsroomCategories() {
  const router = useRouter();
  const { user, loading: authLoading } = useNewsroomUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/api/newsroom/categories?counts=1");
      const data = await res.json();
      setCategories(data.categories || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") router.replace("/newsroom");
    if (user?.role === "admin") load();
  }, [authLoading, user, router, load]);

  const request = async (path, options) => {
    setError("");
    const res = await authedFetch(path, options);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Gagal menyimpan kategori.");
      return false;
    }
    return true;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      if (await request("/api/newsroom/categories", { method: "POST", body: JSON.stringify({ name }) })) {
        setName("");
        load();
      }
    } finally {
      setAdding(false);
    }
  };

  const saveRename = async (category) => {
    if (await request(`/api/newsroom/categories/${category.id}`, { method: "PATCH", body: JSON.stringify({ name: editName }) })) {
      setEditingId(null);
      load();
    }
  };

  const removeCategory = async (category) => {
    const note = category.articleCount
      ? ` ${category.articleCount} artikel sedia ada akan kekal dengan label ini.`
      : "";
    if (!window.confirm(`Padam kategori "${category.name}"?${note}`)) return;
    if (await request(`/api/newsroom/categories/${category.id}`, { method: "DELETE" })) load();
  };

  if (authLoading || (user && user.role !== "admin")) return null;

  return (
    <NewsroomLayout title="Urus Kategori">
      <Head>
        <title>Urus Kategori | Newsroom DNA63</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 mb-10">
        <h2 className="text-xl font-bold mb-2">Tambah Kategori</h2>
        <p className="text-sm text-gray-500 mb-6">
          Kategori di sini menjadi pilihan dalam borang artikel untuk semua penulis.
        </p>
        <form onSubmit={handleAdd} className="grid md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nama Kategori</label>
            <input
              required
              maxLength={NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dari Meja Founder"
              className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue"
            />
          </div>
          <button disabled={adding} className="px-6 py-3 bg-sabah-blue text-white rounded-xl font-bold hover:bg-sabah-red transition-colors disabled:opacity-60">
            {adding ? "Menambah..." : "Tambah"}
          </button>
        </form>
        {error && <p className="text-sm text-sabah-red font-medium mt-4">{error}</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">Semua Kategori ({categories.length})</h2>
      {loading ? (
        <p className="text-gray-400">Memuatkan...</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Kategori</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Artikel</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-sabah-blue/[0.02] dark:hover:bg-sabah-blue/[0.05] transition-colors">
                    <td className="px-6 py-4 text-sm">
                      {editingId === c.id ? (
                        <input
                          autoFocus
                          maxLength={NAME_MAX}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename(c);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue"
                        />
                      ) : (
                        <span className="font-bold">{c.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.articleCount ?? "—"}</td>
                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                      {editingId === c.id ? (
                        <>
                          <button onClick={() => saveRename(c)} className="text-sm font-bold text-sabah-blue hover:underline">Simpan</button>
                          <button onClick={() => setEditingId(null)} className="text-sm font-bold text-gray-400 hover:underline">Batal</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setError("");
                              setEditingId(c.id);
                              setEditName(c.name);
                            }}
                            className="text-sm font-bold text-sabah-blue hover:underline"
                          >
                            Tukar Nama
                          </button>
                          <button onClick={() => removeCategory(c)} className="text-sm font-bold text-sabah-red hover:underline">
                            Padam
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </NewsroomLayout>
  );
}
