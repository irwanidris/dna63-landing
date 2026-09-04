import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNewsroomUser } from "../../lib/useNewsroomUser";

export default function NewsroomLogin() {
  const router = useRouter();
  const { user, loading } = useNewsroomUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/newsroom");
  }, [loading, user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setResetSent(false);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/newsroom");
    } catch (err) {
      setError("Emel atau kata laluan salah.");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Masukkan emel anda dahulu, kemudian klik 'Lupa kata laluan'.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setError("");
    } catch {
      setError("Tidak dapat menghantar emel set semula.");
    }
  };

  return (
    <>
      <Head>
        <title>Log Masuk Penulis | DNA63</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark p-6 font-sans">
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 flex w-full">
            <div className="h-full w-1/3 bg-sabah-blue"></div>
            <div className="h-full w-1/3 bg-sabah-red"></div>
            <div className="h-full w-1/3 bg-sabah-yellow"></div>
          </div>

          <div className="flex flex-col items-center mb-8 pt-4">
            <div className="w-20 h-20 bg-sabah-blue/10 rounded-3xl flex items-center justify-center mb-6 border border-sabah-blue/10">
              <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={48} height={48} className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-light">Newsroom DNA63</h1>
            <p className="text-sm text-gray-500 mt-2 text-center">Log masuk untuk urus artikel berita.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Emel"
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue text-black dark:text-white transition-all placeholder:text-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              required
              placeholder="Kata Laluan"
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue text-black dark:text-white transition-all placeholder:text-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-sabah-red font-medium">{error}</p>}
            {resetSent && <p className="text-sm text-sabah-green font-medium">Emel set semula kata laluan telah dihantar.</p>}

            <button
              disabled={busy}
              className="w-full py-4 bg-sabah-blue text-white rounded-2xl font-bold shadow-lg shadow-sabah-blue/30 hover:bg-sabah-red transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? "Log masuk..." : "Log Masuk"} <span>&rarr;</span>
            </button>
          </form>

          <button onClick={handleReset} className="block w-full text-center mt-6 text-sm text-gray-400 hover:text-sabah-blue transition-colors font-medium">
            Lupa kata laluan?
          </button>
          <Link href="/" className="block text-center mt-4 text-sm text-gray-400 hover:text-sabah-blue transition-colors font-medium">
            &larr; Balik ke Laman Utama
          </Link>
        </div>
      </div>
    </>
  );
}
