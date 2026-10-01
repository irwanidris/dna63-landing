import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

const PLAY_STORE_BASE = "https://play.google.com/store/apps/details?id=com.dna63.rhinoresources"

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terma Perkhidmatan | DNA63 Community</title>
        <meta name="description" content="Terma Perkhidmatan yang mentadbir penggunaan aplikasi dan laman web DNA63." />
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
            <Link href="/privacy" className="hover:text-sabah-blue transition-colors">Privasi</Link>
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
                <p className="text-sabah-blue font-bold text-xs tracking-widest uppercase mb-2">Dokumen Rasmi</p>
                <h1 className="text-3xl md:text-5xl font-bold mb-6">Terma Perkhidmatan</h1>
                <div className="flex flex-wrap gap-4 md:gap-8 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <p>Berkuat kuasa: <span className="text-dark dark:text-gray-200 font-bold">15 Ogos 2026</span></p>
                  <p>Versi: <span className="text-dark dark:text-gray-200 font-bold">1.0</span></p>
                  <p>Bahasa Rujukan: <span className="text-dark dark:text-gray-200 font-bold">Bahasa Malaysia</span></p>
                </div>
              </header>

              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-12">
                <p className="text-lg text-gray-600 dark:text-gray-400 italic border-l-4 border-sabah-blue pl-6">
                  Terma Perkhidmatan ini (“Terma”) mentadbir penggunaan aplikasi mudah alih dan laman web DNA63 (“Perkhidmatan”, “Aplikasi”). DNA63 Community ialah komuniti digital yang diuruskan di bawah Kelab Kembara Sabah, sebuah persatuan berdaftar dengan Jabatan Pendaftaran Pertubuhan Malaysia (ROS) di bawah nombor pendaftaran <strong>PPM0201222022019</strong>. Dengan mendaftar akaun, anda bersetuju terikat dengan Terma ini dan <Link href="/privacy" className="text-sabah-blue hover:underline font-bold">Dasar Privasi</Link> kami.
                </p>

                <nav className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700">
                  <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6">Kandungan Utama</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {[
                      "Penerimaan Terma", "Penerangan Perkhidmatan", "Pendaftaran Akaun & Pengesahan",
                      "Wallet, Top-up & Pembayaran", "Perkhidmatan Rider & Penghantaran", "Marketplace Vendor",
                      "Sistem Aduan Awam", "Kelakuan Pengguna Dilarang", "Rujukan, XP & Ganjaran",
                      "Hak Milik Intelek", "Penggantungan & Penamatan", "Had Liabiliti & Penafian",
                      "Indemnifikasi", "Force Majeure", "Definisi Istilah", "Undang-undang Terpakai",
                      "Peruntukan Am", "Perubahan Terma", "Hubungi Kami"
                    ].map((item, i) => (
                      <a key={i} href={`#s${i+1}`} className="hover:text-sabah-blue transition-colors flex gap-2">
                        <span className="text-sabah-blue/40 font-mono">{(i+1).toString().padStart(2, '0')}</span> {item}
                      </a>
                    ))}
                  </div>
                </nav>

                <section id="s1" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 1</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Penerimaan Terma</h2>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-sabah-blue">1.1 Umur Minimum</h3>
                    <p>Anda mesti berumur sekurang-kurangnya <strong>13 tahun</strong> untuk mendaftar dan menggunakan ciri asas Aplikasi (komuniti, kuiz MA63, kedai buku).</p>
                    <h3 className="font-bold text-sabah-blue">1.2 Pengguna Berumur 13–17 Tahun</h3>
                    <p>Penggunaan Aplikasi mestilah dengan kebenaran dan di bawah penyeliaan ibu bapa atau penjaga sah anda. Ibu bapa/penjaga tersebut dianggap bersetuju terikat dengan Terma ini bagi pihak kanak-kanak berkenaan.</p>
                    <div className="bg-sabah-blue/5 p-6 rounded-2xl border border-sabah-blue/10 text-sm">
                      <p className="font-bold text-sabah-blue mb-2 uppercase tracking-tight">Keperluan Undang-undang</p>
                      <p>Ciri-ciri yang melibatkan kontrak kewangan atau perkhidmatan (Wallet, Rider, Vendor) hanya dibenarkan untuk pengguna berumur <strong>18 tahun ke atas</strong> yang telah melengkapkan pengesahan identiti.</p>
                    </div>
                  </div>
                </section>

                <section id="s2" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 2</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Penerangan Perkhidmatan</h2>
                  </div>
                  <p>DNA63 Community ialah komuniti digital yang diuruskan di bawah <strong>Kelab Kembara Sabah (PPM0201222022019)</strong>. Kami bukan entiti kerajaan. Platform kami merangkumi:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Komuniti & Pendidikan</strong> — kuiz MA63, koleksi buku, akademi.</li>
                    <li><strong>Peta Aduan Jalan Raya</strong> — pelaporan isu awam kepada wakil rakyat.</li>
                    <li><strong>Perkhidmatan Rider</strong> — padanan penghantaran antara pengguna dan rider.</li>
                    <li><strong>Marketplace Vendor</strong> — jualan produk oleh peniaga pihak ketiga.</li>
                    <li><strong>Wallet DNA63</strong> — baki dalam-aplikasi untuk pembayaran.</li>
                  </ul>
                </section>

                <section id="s3" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 3</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Pendaftaran Akaun & Pengesahan</h2>
                  </div>
                  <p>Akaun boleh dicipta melalui emel atau media sosial. Sesetengah ciri memerlukan pengesahan OTP telefon dan verifikasi MyKad untuk status <strong>"Verified"</strong> atau <strong>"Activist"</strong>.</p>
                </section>

                <section id="s4" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 4</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Wallet, Top-up & Pembayaran</h2>
                  </div>
                  <p>Wallet DNA63 adalah sistem baki tertutup (closed-loop). Top-up dilakukan melalui ToyyibPay. Baki wallet <strong>tidak boleh dikembalikan</strong> sebagai tunai dan tidak boleh dikeluarkan ke akaun bank.</p>
                </section>

                <section id="s5" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 5</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Perkhidmatan Rider & Penghantaran</h2>
                  </div>
                  <p>Rider adalah kontraktor bebas, bukan pekerja DNA63. DNA63 menyediakan platform padanan sahaja. Sebarang kerosakan semasa penghantaran adalah tanggungjawab rider berkenaan.</p>
                </section>

                <section id="s6" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 6</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Marketplace Vendor</h2>
                  </div>
                  <p>Vendor bertanggungjawab sepenuhnya terhadap kualiti produk dan pematuhan undang-undang. DNA63 bertindak sebagai pengantara dan bukan penjual rekod.</p>
                </section>

                <section id="s7" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 7</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Sistem Aduan Awam</h2>
                  </div>
                  <p>DNA63 membolehkan pelaporan isu infrastruktur kepada wakil rakyat. Kami tidak menjamin tindakan akan diambil oleh pihak berkuasa.</p>
                </section>

                <section id="s8" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 8</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Kelakuan Pengguna Dilarang</h2>
                  </div>
                  <p>Dilarang menyalahgunakan sistem OTP, memberikan maklumat palsu, atau mengganggu pengguna lain. Penipuan rujukan atau ganjaran boleh menyebabkan penggantungan akaun.</p>
                </section>

                <section id="s9" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 9</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Rujukan, XP & Ganjaran</h2>
                  </div>
                  <p>Mata XP tidak mempunyai nilai tunai. DNA63 berhak membatalkan XP jika dikesan penyalahgunaan sistem rujukan.</p>
                </section>

                <section id="s10" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 10</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Hak Milik Intelek</h2>
                  </div>
                  <p>Semua kandungan, logo, dan reka bentuk adalah hak milik Kelab Kembara Sabah. Pengguna dilarang melakukan reverse engineering terhadap Aplikasi.</p>
                </section>

                <section id="s11" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 11</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Penggantungan & Penamatan</h2>
                  </div>
                  <p>DNA63 berhak menamatkan akaun yang melanggar terma. Pengguna boleh menutup akaun sendiri melalui tetapan aplikasi.</p>
                </section>

                <section id="s12" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 12</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Had Liabiliti & Penafian</h2>
                  </div>
                  <p>DNA63 tidak bertanggungjawab atas kerugian tidak langsung atau gangguan perkhidmatan oleh pihak ketiga.</p>
                </section>

                <section id="s13" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 13</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Indemnifikasi</h2>
                  </div>
                  <p>Anda bersetuju menanggung rugi DNA63 atas sebarang tuntutan yang timbul akibat penyalahgunaan aplikasi oleh anda.</p>
                </section>

                <section id="s14" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 14</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Force Majeure</h2>
                  </div>
                  <p>DNA63 tidak bertanggungjawab atas kegagalan perkhidmatan akibat bencana alam atau faktor luar kawalan munasabah.</p>
                </section>

                <section id="s15" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 15</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Definisi Istilah</h2>
                  </div>
                  <p>Aplikasi merujuk kepada platform DNA63. "Kami" merujuk kepada Kelab Kembara Sabah. Wallet merujuk kepada baki closed-loop dalam aplikasi.</p>
                </section>

                <section id="s16" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 16</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Undang-undang Terpakai</h2>
                  </div>
                  <p>Terma ini ditadbir oleh undang-undang Malaysia. Sebarang pertikaian akan tertakluk kepada mahkamah di Negeri Sabah.</p>
                </section>

                <section id="s17" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 17</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Peruntukan Am</h2>
                  </div>
                  <p>Terma ini adalah keseluruhan perjanjian. Jika ada bahagian yang tidak sah, bahagian lain tetap berkuat kuasa.</p>
                </section>

                <section id="s18" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 18</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Perubahan Terma</h2>
                  </div>
                  <p>DNA63 boleh mengemas kini Terma ini dengan notis 7 hari sebelum berkuat kuasa untuk perubahan material.</p>
                </section>

                <section id="s19" className="space-y-6 pt-12 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="bg-sabah-blue/10 text-sabah-blue px-3 py-1 rounded-lg font-mono text-sm font-bold">§ 19</span>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Hubungi Kami</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      <p className="text-gray-500 mb-1 font-bold uppercase text-[10px]">Sokongan & Aduan</p>
                      <p className="text-sabah-blue font-bold">kelabkembarasabah@gmail.com</p>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      <p className="text-gray-500 mb-1 font-bold uppercase text-[10px]">Teknikal & Pembangun</p>
                      <p className="text-sabah-blue font-bold">rhinoresourceshq@gmail.com</p>
                    </div>
                  </div>
                </section>
              </div>

              <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-center">
                &copy; 2026 DNA63 Community. Diuruskan oleh Kelab Kembara Sabah. Semua hak terpelihara.
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
