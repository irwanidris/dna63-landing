import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useNewsroomUser } from "../lib/useNewsroomUser";

export default function NewsroomLayout({ children, title }) {
  const router = useRouter();
  const { user, loading, signOut } = useNewsroomUser();

  useEffect(() => {
    if (!loading && !user) router.replace("/newsroom/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-sabah-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light font-sans">
      <nav className="w-full px-6 md:px-8 py-5 flex items-center justify-between font-medium bg-white/80 dark:bg-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
        <Link href="/newsroom" className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={32} height={32} className="object-contain" />
          DNA63<span className="text-sabah-red">.</span> Newsroom
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/newsroom" className="hover:text-sabah-blue transition-colors">Artikel Saya</Link>
          <Link href="/newsroom/new" className="hover:text-sabah-blue transition-colors">+ Artikel Baru</Link>
          {user.role === "admin" && (
            <Link href="/newsroom/admin" className="hover:text-sabah-blue transition-colors">Urus Penulis</Link>
          )}
          <span className="hidden sm:inline text-gray-400">{user.name}</span>
          <button onClick={signOut} className="text-sabah-red font-bold hover:underline">Log Keluar</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {title && <h1 className="text-3xl md:text-4xl font-bold mb-8">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
