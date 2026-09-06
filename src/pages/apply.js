import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../lib/firebase'

const RUNNER_PHOTO_TYPES = [
  { key: 'ic_front', label: 'MyKad (Depan)' },
  { key: 'ic_back', label: 'MyKad (Belakang)' },
  { key: 'license_front', label: 'Lesen Memandu (Depan)' },
  { key: 'license_back', label: 'Lesen Memandu (Belakang)' },
  { key: 'selfie', label: 'Selfie Bersama MyKad' },
  { key: 'avatar_passport', label: 'Foto Avatar (Passport Style)' },
  { key: 'roadtax', label: 'Cukai Jalan (Roadtax)' },
  { key: 'insurance', label: 'Polisi Insurans (Cover Note)' },
  { key: 'vehicle_photo', label: 'Gambar Kenderaan (Nampak No. Plat)' },
  { key: 'payment_qr', label: 'Kod QR DuitNow (Untuk Gaji)' },
]

const DAYS = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad']

const PACKAGES = [
  { key: 'pakej1', title: 'Pakej 1: Program Cop Digital', amount: 120, subtext: 'RM 10 x 12 Bulan (Pendaftaran Basic)' },
  { key: 'pakej2', title: 'Pakej 2: Menu Digital & Katalog', amount: 240, subtext: 'RM 20 x 12 Bulan' },
  { key: 'pakej3', title: 'Pakej 3: Marketing & Broadcast', amount: 360, subtext: 'RM 30 x 12 Bulan' },
]

const VERIFIED_TNC_TEXT = `TERMA DAN SYARAT VERIFIKASI PROFIL RASMI DNA63 & KEAHLIAN KELAB KEMBARA SABAH

1. TUJUAN VERIFIKASI
Proses Verifikasi Profil Rasmi bertujuan untuk mengesahkan identiti digital pengguna bagi menjamin integriti, keselamatan, dan keaslian interaksi di dalam ekosistem aplikasi DNA63.

2. PENGUMPULAN DAN KERAHSIAAN DATA (PDPA)
2.1. Dengan mengemukakan permohonan ini, anda bersetuju untuk memberikan maklumat peribadi yang sahih termasuk Nama Penuh, Nombor MyKad/Passport, dan Imej MyKad/Passport.
2.2. DNA63 komited untuk melindungi privasi anda. Maklumat sensitif (Nombor dan Imej MyKad/Passport) hanya digunakan untuk tujuan pengesahan identiti oleh pihak pentadbir dan tidak akan dikongsi, dipaparkan kepada umum, atau dijual kepada mana-mana pihak ketiga.
2.3. Segala data disimpan menggunakan sistem storan awan yang disulitkan (encrypted) bagi mencegah capaian tanpa kebenaran.

3. YURAN PEMPROSESAN DAN KEAHLIAN
3.1. Permohonan verifikasi ini merangkumi pendaftaran keahlian rasmi Kelab Kembara Sabah (PPM-020-12-22022019).
3.2. Caj pemprosesan dan yuran keahlian tahun pertama adalah berjumlah RM 50.00.
3.3. Keahlian ini perlu diperbaharui pada tahun berikutnya dengan kadar sumbangan tahunan sebanyak RM 10.00 bagi mengekalkan status 'Verified' dan akses eksklusif aplikasi.
3.4. Segala pembayaran yang telah dibuat adalah tidak dikembalikan (non-refundable) sekiranya permohonan ditolak atas faktor maklumat tidak sahih atau dokumen kabur.

4. AKSES DAN KELEBIHAN
4.1. Status 'Verified' memberikan akses penuh kepada ciri-ciri premium di dalam aplikasi DNA63.
4.2. Ahli yang disahkan layak untuk menyertai Bengkel Activist DNA63 yang dijalankan secara tertutup dan eksklusif.

5. PERAKUAN PENGGUNA
Saya dengan ini mengaku bahawa segala maklumat dan dokumen yang dikemukakan adalah benar dan milik saya sendiri. Saya memahami bahawa sebarang pemalsuan maklumat boleh menyebabkan akaun saya disekat serta-merta tanpa sebarang bayaran balik.`

