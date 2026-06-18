import Head from 'next/head'
import Link from 'next/link'

export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-8">
      <Head>
        <title>Pemadaman Akaun | DNA63</title>
      </Head>
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
        <Link href="/" className="text-sabah-blue font-bold mb-8 inline-block">&larr; Kembali ke Utama</Link>
        <h1 className="text-4xl font-bold mb-6 text-gray-900 text-left">Permohonan Pemadaman Akaun</h1>

        <div className="text-left text-gray-700 space-y-6">
          <p>Jika anda ingin memadamkan akaun DNA63 anda dan semua data yang berkaitan, sila ikut langkah di bawah:</p>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold mb-2">Cara 1: Melalui Aplikasi</h3>
            <p className="text-sm">Buka aplikasi DNA63 &gt; Profil &gt; Tetapan &gt; Padam Akaun.</p>
          </div>

          <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
            <h3 className="font-bold mb-2">Cara 2: Melalui Emel</h3>
            <p className="text-sm">Hantar emel ke <strong>support@dna63.com</strong> dengan subjek "Padam Akaun" berserta alamat emel berdaftar anda. Pasukan kami akan memproses dalam masa 3 hari bekerja.</p>
          </div>

          <p className="text-xs text-gray-500 italic mt-8">Nota: Sebaik sahaja akaun dipadamkan, semua data termasuk status verifikasi dan akses buku digital akan dibuang secara kekal.</p>
        </div>
      </div>
    </div>
  )
}
