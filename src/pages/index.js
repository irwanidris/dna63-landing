import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const MotionLink = motion.create(Link)

const PLAY_STORE_BASE = "https://play.google.com/store/apps/details?id=com.dna63.rhinoresources"
const playStoreLink = (role) => role ? `${PLAY_STORE_BASE}&referrer=role%3D${role}` : PLAY_STORE_BASE

const FEATURES = [
  {
    icon: '🎓',
    title: 'Akademi & Kuiz MA63',
    desc: 'Kuiz harian sejarah Malaysia Agreement 1963, sistem XP & lencana, kandungan pendidikan mesra pengguna.',
  },
  {
    icon: '📍',
    title: 'Aduan Rakyat',
    desc: 'Lapor & jejak isu jalan raya/awam terus ke ADUN/Ahli Parlimen kawasan dengan peta interaktif sempadan DUN & Parlimen.',
  },
  {
    icon: '🛵',
    title: 'Perkhidmatan Runner',
    desc: 'Tempah Runner untuk hantar barang, tawar-menawar harga, penjejakan lokasi langsung & pengesahan OTP.',
  },
  {
    icon: '📚',
    title: 'Kedai Buku & Acara',
    desc: 'Beli & jejak status pesanan buku/merchandise, tiket digital acara, check-in dan sijil penyertaan automatik.',
  },
  {
    icon: '🏆',
    title: 'Ganjaran & Gamifikasi',
    desc: 'Kutip XP dari kuiz, daily check-in & ulasan. Leaderboard ahli dan keahlian bertingkat Free, Verified, Activist, Premium.',
  },
  {
    icon: '💳',
    title: 'E-Wallet & Rujukan',
    desc: 'E-Wallet dalam apps dengan integrasi ToyyibPay, sistem rujukan (referral) ahli, dan pemberitahuan masa nyata.',
  },
]

const PERSONAS = [
  {
    icon: '🇲🇾',
    title: 'Rakyat Sabah Umum',
    desc: 'Berminat isu tempatan & sejarah MA63, mahu belajar sambil mengutip ganjaran.',
  },
  {
    icon: '💰',
    title: 'Pencari Pendapatan Sampingan',
    desc: 'Sertai ekonomi gig sebagai Runner atau Vendor/Barista, jana pendapatan mengikut masa lapang.',
  },
  {
    icon: '📣',
    title: 'Ahli Komuniti & Aktivis',
    desc: 'Ingin menyuarakan isu awam secara berkesan terus kepada wakil rakyat kawasan.',
  },
]

