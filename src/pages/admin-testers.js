import { useState, useEffect } from 'react'
import Head from 'next/head'
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

  // Gantikan 'DNA63ADMIN2026' dengan password pilihan anda
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-sabah-blue">Admin DNA63</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Masukkan Kata Laluan Admin"
              className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sabah-blue text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full py-3 bg-sabah-blue text-white rounded-xl font-bold">Masuk</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>Senarai Beta Testers | Admin</title></Head>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Senarai Penguji Beta ({testers.length})</h1>
          <button
            onClick={() => {
              const emails = testers.map(t => t.email).join(', ')
              navigator.clipboard.writeText(emails)
              alert('Semua emel berjaya disalin!')
            }}
            className="px-6 py-2 bg-sabah-red text-white rounded-lg font-bold shadow-lg"
          >
            Salin Semua Emel (Format Google Play)
          </button>
        </div>

        {loading ? (
          <p>Memuatkan data...</p>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Emel</th>
                  <th className="px-6 py-4">Minat</th>
                  <th className="px-6 py-4">Tarikh Daftar</th>
                  <th className="px-6 py-4">Referral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {testers.map((tester) => (
                  <tr key={tester.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{tester.name}</td>
                    <td className="px-6 py-4">{tester.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold uppercase">
                        {INTEREST_LABELS[tester.interest] || tester.interest || 'community'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tester.timestamp?.toDate().toLocaleDateString('ms-MY')}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono bg-blue-50 text-blue-700">{tester.referralId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
