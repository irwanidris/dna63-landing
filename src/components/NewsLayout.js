import Link from "next/link";
import Image from "next/image";
import { PLAY_STORE_BASE, APP_STORE_BASE } from "../lib/storeLinks";

const storeBadge =
  "flex items-center gap-2 bg-black text-white pl-3 pr-4 py-2 rounded-xl border border-white/10 hover:bg-gray-800 transition-colors";

export default function NewsLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-light dark:bg-dark text-dark dark:text-light font-sans">
      <nav className="w-full px-6 md:px-8 py-5 flex items-center justify-between font-medium bg-white/80 dark:bg-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
        <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={36} height={36} className="object-contain" />
          DNA63<span className="text-sabah-red">.</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/berita" className="hover:text-sabah-blue transition-colors">
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
        <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
          <a href={APP_STORE_BASE} target="_blank" rel="noopener noreferrer" aria-label="Muat turun DNA63 di App Store" className={storeBadge}>
            <svg className="w-6 h-6 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.13-1.96.99-3.1-.97.04-2.16.65-2.85 1.46-.62.72-1.16 1.88-.99 3.01 1.09.08 2.21-.55 2.85-1.37z" />
            </svg>
            <span className="flex flex-col leading-tight text-left">
              <span className="text-[10px] text-gray-300">Muat turun di</span>
              <span className="text-sm font-bold">App Store</span>
            </span>
          </a>
          <a href={PLAY_STORE_BASE} target="_blank" rel="noopener noreferrer" aria-label="Dapatkan DNA63 di Google Play" className={storeBadge}>
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3.6099 20.8801C3.3899 20.6401 3.2699 20.2801 3.2699 19.8201V4.17012C3.2699 3.71012 3.3899 3.35012 3.6099 3.11012L12.0199 11.5301L3.6099 20.8801Z" fill="#00AEEF" />
              <path d="M15.5499 15.0601L12.0199 11.5301L3.6099 3.11012C3.9099 2.80012 4.3899 2.61012 4.9699 2.73012L15.9399 9.02012L15.5499 15.0601Z" fill="#00A651" />
              <path d="M15.5499 15.0601L15.9399 9.02012L19.4699 11.0201C20.3099 11.5001 20.3099 12.5001 19.4699 12.9801L15.5499 15.0601Z" fill="#FFF200" />
              <path d="M15.5499 15.0601L4.9699 21.2701C4.3899 21.3901 3.9099 21.2001 3.6099 20.8901L12.0199 12.4601L15.5499 15.0601Z" fill="#ED1C24" />
            </svg>
            <span className="flex flex-col leading-tight text-left">
              <span className="text-[10px] text-gray-300">Dapatkan di</span>
              <span className="text-sm font-bold">Google Play</span>
            </span>
          </a>
        </div>
        <p className="text-gray-500 text-sm text-center">© {new Date().getFullYear()} DNA63 Berita. Komuniti Rakyat Sabah.</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/berita" className="hover:text-sabah-blue">Berita</Link>
          <span>|</span>
          <a href="/feed.xml" className="hover:text-sabah-blue">RSS</a>
          <span>|</span>
          <Link href="/" className="hover:text-sabah-blue">DNA63.com</Link>
        </div>
      </footer>
    </div>
  );
}