const MEMBERSHIP_TIERS = [
  { name: 'Free', color: 'bg-gray-500', desc: 'Akses asas — kuiz harian, aduan rakyat & perkhidmatan Runner.' },
  { name: 'Verified', color: 'bg-sabah-blue', desc: 'Kandungan eksklusif ahli disahkan, termasuk naskah Limited Edition.' },
  { name: 'Activist', color: 'bg-sabah-red', desc: 'Akses Bengkel DNA63 Mastery & meeting khas Circle Aktivis.' },
  { name: 'Premium', color: 'bg-sabah-yellow text-dark', desc: 'Semua ciri terbuka dengan keutamaan ganjaran & perkhidmatan.' },
]

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const [referralId, setReferralId] = useState(null);

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

  // Dynamic link for the web portal (secondary option to the native apps)
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
        <title>DNA63 Community | Ilmu, Ganjaran & Perkhidmatan Rakyat Sabah</title>
        <meta name="description" content="Platform digital rakyat Sabah — Akademi MA63, Aduan Rakyat, Runner & Vendor dalam satu apps. Muat turun DNA63 Community di Google Play sekarang." />
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
                    href={playStoreLink()}
                    target="_blank"
                    className="block w-full py-2.5 md:py-3 bg-sabah-blue text-white text-center rounded-xl font-bold text-xs md:text-base hover:bg-sabah-red transition-all shadow-lg shadow-sabah-blue/30"
                  >
                    Muat Turun Apps & Tebus
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex flex-col items-center text-dark dark:text-light w-full min-h-screen">
        {/* Navigation Bar */}
        <nav className="w-full px-8 py-6 flex items-center justify-between font-medium bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={40} height={40} className="object-contain" />
            DNA63<span className="text-sabah-red">.</span>
          </div>
          <div className="hidden md:flex items-center space-x-7">
            <Link href="#ciri-ciri" className="hover:text-sabah-blue transition-colors">Ciri-ciri</Link>
            <Link href="#aduan-rakyat" className="hover:text-sabah-blue transition-colors">Aduan Rakyat</Link>
            <Link href="#runner" className="hover:text-sabah-blue transition-colors">Runner</Link>
            <Link href="#vendor" className="hover:text-sabah-blue transition-colors">Vendor</Link>
            <Link href="#ilmu" className="hover:text-sabah-blue transition-colors">Ilmu</Link>
            <Link
              href={playStoreLink()}
              target="_blank"
              className="bg-sabah-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-sabah-red transition-all shadow-lg shadow-sabah-blue/20"
            >
              Muat Turun Apps
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center w-full px-8 py-20 md:py-32 bg-gradient-to-b from-sabah-blue/5 to-white dark:from-dark dark:to-dark">
          <div className="max-w-4xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1.5 rounded-full bg-sabah-blue/10 text-sabah-blue text-sm font-bold tracking-wide"
            >
              DNA63 Community
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold leading-tight"
            >
              Ilmu, Ganjaran & <span className="text-sabah-blue">Perkhidmatan Rakyat Sabah.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400"
            >
              Platform digital rakyat Sabah yang menggabungkan pendidikan sejarah MA63, ekonomi gig tempatan dan
              penglibatan komuniti — dalam satu genggaman. Belajar, jana pendapatan, dan suarakan isu tempatan anda.
            </motion.p>

            {/* Primary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4"
            >
              <Link
                href={playStoreLink()}
                target="_blank"
                className="group relative bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 overflow-hidden border border-white/10"
              >
                <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.6099 20.8801C3.3899 20.6401 3.2699 20.2801 3.2699 19.8201V4.17012C3.2699 3.71012 3.3899 3.35012 3.6099 3.11012L12.0199 11.5301L3.6099 20.8801Z" fill="#00AEEF"/>
                  <path d="M15.5499 15.0601L12.0199 11.5301L3.6099 3.11012C3.9099 2.80012 4.3899 2.61012 4.9699 2.73012L15.9399 9.02012L15.5499 15.0601Z" fill="#00A651"/>
                  <path d="M15.5499 15.0601L15.9399 9.02012L19.4699 11.0201C20.3099 11.5001 20.3099 12.5001 19.4699 12.9801L15.5499 15.0601Z" fill="#FFF200"/>
                  <path d="M15.5499 15.0601L4.9699 21.2701C4.3899 21.3901 3.9099 21.2001 3.6099 20.8901L12.0199 12.4601L15.5499 15.0601Z" fill="#ED1C24"/>
                </svg>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-normal">Google Play Store</span>
                  <span>Muat Turun Apps</span>
                </div>
              </Link>

              <Link
                href={playStoreLink('runner')}
                target="_blank"
                className="px-8 py-4 bg-sabah-green text-white rounded-2xl text-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-sabah-green/30 flex items-center justify-center gap-2"
              >
                🛵 Daftar Jadi Runner
              </Link>

              <Link
                href={playStoreLink('vendor')}
                target="_blank"
                className="px-8 py-4 bg-sabah-brown text-white rounded-2xl text-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-sabah-brown/30 flex items-center justify-center gap-2"
              >
                ☕ Daftar Jadi Vendor
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 text-sm text-gray-500"
            >
              Nak lapor atau semak <strong className="text-sabah-blue">Aduan Rakyat</strong>? Muat turun apps untuk mula guna peta interaktif.
            </motion.p>

            {/* AI Question Box - Tanya DNA63 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-14 w-full max-w-2xl mx-auto"
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
          </div>
        </section>

        {/* Overview Strip */}
        <section className="w-full px-8 py-10 bg-sabah-blue text-white flex flex-col items-center">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">Flutter + Firebase</p>
              <p className="text-white/70 text-sm mt-1">Dibina di atas teknologi masa nyata yang mantap</p>
            </div>
            <div>
              <p className="text-2xl font-bold">3 Varian Apps</p>
              <p className="text-white/70 text-sm mt-1">Community · Runner · Vendor dalam satu ekosistem</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Fokus Sabah</p>
              <p className="text-white/70 text-sm mt-1">Direka khusus untuk rakyat & isu tempatan Sabah</p>
            </div>
          </div>
        </section>

        {/* Ciri Utama Section */}
        <section id="ciri-ciri" className="w-full px-8 py-20 bg-white dark:bg-gray-900 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">Ciri Utama DNA63 Community</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-16 text-center max-w-2xl">
            Satu apps, banyak keupayaan — dari ilmu sejarah hingga perkhidmatan harian rakyat Sabah.
          </p>
          <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -6 }}
                className="p-8 rounded-3xl bg-light dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Aduan Rakyat Section */}
        <section id="aduan-rakyat" className="w-full px-8 py-20 bg-sabah-blue/5 dark:bg-gray-950 flex flex-col items-center border-t border-sabah-blue/10">
          <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sabah-blue font-bold text-sm tracking-widest uppercase">Peta Interaktif</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Aduan Rakyat</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Lapor kerosakan jalan raya atau isu awam terus ke ADUN/Ahli Parlimen kawasan anda — lengkap dengan
                gambar, lokasi GPS, dan peta &quot;Warna Kawasan&quot; yang memaparkan sempadan DUN & Parlimen Sabah.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-blue mt-1">✔</span>
                  <span>Status kes telus: Baru → Sah → 30/60 Hari+ → Selesai</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-blue mt-1">✔</span>
                  <span>Pengesahan komuniti — aduan disahkan ahli lain sebelum dianggap &quot;Sah&quot;</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-blue mt-1">✔</span>
                  <span>Peta interaktif sempadan DUN & Parlimen untuk kenal pasti wakil rakyat anda</span>
                </li>
              </ul>
              <Link
                href={playStoreLink()}
                target="_blank"
                className="inline-flex items-center gap-2 px-8 py-4 bg-sabah-blue text-white rounded-xl text-lg font-bold hover:bg-sabah-red transition-all shadow-lg shadow-sabah-blue/30"
              >
                Muat Turun Apps untuk Lapor Aduan →
              </Link>
            </div>
            <div className="relative aspect-square bg-gradient-to-br from-sabah-blue/20 via-sabah-yellow/10 to-sabah-red/10 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-sabah-blue/10">
              <span className="text-8xl">🗺️</span>
            </div>
          </div>
        </section>

        {/* Runner Section */}
        <section id="runner" className="w-full px-8 py-20 bg-white dark:bg-gray-900 flex flex-col items-center border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square order-2 md:order-1 rounded-3xl overflow-hidden shadow-2xl border-4 border-sabah-green/10">
              <Image
                src="/images/runner_hero.webp"
                alt="Runner DNA63"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <span className="text-sabah-green font-bold text-sm tracking-widest uppercase">Ekonomi Gig Tempatan</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Jadi Runner, Jana Pendapatan</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Sertai ekonomi gig DNA63 sebagai Runner — bantu hantar barang untuk ahli komuniti dan jana pendapatan
                mengikut masa lapang anda sendiri.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-green mt-1">✔</span>
                  <span>Tawar-menawar harga (bargain) untuk setiap tempahan penghantaran</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-green mt-1">✔</span>
                  <span>Penjejakan lokasi langsung (live tracking) pada peta</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-green mt-1">✔</span>
                  <span>Pengesahan OTP semasa ambil barang & bukti gambar bertera GPS semasa hantar</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-green mt-1">✔</span>
                  <span>Sistem penilaian (rating) & tips daripada pelanggan</span>
                </li>
              </ul>
              <Link
                href={playStoreLink('runner')}
                target="_blank"
                className="inline-flex items-center gap-2 px-8 py-4 bg-sabah-green text-white rounded-xl text-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-sabah-green/30"
              >
                Daftar Jadi Runner →
              </Link>
            </div>
          </div>
        </section>

        {/* Vendor Section */}
        <section id="vendor" className="w-full px-8 py-20 bg-sabah-brown/5 dark:bg-gray-950 flex flex-col items-center border-t border-sabah-brown/10">
          <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sabah-brown font-bold text-sm tracking-widest uppercase">Rakan Niaga Kopi</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Jadi Vendor DNA63</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Sertai program rakan niaga kopi tempatan DNA63 dan jangkau ahli komuniti terus melalui apps — mulakan
                perniagaan anda sebagai Barista rakan kongsi DNA63.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-brown mt-1">✔</span>
                  <span>Jangkau ahli komuniti DNA63 sebagai pelanggan tetap</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-brown mt-1">✔</span>
                  <span>Terima pesanan & pembayaran terus melalui e-wallet dalam apps</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-sabah-brown mt-1">✔</span>
                  <span>Sebahagian daripada ekosistem ganjaran & gamifikasi DNA63</span>
                </li>
              </ul>
              <Link
                href={playStoreLink('vendor')}
                target="_blank"
                className="inline-flex items-center gap-2 px-8 py-4 bg-sabah-brown text-white rounded-xl text-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-sabah-brown/30"
              >
                Daftar Jadi Vendor →
              </Link>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-sabah-brown/10">
              <Image
                src="/images/vendor_hero.webp"
                alt="Vendor DNA63"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Sasaran Pengguna */}
        <section className="w-full px-8 py-20 bg-white dark:bg-gray-900 flex flex-col items-center border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Untuk Siapa DNA63?</h2>
          <div className="max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
            {PERSONAS.map((p) => (
              <div key={p.title} className="p-8 rounded-3xl bg-light dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Akademi & Ilmu MA63 Section (repositioned books) */}
        <section id="ilmu" className="w-full px-8 py-20 bg-light dark:bg-dark flex flex-col items-center border-t border-gray-100 dark:border-gray-800">
          <span className="text-sabah-blue font-bold text-sm tracking-widest uppercase mb-2">Akademi DNA63</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">Gedung Ilmu MA63</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-16 text-center max-w-2xl">
            Kandungan eksklusif Akademi MA63 dalam apps — kutip XP setiap kali membaca & menjawab kuiz.
          </p>
          <div className="max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
            <BookCard
              title="VETO (2025)"
              desc="Novel pengembaraan masa yang membongkar sejarah perundingan MA63 & Laporan Cobbold melalui Arkib Prof AJ Stockwell."
              image="/images/veto_book.png"
              color="bg-red-900"
            />
            <BookCard
              title="KENDADU (2024)"
              desc="Membongkar perubahan hak Sabah dalam Perlembagaan sejak 1963 and kesan Ordinan Darurat 1969 berdasarkan hansard rasmi."
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

        {/* Bengkel Mastery / Membership Section */}
        <section className="w-full px-8 py-20 bg-white dark:bg-gray-900 flex flex-col items-center">
          <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative aspect-[4/5] bg-gradient-to-t from-sabah-blue/10 to-transparent rounded-3xl overflow-hidden shadow-2xl border-4 border-sabah-blue/20">
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

          {/* Membership Tiers */}
          <div className="max-w-5xl w-full">
            <h3 className="text-2xl font-bold mb-8 text-center">Keahlian Bertingkat</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MEMBERSHIP_TIERS.map((tier) => (
                <div key={tier.name} className="p-5 rounded-2xl bg-light dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3 ${tier.color}`}>{tier.name}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Download App Section */}
        <section className="w-full px-8 py-20 bg-sabah-blue/10 flex flex-col items-center border-t border-sabah-blue/10">
          <div className="max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-sabah-blue">Bawa DNA63 Ke Mana Sahaja</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Dapatkan akses pantas ke Akademi MA63, Aduan Rakyat, Runner, Vendor dan komuniti DNA63 terus dari
              telefon pintar anda. Muat turun aplikasi Android rasmi kami sekarang.
            </p>
            <div className="flex flex-col items-center justify-center gap-10">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link
                  href={playStoreLink()}
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
                    <span>Muat Turun Apps</span>
                  </div>
                </Link>

                <Link
                  href={playStoreLink('runner')}
                  target="_blank"
                  className="px-6 py-4 bg-sabah-green text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-sabah-green/20"
                >
                  🛵 Daftar Runner
                </Link>

                <Link
                  href={playStoreLink('vendor')}
                  target="_blank"
                  className="px-6 py-4 bg-sabah-brown text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-sabah-brown/20"
                >
                  ☕ Daftar Vendor
                </Link>
              </div>

              <Link
                href={appLink}
                className="text-sabah-blue font-bold hover:underline flex items-center gap-2"
              >
                Atau guna Versi Web &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full px-8 py-12 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center">
          <p className="text-gray-500 text-center">© 2026 DNA63 Community. Platform Digital Rakyat Sabah. Semua Hak Terpelihara.</p>
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
      <Link href={playStoreLink()} target="_blank" className="mt-auto text-sabah-blue font-bold hover:underline">
        Baca Dalam Apps &rarr;
      </Link>
    </motion.div>
  )
}
