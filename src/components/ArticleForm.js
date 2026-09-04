import { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { authedFetch } from "../lib/useNewsroomUser";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

const CATEGORIES = ["Umum", "Komuniti", "Sejarah MA63", "Aduan Rakyat", "Acara", "Runner & Vendor"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ArticleForm({ initialArticle, articleId }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [category, setCategory] = useState(initialArticle?.category || CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [contentHtml, setContentHtml] = useState(initialArticle?.contentHtml || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialArticle?.coverImageUrl || "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async (file) => {
    const dataUrl = await fileToDataUrl(file);
    const res = await authedFetch("/api/newsroom/upload", {
      method: "POST",
      body: JSON.stringify({ dataUrl }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Gagal memuat naik imej.");
      return null;
    }
    return data.url;
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) setCoverImageUrl(url);
    } finally {
      setCoverUploading(false);
    }
  };

  const save = async (status) => {
    setError("");
    if (!title.trim()) {
      setError("Sila masukkan tajuk artikel.");
      return;
    }
    setSaving(true);
    try {
      const payload = { title, category, excerpt, contentHtml, coverImageUrl, status };
      const res = await authedFetch(
        articleId ? `/api/newsroom/articles/${articleId}` : "/api/newsroom/articles",
        { method: articleId ? "PUT" : "POST", body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan artikel.");
        return;
      }
      router.push("/newsroom");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Tajuk Artikel</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tajuk berita..."
          className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-sabah-blue text-xl font-bold"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-sabah-blue"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Gambar Muka Depan</label>
          <label className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer text-sm text-gray-500 hover:border-sabah-blue transition-colors">
            {coverUploading ? "Memuat naik..." : coverImageUrl ? "Tukar gambar" : "Muat naik gambar"}
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </label>
        </div>
      </div>

      {coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImageUrl} alt="Gambar muka depan" className="w-full max-h-72 object-cover rounded-2xl" />
      )}

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Ringkasan (opsyenal)</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Ringkasan pendek untuk senarai berita & RSS. Jika kosong, dijana automatik."
          className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-sabah-blue resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Kandungan</label>
        <RichTextEditor value={contentHtml} onChange={setContentHtml} onImageUpload={uploadImage} />
      </div>

      {error && <p className="text-sm text-sabah-red font-medium">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          disabled={saving}
          onClick={() => save("draft")}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
        >
          Simpan sebagai Draf
        </button>
        <button
          disabled={saving}
          onClick={() => save("published")}
          className="px-6 py-3 bg-sabah-blue text-white rounded-2xl font-bold shadow-lg shadow-sabah-blue/20 hover:bg-sabah-red transition-colors disabled:opacity-60"
        >
          {initialArticle?.status === "published" ? "Kemaskini Artikel" : "Terbitkan"}
        </button>
      </div>
    </div>
  );
}