function defaultBusinessHours() {
  const hours = {}
  DAYS.forEach((d) => {
    hours[d] = { isOpen: true, open: '08:00', close: '22:00' }
  })
  return hours
}

function formatPhoneE164(input) {
  const p = input.trim().replace(/[\s-]/g, '')
  if (p.startsWith('0')) return '+6' + p
  if (!p.startsWith('+')) return '+60' + p
  return p
}

function compressImage(file, maxWidth = 1280, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function SectionTitle({ children }) {
  return <h3 className="text-xs font-black uppercase tracking-widest text-sabah-blue mb-3 mt-6 first:mt-0">{children}</h3>
}

function TextField({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-sabah-blue text-sm text-black dark:text-white"
      />
    </div>
  )
}

function PhotoField({ label, value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      <div className={`rounded-xl border-2 border-dashed p-4 text-center ${value ? 'border-sabah-green' : 'border-gray-200 dark:border-gray-700'}`}>
        {value && <img src={value} alt={label} className="mx-auto mb-2 max-h-32 rounded-lg object-cover" />}
        <input type="file" accept="image/*" onChange={onChange} className="text-xs w-full" />
      </div>
    </div>
  )
}

function CheckField({ label, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 mb-3 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-1 shrink-0" />
      <span>{label}</span>
    </label>
  )
}

export default function Apply() {
  const router = useRouter()
  const [step, setStep] = useState('role') // role | otp | form | success
  const [role, setRole] = useState(null) // 'runner' | 'vendor'
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [idToken, setIdToken] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [applicationId, setApplicationId] = useState(null)

  const recaptchaRef = useRef(null)

  const [runnerForm, setRunnerForm] = useState({
    fullName: '', icNumber: '', emergencyName: '', emergencyPhone: '',
    vehiclePlate: '', vehicleModel: '', parlimen: '', dun: '',
    bankName: '', bankAccountNumber: '', bankHolderName: '',
    licenseExpiryDate: '', roadtaxExpiryDate: '', insuranceExpiryDate: '',
    hasNoCriminalRecord: false, isFitToWork: false, agreedToTerms: false,
  })
  const [runnerPhotos, setRunnerPhotos] = useState({})

  const [vendorForm, setVendorForm] = useState({
    businessName: '', description: '', whatsapp: '', ssmNumber: '',
    category: 'Barista Coffee', address: '', lat: '', lng: '',
    selectedPackage: 'pakej1', paymentDate: '', paymentTime: '', pin: '',
    businessHours: defaultBusinessHours(),
    idType: 'mykad', mykadName: '', icNumber: '', passportCountry: '',
    verifiedPaymentDate: '', verifiedPaymentTime: '', agreedToVerifiedTerms: false,
  })
  const [vendorPhotos, setVendorPhotos] = useState({})
  const [hasScrolledTnc, setHasScrolledTnc] = useState(false)

  useEffect(() => {
    return () => {
      try {
        recaptchaRef.current?.clear()
      } catch {
        // ignore cleanup errors
      }
    }
  }, [])

  useEffect(() => {
    if (!router.isReady) return
    const queryRole = router.query.role
    if ((queryRole === 'runner' || queryRole === 'vendor') && step === 'role') {
      setRole(queryRole)
      setStep('otp')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.role])

  const updateRunner = (key, value) => setRunnerForm((f) => ({ ...f, [key]: value }))
  const updateRunnerPhoto = (key) => async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImage(file)
      setRunnerPhotos((prev) => ({ ...prev, [key]: dataUrl }))
    } catch {
      setError('Gagal memproses imej. Sila cuba gambar lain.')
    }
  }

  const updateVendor = (key, value) => setVendorForm((f) => ({ ...f, [key]: value }))
  const updateVendorPhoto = (key) => async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImage(file)
      setVendorPhotos((prev) => ({ ...prev, [key]: dataUrl }))
    } catch {
      setError('Gagal memproses imej. Sila cuba gambar lain.')
    }
  }
  const updateBusinessHour = (day, key, value) =>
    setVendorForm((f) => ({ ...f, businessHours: { ...f.businessHours, [day]: { ...f.businessHours[day], [key]: value } } }))

  function useCurrentLocation() {
    setError('')
    if (!navigator.geolocation) {
      setError('Peranti tidak menyokong lokasi GPS.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateVendor('lat', pos.coords.latitude.toFixed(6))
        updateVendor('lng', pos.coords.longitude.toFixed(6))
      },
      () => setError('Gagal mendapatkan lokasi. Sila benarkan akses lokasi pada pelayar.')
    )
  }

  async function handleSendOtp() {
    setError('')
    if (!phone.trim()) {
      setError('Sila masukkan no. telefon dahulu.')
      return
    }
    setBusy(true)
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      }
      const result = await signInWithPhoneNumber(auth, formatPhoneE164(phone), recaptchaRef.current)
      setConfirmationResult(result)
      setOtpSent(true)
    } catch (err) {
      console.error(err)
      setError('Gagal menghantar OTP. Sila semak nombor telefon dan cuba lagi.')
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyOtp() {
    setError('')
    if (otpCode.trim().length < 6) {
      setError('Sila masukkan kod 6-digit yang lengkap.')
      return
    }
    setBusy(true)
    try {
      const cred = await confirmationResult.confirm(otpCode.trim())
      const token = await cred.user.getIdToken()
      setIdToken(token)
      setStep('form')
    } catch (err) {
      console.error(err)
      setError('Kod OTP salah atau tamat tempoh.')
    } finally {
      setBusy(false)
    }
  }

  async function submitRunner() {
    setError('')
    if (!runnerForm.hasNoCriminalRecord || !runnerForm.isFitToWork || !runnerForm.agreedToTerms) {
      setError('Sila sahkan semua akuan & terma perkhidmatan.')
      return
    }
    const missingPhoto = RUNNER_PHOTO_TYPES.find((p) => !runnerPhotos[p.key])
    if (missingPhoto) {
      setError(`Sila muat naik: ${missingPhoto.label}`)
      return
    }
    if (!runnerForm.licenseExpiryDate || !runnerForm.roadtaxExpiryDate || !runnerForm.insuranceExpiryDate) {
      setError('Sila tetapkan semua tarikh luput dokumen.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/apply/runner', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...runnerForm,
          vehicleType: 'Motorcycle',
          phone: formatPhoneE164(phone),
          photos: runnerPhotos,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ralat menghantar permohonan.')
      setApplicationId(data.applicationId)
      setStep('success')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function submitVendor() {
    setError('')
    if (!vendorForm.address.trim() || !vendorForm.lat || !vendorForm.lng) {
      setError('Sila lengkapkan lokasi gerai/premis anda.')
      return
    }
    if (!vendorPhotos.shopPhoto) {
      setError('Sila muat naik gambar premis/gerai anda.')
      return
    }
    if (!vendorPhotos.resitPhoto) {
      setError('Sila muat naik resit pembayaran langganan.')
      return
    }
    if (vendorForm.pin.trim().length < 6) {
      setError('PIN mestilah 6-digit.')
      return
    }
    if (!vendorForm.paymentDate || !vendorForm.paymentTime) {
      setError('Sila isi tarikh & masa bayaran.')
      return
    }
    if (!vendorForm.mykadName.trim() || !vendorForm.icNumber.trim()) {
      setError('Sila lengkapkan nama dan no. dokumen (ikut MyKad/Passport).')
      return
    }
    if (vendorForm.idType === 'passport' && !vendorForm.passportCountry.trim()) {
      setError('Sila isi Negara Pengeluar Passport.')
      return
    }
    if (!vendorPhotos.mykadPhoto) {
      setError(`Sila muat naik gambar ${vendorForm.idType === 'passport' ? 'Passport' : 'MyKad'}.`)
      return
    }
    if (!vendorForm.verifiedPaymentDate || !vendorForm.verifiedPaymentTime) {
      setError('Sila isi tarikh & masa bayaran Verified (RM50).')
      return
    }
    if (!vendorPhotos.verifiedResitPhoto) {
      setError('Sila muat naik resit bayaran Verified (RM50).')
      return
    }
    if (!vendorForm.agreedToVerifiedTerms) {
      setError('Sila bersetuju dengan Terma & Syarat Verifikasi.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/apply/vendor', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vendorForm, photos: vendorPhotos }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ralat menghantar permohonan.')
      setApplicationId(data.applicationId)
      setStep('success')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Head>
        <title>Mohon Jadi Runner / Vendor | DNA63</title>
        <meta name="description" content="Borang permohonan awam untuk Runner dan Vendor DNA63 - tiada akaun app diperlukan." />
      </Head>

      <main className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light font-sans">
        <nav className="w-full px-8 py-6 flex items-center justify-between font-medium bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-sabah-blue/10">
          <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Image src="/images/logo_dna63.png" alt="DNA63 Logo" width={40} height={40} className="object-contain" />
            DNA63<span className="text-sabah-red">.</span>
          </Link>
          <Link href="/" className="text-sm hover:text-sabah-blue transition-colors">&larr; Balik ke Laman Utama</Link>
        </nav>

        <div id="recaptcha-container" />

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
          {step === 'role' && (
            <>
              <div className="text-center mb-12">
                <p className="text-sabah-blue font-bold text-xs tracking-widest uppercase mb-2">Permohonan Awam</p>
                <h1 className="text-4xl md:text-5xl font-bold">Sertai DNA63</h1>
                <p className="text-gray-500 mt-4">Pilih peranan yang anda ingin mohon. Tiada akaun app sedia ada diperlukan.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => { setRole('runner'); setStep('otp') }}
                  className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 text-left hover:scale-[1.02] transition-all"
                >
                  <div className="text-5xl mb-4">🏍️</div>
                  <h2 className="text-2xl font-bold mb-2">Runner</h2>
                  <p className="text-gray-500 text-sm">Mohon menjadi Runner penghantaran komuniti DNA63.</p>
                </button>
                <button
                  onClick={() => { setRole('vendor'); setStep('otp') }}
                  className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 text-left hover:scale-[1.02] transition-all"
                >
                  <div className="text-5xl mb-4">🏪</div>
                  <h2 className="text-2xl font-bold mb-2">Vendor</h2>
                  <p className="text-gray-500 text-sm">Daftarkan perniagaan anda sebagai Vendor DNA63.</p>
                </button>
              </div>
            </>
          )}

          {step === 'otp' && (
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-2">Sahkan No. Telefon</h2>
              <p className="text-gray-500 text-sm mb-6">Kami akan menghantar kod pengesahan melalui SMS.</p>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
              {!otpSent ? (
                <>
                  <TextField label="No. Telefon" type="tel" placeholder="cth: 0123456789" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <button onClick={handleSendOtp} disabled={busy} className="w-full py-4 bg-sabah-blue text-white rounded-2xl font-bold disabled:opacity-50">
                    {busy ? 'Menghantar...' : 'Hantar Kod OTP'}
                  </button>
                </>
              ) : (
                <>
                  <TextField
                    label="Kod OTP (6-digit)"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                  <button onClick={handleVerifyOtp} disabled={busy} className="w-full py-4 bg-sabah-blue text-white rounded-2xl font-bold disabled:opacity-50 mb-3">
                    {busy ? 'Mengesahkan...' : 'Sahkan Kod'}
                  </button>
                  <button onClick={handleSendOtp} disabled={busy} className="w-full py-2 text-sabah-blue text-sm font-bold">
                    Hantar Semula OTP
                  </button>
                </>
              )}
              <button
                onClick={() => { setStep('role'); setOtpSent(false); setOtpCode(''); setError('') }}
                className="block mx-auto mt-6 text-sm text-gray-400"
              >
                &larr; Tukar peranan
              </button>
            </div>
          )}

          {step === 'form' && role === 'runner' && (
            <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6">Borang Permohonan Runner</h2>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

              <SectionTitle>Maklumat Peribadi & Waris</SectionTitle>
              <TextField label="Nama Penuh (Seperti MyKad)" value={runnerForm.fullName} onChange={(e) => updateRunner('fullName', e.target.value)} />
              <TextField label="No. Kad Pengenalan" value={runnerForm.icNumber} onChange={(e) => updateRunner('icNumber', e.target.value)} />
              <TextField label="Nama Waris / Kenalan Kecemasan" value={runnerForm.emergencyName} onChange={(e) => updateRunner('emergencyName', e.target.value)} />
              <TextField label="No. Telefon Waris" type="tel" value={runnerForm.emergencyPhone} onChange={(e) => updateRunner('emergencyPhone', e.target.value)} />

              <SectionTitle>Kenderaan & Kawasan (Motosikal Sahaja Buat Masa Ini)</SectionTitle>
              <TextField label="Model Kenderaan (cth: Yamaha Y15)" value={runnerForm.vehicleModel} onChange={(e) => updateRunner('vehicleModel', e.target.value)} />
              <TextField label="No. Plat Kenderaan" value={runnerForm.vehiclePlate} onChange={(e) => updateRunner('vehiclePlate', e.target.value)} />
              <TextField label="Kawasan Parlimen" value={runnerForm.parlimen} onChange={(e) => updateRunner('parlimen', e.target.value)} />
              <TextField label="Kawasan DUN" value={runnerForm.dun} onChange={(e) => updateRunner('dun', e.target.value)} />
              <PhotoField label="Gambar Kenderaan (Nampak No. Plat)" value={runnerPhotos.vehicle_photo} onChange={updateRunnerPhoto('vehicle_photo')} />

              <SectionTitle>Dokumen Identiti</SectionTitle>
              <PhotoField label="MyKad (Depan)" value={runnerPhotos.ic_front} onChange={updateRunnerPhoto('ic_front')} />
              <PhotoField label="MyKad (Belakang)" value={runnerPhotos.ic_back} onChange={updateRunnerPhoto('ic_back')} />
              <TextField label="Tarikh Luput Lesen" type="date" value={runnerForm.licenseExpiryDate} onChange={(e) => updateRunner('licenseExpiryDate', e.target.value)} />
              <PhotoField label="Lesen Memandu (Depan)" value={runnerPhotos.license_front} onChange={updateRunnerPhoto('license_front')} />
              <PhotoField label="Lesen Memandu (Belakang)" value={runnerPhotos.license_back} onChange={updateRunnerPhoto('license_back')} />

              <SectionTitle>Keselamatan & Biometrik</SectionTitle>
              <TextField label="Tarikh Luput Roadtax" type="date" value={runnerForm.roadtaxExpiryDate} onChange={(e) => updateRunner('roadtaxExpiryDate', e.target.value)} />
              <PhotoField label="Cukai Jalan (Roadtax)" value={runnerPhotos.roadtax} onChange={updateRunnerPhoto('roadtax')} />
              <TextField label="Tarikh Luput Insurans" type="date" value={runnerForm.insuranceExpiryDate} onChange={(e) => updateRunner('insuranceExpiryDate', e.target.value)} />
              <PhotoField label="Polisi Insurans (Cover Note)" value={runnerPhotos.insurance} onChange={updateRunnerPhoto('insurance')} />
              <PhotoField label="Selfie Bersama MyKad" value={runnerPhotos.selfie} onChange={updateRunnerPhoto('selfie')} />
              <PhotoField label="Gambar Avatar (Passport Style)" value={runnerPhotos.avatar_passport} onChange={updateRunnerPhoto('avatar_passport')} />

              <SectionTitle>Perbankan & Bayaran</SectionTitle>
              <TextField label="Nama Bank (cth: Maybank, CIMB)" value={runnerForm.bankName} onChange={(e) => updateRunner('bankName', e.target.value)} />
              <TextField label="No. Akaun Bank" value={runnerForm.bankAccountNumber} onChange={(e) => updateRunner('bankAccountNumber', e.target.value)} />
              <TextField label="Nama Pemegang Akaun" value={runnerForm.bankHolderName} onChange={(e) => updateRunner('bankHolderName', e.target.value)} />
              <PhotoField label="Kod QR DuitNow / QR Bayaran" value={runnerPhotos.payment_qr} onChange={updateRunnerPhoto('payment_qr')} />

              <SectionTitle>Pengakuan & Terma</SectionTitle>
              <CheckField
                label="Saya mengesahkan tiada rekod jenayah lampau atau sedang dalam siasatan polis."
                checked={runnerForm.hasNoCriminalRecord}
                onChange={(e) => updateRunner('hasNoCriminalRecord', e.target.checked)}
              />
              <CheckField
                label="Saya mengesahkan sihat tubuh badan dan layak untuk menjalankan tugas penghantaran."
                checked={runnerForm.isFitToWork}
                onChange={(e) => updateRunner('isFitToWork', e.target.checked)}
              />
              <CheckField
                label="Saya bersetuju dengan Terma & Syarat Perkhidmatan Runner DNA63."
                checked={runnerForm.agreedToTerms}
                onChange={(e) => updateRunner('agreedToTerms', e.target.checked)}
              />

              <button onClick={submitRunner} disabled={busy} className="w-full mt-4 py-4 bg-sabah-blue text-white rounded-2xl font-bold disabled:opacity-50">
                {busy ? 'Menghantar...' : 'Hantar Permohonan'}
              </button>
            </div>
          )}

          {step === 'form' && role === 'vendor' && (
            <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6">Borang Permohonan Vendor</h2>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

              <SectionTitle>Profil Perniagaan</SectionTitle>
              <TextField label="Nama Perniagaan Vendor" value={vendorForm.businessName} onChange={(e) => updateVendor('businessName', e.target.value)} />
              <TextField label="Penerangan Ringkas Perniagaan" value={vendorForm.description} onChange={(e) => updateVendor('description', e.target.value)} />
              <TextField label="No. WhatsApp (cth: 60123456789)" type="tel" value={vendorForm.whatsapp} onChange={(e) => updateVendor('whatsapp', e.target.value)} />

              <SectionTitle>Dokumen Perniagaan</SectionTitle>
              <TextField label="No. Pendaftaran SSM (Opsyenal)" value={vendorForm.ssmNumber} onChange={(e) => updateVendor('ssmNumber', e.target.value)} />
              <PhotoField label="Gambar Premis / Booth / Gerai" value={vendorPhotos.shopPhoto} onChange={updateVendorPhoto('shopPhoto')} />
              <PhotoField label="Salinan Sijil SSM (Opsyenal)" value={vendorPhotos.ssmPhoto} onChange={updateVendorPhoto('ssmPhoto')} />

              <SectionTitle>Lokasi & Masa Operasi</SectionTitle>
              <TextField label="Alamat Gerai/Premis" value={vendorForm.address} onChange={(e) => updateVendor('address', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Latitud" value={vendorForm.lat} onChange={(e) => updateVendor('lat', e.target.value)} />
                <TextField label="Longitud" value={vendorForm.lng} onChange={(e) => updateVendor('lng', e.target.value)} />
              </div>
              <button type="button" onClick={useCurrentLocation} className="text-xs font-bold text-sabah-blue mb-4">
                📍 Guna Lokasi Semasa (GPS)
              </button>
              <div className="mb-2">
                {DAYS.map((day) => {
                  const d = vendorForm.businessHours[day]
                  return (
                    <div key={day} className="flex items-center gap-3 mb-2">
                      <span className="w-16 text-xs font-bold shrink-0">{day}</span>
                      <label className="flex items-center gap-1 text-xs shrink-0">
                        <input type="checkbox" checked={d.isOpen} onChange={(e) => updateBusinessHour(day, 'isOpen', e.target.checked)} /> Buka
                      </label>
                      {d.isOpen ? (
                        <>
                          <input type="time" value={d.open} onChange={(e) => updateBusinessHour(day, 'open', e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs" />
                          <span className="text-xs">-</span>
                          <input type="time" value={d.close} onChange={(e) => updateBusinessHour(day, 'close', e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs" />
                        </>
                      ) : (
                        <span className="text-sabah-red text-xs font-bold">TUTUP</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <SectionTitle>Maklumat Verifikasi Profil</SectionTitle>
              <p className="text-xs text-gray-500 mb-4">
                Setiap Vendor DNA63 diverifikasi sebagai ahli rasmi Kelab Kembara Sabah. Sila lengkapkan maklumat identiti dan yuran keahlian tahun pertama (RM50) di bawah.
              </p>
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => updateVendor('idType', 'mykad')}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold ${vendorForm.idType === 'mykad' ? 'border-sabah-blue bg-sabah-blue/5' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  MyKad (Malaysia)
                </button>
                <button
                  type="button"
                  onClick={() => updateVendor('idType', 'passport')}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold ${vendorForm.idType === 'passport' ? 'border-sabah-blue bg-sabah-blue/5' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  Passport (Warganegara Asing)
                </button>
              </div>
              <TextField
                label={`Nama Penuh (ikut ${vendorForm.idType === 'passport' ? 'Passport' : 'MyKad'})`}
                value={vendorForm.mykadName}
                onChange={(e) => updateVendor('mykadName', e.target.value)}
              />
              <TextField
                label={vendorForm.idType === 'passport' ? 'No. Passport' : 'No. MyKad (Tanpa Sempang)'}
                value={vendorForm.icNumber}
                onChange={(e) => updateVendor('icNumber', e.target.value)}
              />
              {vendorForm.idType === 'passport' && (
                <TextField
                  label="Negara Pengeluar Passport (cth: Indonesia)"
                  value={vendorForm.passportCountry}
                  onChange={(e) => updateVendor('passportCountry', e.target.value)}
                />
              )}
              <PhotoField
                label={vendorForm.idType === 'passport' ? 'Gambar Passport' : 'Gambar MyKad'}
                value={vendorPhotos.mykadPhoto}
                onChange={updateVendorPhoto('mykadPhoto')}
              />

              <div className="p-5 rounded-2xl bg-[#1E3A8A] text-white text-center mb-5 mt-2">
                <p className="text-amber-300 text-xs font-bold">Bayaran Verified - Yuran Keahlian Kelab Kembara Sabah (Tahun Pertama)</p>
                <p className="font-black mt-1">KELAB KEMBARA SABAH</p>
                <p className="text-amber-300 font-black tracking-wide">AFFIN BANK: 106760001638</p>
                <p className="text-sm mt-2">Jumlah Bayaran: RM 50 (Tahun Pertama)</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Tarikh Bayaran Verified" type="date" value={vendorForm.verifiedPaymentDate} onChange={(e) => updateVendor('verifiedPaymentDate', e.target.value)} />
                <TextField label="Masa Bayaran Verified" type="time" value={vendorForm.verifiedPaymentTime} onChange={(e) => updateVendor('verifiedPaymentTime', e.target.value)} />
              </div>
              <PhotoField label="Resit Bayaran Verified (RM50)" value={vendorPhotos.verifiedResitPhoto} onChange={updateVendorPhoto('verifiedResitPhoto')} />

              <p className="text-xs font-black uppercase tracking-widest text-sabah-blue mb-2 mt-4">Terma & Syarat Verifikasi</p>
              <div
                className="h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-3 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line"
                onScroll={(e) => {
                  const el = e.target
                  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setHasScrolledTnc(true)
                }}
              >
                {VERIFIED_TNC_TEXT}
              </div>
              <CheckField
                label={hasScrolledTnc ? 'Saya bersetuju dengan Terma & Syarat Verifikasi Profil di atas.' : 'Sila skrol dan baca Terma & Syarat sehingga tamat sebelum bersetuju.'}
                checked={vendorForm.agreedToVerifiedTerms}
                onChange={(e) => {
                  if (!hasScrolledTnc) {
                    setError('Sila skrol dan baca Terma & Syarat sehingga tamat sebelum bersetuju.')
                    return
                  }
                  updateVendor('agreedToVerifiedTerms', e.target.checked)
                }}
              />

              <SectionTitle>Pilihan Pakej Langganan Tahunan</SectionTitle>
              {PACKAGES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => updateVendor('selectedPackage', p.key)}
                  className={`w-full text-left p-4 mb-3 rounded-2xl border-2 transition-colors ${vendorForm.selectedPackage === p.key ? 'border-sabah-blue bg-sabah-blue/5' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{p.title}</span>
                    <span className="font-black text-sabah-blue">RM {p.amount}/thn</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{p.subtext}</p>
                </button>
              ))}

              <SectionTitle>Pembayaran & Resit</SectionTitle>
              <div className="p-5 rounded-2xl bg-[#1E3A8A] text-white text-center mb-5">
                <p className="text-amber-300 text-xs font-bold">Akaun Penerima Rasmi</p>
                <p className="font-black">KELAB KEMBARA SABAH</p>
                <p className="text-amber-300 font-black tracking-wide">AFFIN BANK: 106760001638</p>
                <p className="text-sm mt-2">
                  Jumlah Bayaran: RM {PACKAGES.find((p) => p.key === vendorForm.selectedPackage)?.amount} (Setahun)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Tarikh Bayaran" type="date" value={vendorForm.paymentDate} onChange={(e) => updateVendor('paymentDate', e.target.value)} />
                <TextField label="Masa Bayaran" type="time" value={vendorForm.paymentTime} onChange={(e) => updateVendor('paymentTime', e.target.value)} />
              </div>
              <PhotoField label="Resit Pembayaran" value={vendorPhotos.resitPhoto} onChange={updateVendorPhoto('resitPhoto')} />

              <SectionTitle>Sekuriti</SectionTitle>
              <p className="text-xs text-gray-500 mb-3">Passcode Barista digunakan untuk mengesahkan pemberian cop kepada komuniti.</p>
              <TextField label="PIN 6-Digit Baharu" type="password" inputMode="numeric" maxLength={6} value={vendorForm.pin} onChange={(e) => updateVendor('pin', e.target.value)} />

              <button onClick={submitVendor} disabled={busy} className="w-full mt-4 py-4 bg-sabah-blue text-white rounded-2xl font-bold disabled:opacity-50">
                {busy ? 'Menghantar...' : 'Hantar Permohonan'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Permohonan Dihantar</h2>
              <p className="text-gray-500 text-sm mb-2">
                Permohonan anda telah berjaya dihantar. Pihak admin akan menyemak dokumen anda dalam masa 24-48 jam.
              </p>
              <p className="text-xs text-gray-400 mb-6 font-mono">ID Rujukan: {applicationId}</p>
              <Link href="/" className="inline-block py-3 px-8 bg-sabah-blue text-white rounded-2xl font-bold">
                Kembali ke Laman Utama
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
