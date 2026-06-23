import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const MotionLink = motion.create(Link)

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const [referralId, setReferralId] = useState(null);
  const [betaForm, setBetaForm] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleBetaSubmit = async (e) => {
    e.preventDefault();
    if (!betaForm.name || !betaForm.email) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "beta_testers"), {
        name: betaForm.name,
        email: betaForm.email,
        timestamp: serverTimestamp(),
        referralId: referralId || 'direct'
      });
      setSubmitStatus("Berjaya! Kami akan hantar jemputan beta ke emel anda.");
      setBetaForm({ name: '', email: '' });
    } catch (error) {
      console.error("Error adding tester:", error);
      setSubmitStatus("Maaf, ralat berlaku. Sila cuba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check for referral ID in URL
    if (router.isReady) {
      const { ref } = router.query;
      if (ref) {
        setReferralId(ref);
        localStorage.setItem('dna63_ref', ref);
      } else {
        // Fallback to localStorage if no ref in URL
        const savedRef = localStorage.getItem('dna63_ref');
        if (savedRef) setReferralId(savedRef);
      }
    }
  }, [router.isReady, router.query]);

  // Dynamic link for the app portal
  const appLink = referralId
    ? `https://app.dna63.com?ref=${referralId}`
    : "https://app.dna63.com";

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
        <link rel="icon" href="/images/logo_dna63.png" />
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
                    href={appLink}
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
              href={appLink}
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
                href={appLink}
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
              appLink={appLink}
            />
            <BookCard
              title="KENDADU (2024)"
              desc="Membongkar perubahan hak Sabah dalam Perlembagaan sejak 1963 and kesan Ordinan Darurat 1969 berdasarkan hansard rasmi."
              image="/images/kendadu_book.png"
              color="bg-blue-900"
              appLink={appLink}
            />
            <BookCard
              title="MA63 The Constitution (2023)"
              desc="Susunan semula Perlembagaan dengan indikasi 'Teks Merah' (Annex A) untuk membezakan hak asal Borneo dan perlembagaan semasa."
              image="/images/ma63tc_book.png"
              color="bg-yellow-600"
              appLink={appLink}
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
            <div className="flex flex-col items-center justify-center gap-10">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.dna63.rhinoresources"
                  target="_blank"
                  className="group relative bg-black text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-900 transition-all shadow-xl shadow-black/20 flex items-center gap-4 overflow-hidden border border-white/10"
                >
                  <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <svg className="w-8 h-8 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.6099 20.8801C3.3899 20.6401 3.2699 20.2801 3.2699 19.8201V4.17012C3.2699 3.71012 3.3899 3.35012 3.6099 3.11012L12.0199 11.5301L3.6099 20.8801Z" fill="#00AEEF"/>
                    <path d="M15.5499 15.0601L12.0199 11.5301L3.6099 3.11012C3.9099 2.80012 4.3899 2.61012 4.9699 2.73012L15.9399 9.02012L15.5499 15.0601Z" fill="#00A651"/>
                    <path d="M15.5499 15.0601L15.9399 9.02012L19.4699 11.0201C20.3099 11.5001 20.3099 12.5001 19.4699 12.9801L15.5499 15.0601Z" fill="#FFF200"/>
                    <path d="M15.5499 15.0601L4.9699 21.2701C4.3899 21.3901 3.9099 21.2001 3.6099 20.8901L12.0199 12.4601L15.5499 15.0601Z" fill="#ED1C24"/>
                  </svg>
                  <div className="flex flex-col items-start relative z-10 text-left">
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-normal">Google Play Store</span>
                    <span>BETA TESTER</span>
                  </div>
                </Link>

                <Link
                  href={appLink}
                  className="text-sabah-blue font-bold hover:underline flex items-center gap-2"
                >
                  Atau guna Versi Web &rarr;
                </Link>
              </div>

              {/* Beta Registration Form */}
              <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl border border-sabah-blue/10">
                <h3 className="text-xl font-bold mb-2 text-sabah-blue">Daftar Sebagai Penguji Beta</h3>
                <p className="text-sm text-gray-500 mb-6">Dapatkan akses awal ke aplikasi DNA63. Sila isi nama dan alamat emel di bawah.</p>
                <form onSubmit={handleBetaSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nama Penuh"
                    value={betaForm.name}
                    onChange={(e) => setBetaForm({...betaForm, name: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-sabah-blue/50"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Alamat Emel"
                    value={betaForm.email}
                    onChange={(e) => setBetaForm({...betaForm, email: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-sabah-blue/50"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-sabah-blue text-white rounded-xl font-bold hover:bg-sabah-red transition-all disabled:opacity-50 shadow-lg shadow-sabah-blue/20"
                  >
                    {isSubmitting ? "Menghantar..." : "Hantar Permohonan Beta"}
                  </button>
                </form>
                {submitStatus && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-sm font-medium ${submitStatus.includes('Berjaya') ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {submitStatus}
                  </motion.p>
                )}
              </div>
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

function BookCard({ title, desc, image, color, appLink }) {
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
      <Link href={appLink || "https://app.dna63.com"} className="mt-auto text-sabah-blue font-bold hover:underline">
        Baca Sekarang &rarr;
      </Link>
    </motion.div>
  )
}
