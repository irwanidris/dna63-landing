import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNewsroomUser } from "../../lib/useNewsroomUser";

export default function NewsroomLogin() {
  const router = useRouter();
  const { user, loading } = useNewsroomUser();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/newsroom");
  }, [loading, user, router]);

  const handleGoogleLogin = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const token = await result.user.getIdToken();
      const res = await fetch("/api/newsroom/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        await signOut(auth);
        setError(
          `Emel ${result.user.email} belum diberi akses newsroom. Hubungi admin DNA63 untuk dijemput.`
        );
        return;
      }
      router.replace("/newsroom");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Log masuk Google gagal. Sila cuba lagi.");
      }
    } finally {
      setBusy(false);
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
            <p className="text-sm text-gray-500 mt-2 text-center">
              Akses terhad kepada penulis yang telah dijemput oleh admin.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={busy}
            className="w-full py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5c-7.5 0-14 4.3-17.7 10.2z" />
              <path fill="#4CAF50" d="M24 43.5c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 34.6 26.9 35.5 24 35.5c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.9 39.1 16.4 43.5 24 43.5z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C41.5 35.9 43.5 30.4 43.5 24c0-1.2-.1-2.4-.4-3.5z" />
            </svg>
            {busy ? "Log masuk..." : "Log Masuk dengan Google"}
          </button>

          {error && <p className="text-sm text-sabah-red font-medium mt-4 text-center">{error}</p>}

          <Link href="/" className="block text-center mt-8 text-sm text-gray-400 hover:text-sabah-blue transition-colors font-medium">
            &larr; Balik ke Laman Utama
          </Link>
        </div>
      </div>
    </>
  );
}
