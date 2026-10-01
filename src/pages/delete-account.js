import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

const PLAY_STORE_BASE = "https://play.google.com/store/apps/details?id=com.dna63.rhinoresources"

export default function DeleteAccount() {
  return (
    <>
      <Head>
        <title>Padam Akaun | DNA63 Community</title>
        <meta name="description" content="Cara memadam akaun DNA63 anda secara kekal." />
      </Head>

      <main className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light font-sans">
        {/* Navigation Bar */}
        <nav className="w-full px-8 py-6 flex items-center justify-between font-medium bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
          <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={40} height={40} className="object-contain" />
            DNA63<span className="text-sabah-red">.</span>
          </Link>
          <div className="hidden md:flex items-center space-x-7">
            <Link href="/" className="hover:text-sabah-blue transition-colors">Utama</Link>
            <Link href="/terms" className="hover:text-sabah-blue transition-colors">Terma</Link>
            <Link
              href="/#download"
              className="bg-sabah-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-sabah-red transition-all shadow-lg shadow-sabah-blue/20"
            >
              Muat Turun Apps
            </Link>
          </div>
        </nav>

        {/* Content Section */}
        <div className="w-full px-4 md:px-8 py-12 md:py-20 flex flex-col items-center">
          <div className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Flag bar decoration */}
            <div className="h-2 flex w-full">
              <div className="h-full w-1/3 bg-sabah-blue"></div>
              <div className="h-full w-1/3 bg-sabah-red"></div>
              <div className="h-full w-1/3 bg-sabah-yellow"></div>
            </div>

            <div className="p-8 md:p-16">
              <header className="mb-12 border-b border-gray-100 dark:border-gray-800 pb-8 text-center md:text-left">
                <p className="text-sabah-red font-bold text-xs tracking-widest uppercase mb-2">Akaun & Keselamatan</p>
                <h1 className="text-3xl md:text-5xl font-bold mb-6">Padam Akaun</h1>
                <p className="text-gray-500 dark:text-gray-400">Kami menghargai privasi anda. Jika anda ingin memadamkan akaun DNA63 anda dan semua data peribadi yang berkaitan secara kekal, sila gunakan salah satu kaedah di bawah.</p>
              </header>

              <div className="text-gray-700 dark:text-gray-300 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-sabah-blue/5 dark:bg-sabah-blue/10 p-8 rounded-[2rem] border border-sabah-blue/10 transition-transform hover:scale-[1.02] flex flex-col items-center text-center">
                    <div className="text-4xl mb-4">📱</div>
                    <h3 className="text-xl font-bold mb-3 text-sabah-blue">Melalui Aplikasi</h3>
                    <p className="text-sm leading-relaxed mb-6">
                      Cara terpantas: Buka aplikasi <strong>DNA63 Community</strong> &rarr; <strong>Akaun</strong> &rarr; <strong>Tetapan</strong> &rarr; <strong>Padam Akaun</strong>.
                    </p>
                    <span className="mt-auto text-xs font-bold text-sabah-blue uppercase tracking-widest">Serta-merta</span>
                  </div>

                  <div className="bg-sabah-red/5 dark:bg-sabah-red/10 p-8 rounded-[2rem] border border-sabah-red/10 transition-transform hover:scale-[1.02] flex flex-col items-center text-center">
                    <div className="text-4xl mb-4">📧</div>
                    <h3 className="text-xl font-bold mb-3 text-sabah-red">Melalui Emel</h3>
                    <p className="text-sm leading-relaxed mb-6">
                      Hantar emel ke <strong className="text-sabah-red">support@dna63.com</strong> dengan subjek <strong>"Padam Akaun"</strong> berserta alamat emel berdaftar anda.
                    </p>
                    <span className="mt-auto text-xs font-bold text-sabah-red uppercase tracking-widest">3 Hari Bekerja</span>
                  </div>
                </div>

                <div className="bg-sabah-yellow/10 p-8 rounded-3xl border border-sabah-yellow/20 flex gap-4 items-start">
                  <span className="text-2xl mt-1">⚠</span>
                  <div>
                    <p className="font-bold text-sabah-brown mb-2 uppercase text-xs tracking-widest">Amaran Penting</p>
                    <p className="text-sm text-sabah-brown/80 leading-relaxed italic">
                      Sebaik sahaja akaun dipadamkan, semua data termasuk status verifikasi (Verified/Activist), baki XP, ganjaran, dan akses buku digital akan dibuang secara kekal dan tidak boleh dipulihkan. Baki wallet yang tidak digunakan akan ditadbir mengikut Seksyen 4.4 Terma Perkhidmatan.
                    </p>
                  </div>
                </div>
              </div>

              <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-center">
                &copy; 2026 DNA63 Community. Platform Digital Rakyat Sabah.
              </footer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full px-8 py-12 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center">
          <p className="text-gray-500 text-center mb-4">© 2026 DNA63 Community. Platform Digital Rakyat Sabah. Semua Hak Terpelihara.</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8 text-sm font-medium">
            <Link href="/privacy" className="hover:text-sabah-blue transition-colors">Dasar Privasi</Link>
            <Link href="/terms" className="hover:text-sabah-blue transition-colors">Terma Perkhidmatan</Link>
            <Link href="/delete-account" className="hover:text-sabah-red transition-colors">Padam Akaun</Link>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="#" className="hover:text-sabah-blue">Facebook</Link>
            <Link href="#" className="hover:text-sabah-blue">Telegram</Link>
            <Link href="#" className="hover:text-sabah-blue">WhatsApp</Link>
          </div>
        </footer>
      </main>
    </>
  )
}
