import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NewsroomLayout from "../../components/NewsroomLayout";
import { useNewsroomUser, authedFetch } from "../../lib/useNewsroomUser";

const STATUS_LABELS = {
  pending: { label: "Belum Log Masuk", className: "bg-sabah-yellow/20 text-sabah-yellow" },
  active: { label: "Aktif", className: "bg-sabah-green/10 text-sabah-green" },
  disabled: { label: "Dinyahaktifkan", className: "bg-sabah-red/10 text-sabah-red" },
};

export default function NewsroomAdmin() {
  const router = useRouter();
  const { user, loading: authLoading } = useNewsroomUser();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("author");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/api/newsroom/invites");
      const data = await res.json();
      setPeople(data.people || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") router.replace("/newsroom");
    if (user?.role === "admin") load();
  }, [authLoading, user, router, load]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError("");
    setInviting(true);
    try {
      const res = await authedFetch("/api/newsroom/invites", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menjemput.");
        return;
      }
      setEmail("");
      setRole("author");
      load();
    } finally {
      setInviting(false);
    }
  };

  const toggleDisabled = async (person) => {
    await authedFetch(`/api/newsroom/invites/${encodeURIComponent(person.email)}`, {
      method: "PATCH",
      body: JSON.stringify({ disabled: person.status !== "disabled" }),
    });
    load();
  };

  const removePerson = async (person) => {
    if (!window.confirm(`Buang akses ${person.email}? Tindakan ini tidak boleh diundur.`)) return;
    await authedFetch(`/api/newsroom/invites/${encodeURIComponent(person.email)}`, { method: "DELETE" });
    load();
  };

  if (authLoading || (user && user.role !== "admin")) return null;

  return (
    <NewsroomLayout title="Urus Penulis">
      <Head>
        <title>Urus Penulis | Newsroom DNA63</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 mb-10">
        <h2 className="text-xl font-bold mb-2">Jemput Penulis Baru</h2>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan emel akaun Google mereka. Mereka boleh log masuk terus dengan Google di{" "}
          <span className="font-mono">/newsroom/login</span> — tiada kata laluan diperlukan.
        </p>
        <form onSubmit={handleInvite} className="grid md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Emel Google</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Peranan</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue">
              <option value="author">Penulis</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button disabled={inviting} className="px-6 py-3 bg-sabah-blue text-white rounded-xl font-bold hover:bg-sabah-red transition-colors disabled:opacity-60">
            {inviting ? "Menjemput..." : "Jemput"}
          </button>
        </form>
        {error && <p className="text-sm text-sabah-red font-medium mt-4">{error}</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">Semua Penulis & Jemputan ({people.length})</h2>
      {loading ? (
        <p className="text-gray-400">Memuatkan...</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Emel</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Nama</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Peranan</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {people.map((p) => {
                  const isSelf = p.uid === user.uid;
                  const status = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
                  return (
                    <tr key={p.email} className="hover:bg-sabah-blue/[0.02] dark:hover:bg-sabah-blue/[0.05] transition-colors">
                      <td className="px-6 py-4 text-sm">{p.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.name || "—"}</td>
                      <td className="px-6 py-4 text-xs font-bold uppercase">{p.role === "admin" ? "Admin" : "Penulis"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                        {p.status !== "pending" && (
                          <button disabled={isSelf} onClick={() => toggleDisabled(p)} className="text-sm font-bold text-sabah-blue hover:underline disabled:opacity-40">
                            {p.status === "disabled" ? "Aktifkan" : "Nyahaktifkan"}
                          </button>
                        )}
                        <button disabled={isSelf} onClick={() => removePerson(p)} className="text-sm font-bold text-sabah-red hover:underline disabled:opacity-40">
                          Buang
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {people.length === 0 && (
            <div className="p-24 text-center">
              <p className="text-gray-400 italic">Belum ada penulis dijemput.</p>
            </div>
          )}
        </div>
      )}
    </NewsroomLayout>
  );
}
