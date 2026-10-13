import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useNewsroomUser } from "../lib/useNewsroomUser";

export default function NewsroomLayout({ children, title }) {
  const router = useRouter();
  const { user, loading, signOut } = useNewsroomUser();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/newsroom/login");
  }, [loading, user, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.asPath]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-sabah-blue border-t-transparent"></div>
      </div>
    );
  }

  const links = [
    ["/newsroom", "Artikel Saya"],
    ["/newsroom/new", "+ Artikel Baru"],
    ...(user.role === "admin"
      ? [
          ["/newsroom/categories", "Urus Kategori"],
          ["/newsroom/admin", "Urus Penulis"],
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light font-sans">
      <nav className="w-full px-4 md:px-8 py-4 lg:py-5 font-medium bg-white/80 dark:bg-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
        <div className="flex items-center justify-between">
          <Link href="/newsroom" className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={32} height={32} className="object-contain" />
            DNA63<span className="text-sabah-red">.</span> Newsroom
          </Link>

          <div className="hidden lg:flex items-center gap-5 text-sm">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-sabah-blue transition-colors">{label}</Link>
            ))}
            <span className="text-gray-400">{user.name}</span>
            <button onClick={signOut} className="text-sabah-red font-bold hover:underline">Log Keluar</button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            className="lg:hidden p-2 -mr-2 rounded-xl hover:bg-sabah-blue/10 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden flex flex-col mt-3 pt-2 border-t border-sabah-blue/10 text-base">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="py-3 hover:text-sabah-blue transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center justify-between py-3 mt-1 border-t border-sabah-blue/10">
              <span className="text-gray-400 text-sm truncate mr-4">{user.name}</span>
              <button onClick={signOut} className="text-sabah-red font-bold hover:underline shrink-0">Log Keluar</button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {title && <h1 className="text-3xl md:text-4xl font-bold mb-8">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
