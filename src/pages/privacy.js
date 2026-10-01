import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

const PLAY_STORE_BASE = "https://play.google.com/store/apps/details?id=com.dna63.rhinoresources"

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Dasar Privasi | DNA63 Community</title>
        <meta name="description" content="Dasar Privasi DNA63 - Cara kami melindungi data peribadi anda." />
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
              <header className="mb-12 border-b border-gray-100 dark:border-gray-800 pb-8">
                <p className="text-sabah-blue font-bold text-xs tracking-widest uppercase mb-2">Privasi Data</p>
                <h1 className="text-3xl md:text-5xl font-bold mb-6">Dasar Privasi</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Terakhir dikemaskini: <span className="text-dark dark:text-gray-200 font-bold">17 Ogos 2026</span></p>
              </header>

              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-10">
                <section>
                  <h2 className="text-xl md:text-2xl font-bold text-sabah-blue mb-4">1. Pengenalan</h2>
                  <p>DNA63 menghormati privasi anda. Dasar ini menerangkan cara kami mengumpul, menggunakan, dan melindungi maklumat anda apabila anda menggunakan aplikasi mudah alih DNA63 Community dan perkhidmatan berkaitan kami.</p>
                </section>

                <section>
                  <h2 className="text-xl md:text-2xl font-bold text-sabah-blue mb-4">2. Maklumat yang Dikumpul</h2>
                  <p>Kami mengumpul maklumat yang anda berikan secara langsung semasa pendaftaran akaun, seperti:</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <p className="font-bold text-sm mb-1">Identiti</p>
                      <p className="text-xs text-gray-500">Nama penuh, Emel, dan No. Telefon (OTP).</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <p className="font-bold text-sm mb-1">Verifikasi MyKad</p>
                      <p className="text-xs text-gray-500">Untuk status Activist/Verified (diproses secara selamat).</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <p className="font-bold text-sm mb-1">Data Lokasi</p>
                      <p className="text-xs text-gray-500">Hanya untuk ciri Aduan Rakyat atau Runner.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <p className="font-bold text-sm mb-1">Transaksi</p>
                      <p className="text-xs text-gray-500">Rekod top-up dan penggunaan baki wallet.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl md:text-2xl font-bold text-sabah-blue mb-4">3. Keselamatan Data</h2>
                  <p>Keselamatan data anda adalah keutamaan kami. Kami menggunakan infrastruktur <strong>Google Firebase</strong> yang mematuhi piawaian keselamatan antarabangsa untuk menyimpan dan memproses data anda dengan enkripsi penuh.</p>
                </section>

                <section className="bg-sabah-blue/5 dark:bg-sabah-blue/10 p-8 rounded-3xl border border-sabah-blue/10 mt-12">
                  <h2 className="text-xl font-bold text-sabah-blue mb-2">Hubungi Pegawai Data</h2>
                  <p className="text-sm mb-4">Jika anda mempunyai sebarang soalan mengenai Dasar Privasi ini atau ingin membuat aduan mengenai data peribadi anda, sila hubungi kami di:</p>
                  <p className="font-bold text-sabah-blue text-lg">support@dna63.com</p>
                </section>
              </div>

              <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-center">
                &copy; 2026 DNA63 Community. Mematuhi Akta Perlindungan Data Peribadi 2010.
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
