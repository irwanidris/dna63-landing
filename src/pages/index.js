import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const MotionLink = motion.create(Link)

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 3000); // Show popup after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>DNA63 | Platform Literasi Hak Sabah</title>
        <meta name="description" content="Platform rasmi DNA63 untuk literasi MA63 dan Perlembagaan Persekutuan." />
      </Head>

      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-900 w-[90%] max-w-2xl max-h-[80vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col md:flex-row border border-white/10"
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-sabah-red transition-all shadow-lg"
                aria-label="Close popup"
              >
                <span className="text-xl font-bold">✕</span>
              </button>

              <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-[3/4] relative bg-sabah-blue/10">
                <Image
                  src="/images/surat_dari_london.png"
                  alt="Surat Dari London Limited Edition"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center overflow-y-auto">
                <span className="text-sabah-red font-bold text-[10px] md:text-sm tracking-widest uppercase mb-1 md:mb-2">Limited Edition</span>
                <h2 className="text-lg md:text-2xl font-bold mb-2 md:mb-4 text-sabah-blue">Surat Dari London</h2>
                <p className="text-[11px] md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 md:mb-6">
                  Membongkar rahsia surat menyurat antara Kerajaan selepas Singapura berpisah dari Persekutuan yang jelas ada usaha mengubah Perjanjian Malaysia yang ditandatangani pada 9 Julai 1963.
                  <br /><br className="hidden md:block" />
                  Surat-surat ini memberi jawapan kenapa perubahan besar dibuat seperti yang didokumentasikan di dalam buku <strong>KENDADU</strong>.
                </p>
                <div className="mt-auto">
                  <p className="text-[9px] md:text-xs text-sabah-blue font-bold mb-2 md:mb-3 italic">Eksklusif untuk Verified Members di Apps DNA63 sahaja.</p>
                  <Link
                    href="https://app.dna63.com"
                    className="block w-full py-2.5 md:py-3 bg-sabah-blue text-white text-center rounded-xl font-bold text-xs md:text-base hover:bg-sabah-red transition-all shadow-lg shadow-sabah-blue/30"
                  >
                    Masuk Apps & Tebus
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex flex-col items-center text-dark dark:text-light w-full min-h-screen">
        {/* Navigation Bar Placeholder */}
        <nav className="w-full px-8 py-6 flex items-center justify-between font-medium bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={40} height={40} className="object-contain" />
            DNA63<span className="text-sabah-red">.</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-sabah-blue transition-colors">Utama</Link>
            <Link href="#about" className="hover:text-sabah-blue transition-colors">Tentang</Link>
            <Link href="#books" className="hover:text-sabah-blue transition-colors">Produk</Link>
            <Link
              href="https://app.dna63.com"
              className="bg-sabah-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-sabah-red transition-all shadow-lg shadow-sabah-blue/20"
            >
              Masuk Platform
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center w-full px-8 py-20 md:py-32 bg-gradient-to-b from-sabah-blue/5 to-white dark:from-dark dark:to-dark">
          <div className="max-w-4xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold leading-tight"
            >
              Membangun Literasi, <span className="text-sabah-blue">Menuntut Hak Sabah.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400"
            >
              Platform digital pertama yang membedah MA63 dan Perlembagaan Persekutuan secara telus.
              Sertai komuniti DNA63 untuk masa depan Sabah yang lebih berdaulat.
            </motion.p>

            {/* AI Question Box - Tanya DNA63 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 w-full max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-bold mb-4 text-sabah-blue dark:text-sabah-blue">Tanya DNA63</h2>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-2xl border border-sabah-blue/20">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const input = e.target.question.value;
                    if(!input) return;

                    const btn = e.target.querySelector('button');
                    const responseArea = document.getElementById('ai-response');

                    btn.disabled = true;
                    responseArea.innerText = "DNA63 AI sedang berfikir...";
                    responseArea.classList.remove('hidden');

                    try {
                      const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: input })
                      });
                      const data = await res.json();

                      if (data.answer) {
                        // Typing Effect Logic
                        let i = 0;
                        const text = data.answer;
                        responseArea.innerText = ""; // Clear "Thinking..."

                        const timer = setInterval(() => {
                          if (i < text.length) {
                            responseArea.innerText += text.charAt(i);
                            i++;
                            responseArea.scrollTop = responseArea.scrollHeight;
                          } else {
                            clearInterval(timer);
                            btn.disabled = false;
                          }
                        }, 15); // Kelajuan menaip (15ms per character)
                      } else {
                        responseArea.innerText = "Maaf, ralat teknikal: " + (data.error || data.message || "Jawapan kosong");
                        btn.disabled = false;
                      }
                    } catch (err) {
                      console.error("Fetch error:", err);
                      responseArea.innerText = "Maaf, berlaku ralat sambungan. Cuba lagi nanti.";
                      btn.disabled = false;
                    } finally {
                      e.target.question.value = "";
                    }
                  }}
                  className="flex flex-col md:flex-row gap-2"
                >
                  <input
                    name="question"
                    type="text"
                    placeholder="Contoh: Apa itu MA63 dalam Perlembagaan?"
                    className="flex-1 px-6 py-4 rounded-xl bg-transparent outline-none text-dark dark:text-light"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-sabah-red text-white rounded-xl font-bold hover:bg-sabah-blue transition-all disabled:opacity-50"
                  >
                    Tanya
                  </button>
                </form>
                <div
                  id="ai-response"
                  className="hidden mt-4 p-4 text-left text-sm md:text-base text-gray-700 dark:text-gray-300 border-t border-gray-50 dark:border-gray-700 leading-relaxed whitespace-pre-wrap"
                >
                  {/* Jawapan AI akan muncul di sini */}
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500 italic">Dikuasakan oleh DNA63 AI - Jawapan berdasarkan konteks DNA63.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4"
            >
              <Link
                href="https://app.dna63.com"
                className="w-full md:w-auto px-8 py-4 bg-sabah-blue text-white rounded-xl text-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-sabah-blue/30"
              >
                Mulakan Eksplorasi
              </Link>
              <Link
                href="#books"
                className="w-full md:text-sabah-blue md:hover:bg-sabah-blue md:hover:text-white md:w-auto px-8 py-4 border-2 border-sabah-blue text-sabah-blue rounded-xl text-lg font-bold hover:bg-sabah-blue hover:text-white transition-all"
              >
                Lihat Koleksi Buku
              </Link>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full px-8 py-20 bg-white dark:bg-gray-900 flex flex-col items-center">
          <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] bg-gradient-to-t from-sabah-blue/10 to-transparent rounded-3xl overflow-hidden shadow-2xl border-4 border-sabah-blue/20">
               {/* Founder Image */}
               <Image
                src="/images/founder.png"
                alt="Founder DNA63"
                fill
                className="object-contain object-bottom"
                priority
               />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Bengkel DNA63 MASTERY</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Bengkel tertutup khas untuk mereka yang serius mahu mendalami semua bukti sejarah MA63 sebelum Suruhanjaya Cobbold sehingga lahirnya IGC yang menjadi titik permulaan kepada Perjanjian Mengikat Komitmen Kerajaan Persekutuan Tanah Melayu untuk menzahirkan janji-janji itu di dalam Perlembagaan Persekutuan Malaysia. Bengkel DNA63 Mastery adalah pintu masuk ke dalam Circle Khas Aktivis DNA63.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <span className="text-sabah-blue">✔</span>
                  <span>Status Kad Merah Aktivis di Apps</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-sabah-blue">✔</span>
                  <span>Akses Meeting Khas Aktivis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-primary">✔</span>
                  <span>Analisis Isu Semasa Sabah secara Mendalam</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Books Section */}
        <section id="books" className="w-full px-8 py-20 bg-light dark:bg-dark flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Gedung Ilmu DNA63</h2>
          <div className="max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
            <BookCard
              title="VETO (2025)"
              desc="Novel pengembaraan masa yang membongkar sejarah perundingan MA63 & Laporan Cobbold melalui Arkib Prof AJ Stockwell."
              image="/images/veto_book.png"
              color="bg-red-900"
            />
            <BookCard
              title="KENDADU (2024)"
              desc="Membongkar perubahan hak Sabah dalam Perlembagaan sejak 1963 dan kesan Ordinan Darurat 1969 berdasarkan hansard rasmi."
              image="/images/kendadu_book.png"
              color="bg-blue-900"
            />
            <BookCard
              title="MA63 The Constitution (2023)"
              desc="Susunan semula Perlembagaan dengan indikasi 'Teks Merah' (Annex A) untuk membezakan hak asal Borneo dan perlembagaan semasa."
              image="/images/ma63tc_book.png"
              color="bg-yellow-600"
            />
          </div>
        </section>

        {/* Download App Section */}
        <section className="w-full px-8 py-20 bg-sabah-blue/10 flex flex-col items-center border-t border-sabah-blue/10">
          <div className="max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-sabah-blue">Bawa DNA63 Ke Mana Sahaja</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Dapatkan akses pantas ke platform literasi MA63, koleksi buku digital, dan komuniti aktivis DNA63 terus dari telefon pintar anda. Muat turun aplikasi Android rasmi kami sekarang.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                href="https://drive.google.com/uc?export=download&id=1KIjI0rKRT0aWQPdm7muUcC8Zdt_YiR36"
                target="_blank"
                className="group relative bg-sabah-red text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-sabah-blue transition-all shadow-xl shadow-sabah-red/20 flex items-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                <div className="flex flex-col items-start relative z-10 text-left">
                  <span className="text-xs opacity-80 uppercase tracking-widest font-normal">Muat Turun APK</span>
                  <span>Google Drive</span>
                </div>
              </Link>

              <div className="group relative bg-gray-200 dark:bg-gray-800 text-gray-500 px-10 py-5 rounded-2xl font-bold text-xl flex items-center gap-4 border-2 border-dashed border-gray-400 opacity-80 cursor-not-allowed">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L18.66,16.97L4.95,22.25C4.7,22.34 4.45,22.39 4.21,22.39C4.07,22.39 3.93,22.37 3.8,22.33L13.69,12.44L16.81,15.12M14,11.75L17.21,8.96L18.66,7.55L4.95,1.75C4.74,1.67 4.54,1.62 4.35,1.61L13.69,11.44L14,11.75M17.21,12L20.84,15.22C21.21,15.55 21.43,15.89 21.5,16.24L17.55,12.3L17.21,12Z" />
                </svg>
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs opacity-80 uppercase tracking-widest font-normal">Google Play Store</span>
                  <span>Akan Datang</span>
                </div>
              </div>

              <Link
                href="https://app.dna63.com"
                className="text-sabah-blue font-bold hover:underline flex items-center gap-2"
              >
                Atau guna Versi Web &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full px-8 py-12 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center">
          <p className="text-gray-500">© 2026 DNA63. Semua Hak Terpelihara.</p>
          <div className="mt-4 flex space-x-6">
            <Link href="#" className="hover:text-primary">Facebook</Link>
            <Link href="#" className="hover:text-primary">Telegram</Link>
            <Link href="#" className="hover:text-primary">WhatsApp</Link>
          </div>
        </footer>
      </main>
    </>
  )
}

function BookCard({ title, desc, image, color }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col"
    >
      <div className={`w-full aspect-[3/4] relative rounded-xl mb-6 overflow-hidden shadow-inner ${color}`}>
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{desc}</p>
      <Link href="https://app.dna63.com" className="mt-auto text-sabah-blue font-bold hover:underline">
        Baca Sekarang &rarr;
      </Link>
    </motion.div>
  )
}
