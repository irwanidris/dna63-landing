import Link from "next/link";
import Image from "next/image";

export default function NewsLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-light dark:bg-dark text-dark dark:text-light font-sans">
      <nav className="w-full px-6 md:px-8 py-5 flex items-center justify-between font-medium bg-white/80 dark:bg-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
        <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={36} height={36} className="object-contain" />
          DNA63<span className="text-sabah-red">.</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/news" className="hover:text-sabah-blue transition-colors">
            Berita
          </Link>
          <Link href="/" className="hidden sm:inline hover:text-sabah-blue transition-colors">
            Laman Utama
          </Link>
          <Link
            href="/newsroom/login"
            className="text-xs font-bold text-gray-400 hover:text-sabah-blue transition-colors"
          >
            Log Masuk Penulis
          </Link>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="w-full px-8 py-10 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center gap-3 mt-16">
        <p className="text-gray-500 text-sm text-center">© {new Date().getFullYear()} DNA63 Berita. Komuniti Rakyat Sabah.</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/news" className="hover:text-sabah-blue">Berita</Link>
          <span>|</span>
          <a href="/feed.xml" className="hover:text-sabah-blue">RSS</a>
          <span>|</span>
          <Link href="/" className="hover:text-sabah-blue">DNA63.com</Link>
        </div>
      </footer>
    </div>
  );
}
