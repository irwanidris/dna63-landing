import Head from 'next/head'
import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-8">
      <Head>
        <title>Dasar Privasi | DNA63</title>
      </Head>
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <Link href="/" className="text-sabah-blue font-bold mb-8 inline-block">&larr; Kembali ke Utama</Link>
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Dasar Privasi DNA63</h1>
        <p className="text-gray-500 mb-8 text-sm">Terakhir dikemaskini: 9 Jun 2026</p>

        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-800">1. Pengenalan</h2>
            <p>DNA63 menghormati privasi anda. Dasar ini menerangkan cara kami mengumpul dan menggunakan maklumat anda dalam aplikasi DNA63.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">2. Maklumat yang Dikumpul</h2>
            <p>Kami mengumpul maklumat asas seperti nama dan emel untuk tujuan pendaftaran ahli dan verifikasi status aktivis.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">3. Keselamatan Data</h2>
            <p>Semua data anda disimpan dengan selamat menggunakan infrastruktur Google Firebase dengan enkripsi standard industri.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">4. Hubungi Kami</h2>
            <p>Jika anda mempunyai soalan mengenai privasi, sila hubungi kami di support@dna63.com.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
