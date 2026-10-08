import { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { authedFetch } from "../lib/useNewsroomUser";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

const CATEGORIES = ["Umum", "Komuniti", "Sejarah MA63", "Aduan Rakyat", "Acara", "Runner & Vendor"];

const EXCERPT_MAX = 300;
const COVER_MIN_WIDTH = 800;
const COVER_TARGET_BYTES = 480 * 1024; // server rejects 500 KB and above

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Fail gambar tidak dapat dibaca."));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Re-encodes the chosen cover as a JPEG that is at least 800px wide and
 * under 500 KB, stepping down quality then width until it fits.
 */
async function coverToJpegDataUrl(file) {
  const img = await loadImage(file);
  try {
    if (img.naturalWidth < COVER_MIN_WIDTH) {
      throw new Error(`Gambar utama mesti sekurang-kurangnya ${COVER_MIN_WIDTH} piksel lebar.`);
    }
    for (const maxWidth of [1600, 1200, COVER_MIN_WIDTH]) {
      const width = Math.min(img.naturalWidth, maxWidth);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round((img.naturalHeight * width) / img.naturalWidth);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.85, 0.75, 0.65, 0.5]) {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const bytes = ((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4;
        if (bytes < COVER_TARGET_BYTES) return dataUrl;
      }
    }
    throw new Error("Gambar utama terlalu besar untuk dimampatkan bawah 500 KB.");
  } finally {
    URL.revokeObjectURL(img.src);
  }
}

/** ISO timestamp -> value for <input type="datetime-local"> in the author's local time. */
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ArticleForm({ initialArticle, articleId }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [category, setCategory] = useState(initialArticle?.category || CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [contentHtml, setContentHtml] = useState(initialArticle?.contentHtml || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialArticle?.coverImageUrl || "");
  const [authorName, setAuthorName] = useState(initialArticle?.authorName || "");
  const initialPublishedAt = toLocalInputValue(initialArticle?.publishedAt);
  const [publishedAt, setPublishedAt] = useState(initialPublishedAt);
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uploadDataUrl = async (dataUrl, kind) => {
    const res = await authedFetch("/api/newsroom/upload", {
      method: "POST",
      body: JSON.stringify({ dataUrl, kind }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Gagal memuat naik imej.");
      return null;
    }
    return data.url;
  };

  const uploadImage = async (file) => uploadDataUrl(await fileToDataUrl(file));

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setCoverUploading(true);
    try {
      const url = await uploadDataUrl(await coverToJpegDataUrl(file), "cover");
      if (url) setCoverImageUrl(url);
    } catch (err) {
      setError(err.message || "Gagal memuat naik imej.");
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
    if (status === "published" && !coverImageUrl) {
      setError("Sila muat naik gambar utama sebelum menerbitkan artikel.");
      return;
    }
    setSaving(true);
    try {
      const payload = { title, category, excerpt, contentHtml, coverImageUrl, authorName, status };
      // Only send the publish date when the author changed it, so an
      // untouched field keeps the stored timestamp to the second.
      if (publishedAt && publishedAt !== initialPublishedAt) {
        payload.publishedAt = new Date(publishedAt).toISOString();
      }
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
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Gambar Utama (wajib, min. 800px lebar)</label>
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
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nama Penulis</label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={80}
              placeholder="Kosongkan untuk guna nama akaun anda"
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-sabah-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Tarikh Terbit</label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-sabah-blue"
            />
            <p className="text-xs text-gray-400 mt-2">Kosongkan untuk guna masa artikel diterbitkan.</p>
          </div>
        </div>

        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
          Ringkasan ({excerpt.length}/{EXCERPT_MAX})
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          maxLength={EXCERPT_MAX}
          placeholder="Ringkasan pendek teks biasa untuk senarai berita & RSS. Jika kosong, dijana automatik."
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
