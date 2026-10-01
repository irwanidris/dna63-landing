import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '../lib/firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

const INTEREST_LABELS = {
  community: 'Community',
  runner: 'Runner',
  vendor: 'Vendor',
}

export default function AdminTesters() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [testers, setTesters] = useState([])
  const [loading, setLoading] = useState(false)

  const ADMIN_PASSWORD = 'DNA63ADMIN2026'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchTesters()
    } else {
      alert('Kata laluan salah!')
    }
  }

  const fetchTesters = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "beta_testers"), orderBy("timestamp", "desc"))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTesters(data)
    } catch (error) {
      console.error("Error fetching testers:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login | DNA63</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark p-6 font-sans">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 relative overflow-hidden">
            {/* Flag bar decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex w-full">
              <div className="h-full w-1/3 bg-sabah-blue"></div>
              <div className="h-full w-1/3 bg-sabah-red"></div>
              <div className="h-full w-1/3 bg-sabah-yellow"></div>
            </div>

            <div className="flex flex-col items-center mb-8 pt-4">
              <div className="w-20 h-20 bg-sabah-blue/10 rounded-3xl flex items-center justify-center mb-6 border border-sabah-blue/10">
                <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={48} height={48} className="object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-light">Admin DNA63</h1>
              <p className="text-sm text-gray-500 mt-2 text-center">Akses terhad untuk pengurusan data Penguji Beta.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Masukkan Kata Laluan"
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue text-black dark:text-white transition-all placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="w-full py-4 bg-sabah-blue text-white rounded-2xl font-bold shadow-lg shadow-sabah-blue/30 hover:bg-sabah-red transition-all flex items-center justify-center gap-2">
                Log Masuk <span>&rarr;</span>
              </button>
            </form>
            <Link href="/" className="block text-center mt-8 text-sm text-gray-400 hover:text-sabah-blue transition-colors font-medium">&larr; Balik ke Laman Utama</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Senarai Beta Testers | Admin DNA63</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light font-sans">
        {/* Navigation Bar */}
        <nav className="w-full px-8 py-6 flex items-center justify-between font-medium bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={40} height={40} className="object-contain" />
            DNA63<span className="text-sabah-red">.</span> Admin
          </div>
          <div className="hidden md:flex items-center space-x-7">
            <Link href="/" className="hover:text-sabah-blue transition-colors">Lihat Web Utama</Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sabah-red font-bold hover:underline"
            >
              Log Keluar
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <p className="text-sabah-blue font-bold text-xs tracking-widest uppercase mb-2">Panel Kawalan</p>
              <h1 className="text-4xl md:text-5xl font-bold">Penguji Beta <span className="text-sabah-blue/50">({testers.length})</span></h1>
            </div>

            <button
              onClick={() => {
                const emails = testers.map(t => t.email).join(', ')
                navigator.clipboard.writeText(emails)
                alert('Semua emel berjaya disalin ke papan keratan!')
              }}
              className="px-8 py-4 bg-sabah-blue text-white rounded-2xl font-bold shadow-xl shadow-sabah-blue/20 hover:scale-105 transition-all flex items-center gap-3 border border-white/10"
            >
              <span>📋</span> Salin Semua Emel
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
               <div className="animate-spin rounded-full h-14 w-14 border-4 border-sabah-blue border-t-transparent mb-6"></div>
               <p className="text-gray-500 font-medium">Menghubungi Firebase...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                      <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Nama Pengguna</th>
                      <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Alamat Emel</th>
                      <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Minat Utama</th>
                      <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Tarikh Daftar</th>
                      <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-gray-400 font-black text-right">ID Rujukan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {testers.map((tester) => (
                      <tr key={tester.id} className="hover:bg-sabah-blue/[0.02] dark:hover:bg-sabah-blue/[0.05] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-bold text-gray-900 dark:text-light group-hover:text-sabah-blue transition-colors">{tester.name}</div>
                        </td>
                        <td className="px-8 py-6 text-gray-600 dark:text-gray-400 font-medium">{tester.email}</td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-1.5 rounded-full bg-sabah-blue/10 text-sabah-blue text-[10px] font-black uppercase tracking-wider border border-sabah-blue/10">
                            {INTEREST_LABELS[tester.interest] || tester.interest || 'community'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-400">
                          {tester.timestamp?.toDate().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-[10px] font-mono bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg text-gray-500 border border-gray-100 dark:border-gray-700">
                            {tester.referralId || 'DIRECT'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {testers.length === 0 && (
                  <div className="p-32 text-center">
                    <div className="text-6xl mb-6 opacity-20">📂</div>
                    <p className="text-gray-400 italic font-medium">Tiada penguji beta dijumpai dalam sistem.</p>
                  </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="w-full px-8 py-12 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center mt-20">
          <p className="text-gray-500 text-center mb-4">© 2026 DNA63 Admin Panel. Pengurusan Data Komuniti Sabah.</p>
          <div className="flex space-x-6 text-sm">
            <Link href="/" className="hover:text-sabah-blue">Web Utama</Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">Pangkalan Data: Cloud Firestore</span>
          </div>
        </footer>
      </main>
    </>
  )
}
