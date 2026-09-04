import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NewsroomLayout from "../../components/NewsroomLayout";
import { useNewsroomUser, authedFetch } from "../../lib/useNewsroomUser";

export default function NewsroomAdmin() {
  const router = useRouter();
  const { user, loading: authLoading } = useNewsroomUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("author");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createdCreds, setCreatedCreds] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/api/newsroom/users");
      const data = await res.json();
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") router.replace("/newsroom");
    if (user?.role === "admin") load();
  }, [authLoading, user, router, load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await authedFetch("/api/newsroom/users", {
        method: "POST",
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal cipta akaun.");
        return;
      }
      setCreatedCreds(data);
      setName("");
      setEmail("");
      setRole("author");
      load();
    } finally {
      setCreating(false);
    }
  };

  const toggleDisabled = async (u) => {
    await authedFetch(`/api/newsroom/users/${u.uid}`, {
      method: "PATCH",
      body: JSON.stringify({ disabled: !u.disabled }),
    });
    load();
  };

  const changeRole = async (u, newRole) => {
    await authedFetch(`/api/newsroom/users/${u.uid}`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
    load();
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Padam akaun ${u.email}? Tindakan ini tidak boleh diundur.`)) return;
    await authedFetch(`/api/newsroom/users/${u.uid}`, { method: "DELETE" });
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
        <h2 className="text-xl font-bold mb-6">Tambah Akaun Penulis Baru</h2>
        <form onSubmit={handleCreate} className="grid md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nama</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Emel</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Peranan</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue">
              <option value="author">Penulis</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button disabled={creating} className="px-6 py-3 bg-sabah-blue text-white rounded-xl font-bold hover:bg-sabah-red transition-colors disabled:opacity-60">
            {creating ? "Mencipta..." : "Cipta Akaun"}
          </button>
        </form>
        {error && <p className="text-sm text-sabah-red font-medium mt-4">{error}</p>}

        {createdCreds && (
          <div className="mt-6 p-6 rounded-2xl bg-sabah-yellow/10 border border-sabah-yellow/30">
            <p className="font-bold mb-2">Akaun dicipta! Berikan maklumat ini kepada penulis (hanya dipaparkan sekali):</p>
            <p className="text-sm">Emel: <span className="font-mono">{createdCreds.email}</span></p>
            <p className="text-sm">Kata Laluan Sementara: <span className="font-mono">{createdCreds.tempPassword}</span></p>
            <p className="text-xs text-gray-500 mt-2">Cadangkan mereka log masuk & guna &quot;Lupa kata laluan&quot; untuk tukar kata laluan sendiri.</p>
            <button onClick={() => setCreatedCreds(null)} className="mt-3 text-xs font-bold text-sabah-blue hover:underline">Tutup</button>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Semua Akaun ({users.length})</h2>
      {loading ? (
        <p className="text-gray-400">Memuatkan...</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Nama</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Emel</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Peranan</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-sabah-blue/[0.02] dark:hover:bg-sabah-blue/[0.05] transition-colors">
                    <td className="px-6 py-4 font-bold">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        disabled={u.uid === user.uid}
                        className="text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1 disabled:opacity-50"
                      >
                        <option value="author">Penulis</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.disabled ? "bg-sabah-red/10 text-sabah-red" : "bg-sabah-green/10 text-sabah-green"}`}>
                        {u.disabled ? "Dinyahaktifkan" : "Aktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                      <button disabled={u.uid === user.uid} onClick={() => toggleDisabled(u)} className="text-sm font-bold text-sabah-blue hover:underline disabled:opacity-40">
                        {u.disabled ? "Aktifkan" : "Nyahaktifkan"}
                      </button>
                      <button disabled={u.uid === user.uid} onClick={() => removeUser(u)} className="text-sm font-bold text-sabah-red hover:underline disabled:opacity-40">
                        Padam
                      </button>
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
