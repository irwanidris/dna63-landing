# DNA63 Landing Page - Platform Sabahan untuk Sabahan 🌊

Kod sumber laman web [dna63.com](https://dna63.com): laman pendaratan aplikasi DNA63, borang permohonan awam Runner dan Vendor, ruangan berita, dan Newsroom (CMS penulis).

![DNA63 Banner](/images/logo_dna63.png)

## 🚀 Ciri-Ciri Utama

- **Laman utama (`/`)**: Pengenalan aplikasi DNA63 Community — Akademi & Kuiz MA63, Aduan Rakyat, Runner, Vendor — serta Gedung Ilmu MA63 (VETO, KENDADU, MA63 The Constitution) dan pautan muat turun aplikasi.
- **Permohonan awam (`/apply`)**: Borang Runner dan Vendor dengan pengesahan OTP telefon. Tiada akaun aplikasi diperlukan.
- **Berita (`/berita`)**: Artikel awam, dengan suapan RSS di `/feed.xml`.
- **Newsroom (`/newsroom`)**: CMS untuk penulis dan admin — tulis, edit, jadualkan terbitan, urus kategori dan jemput penulis. Log masuk dengan Google.
- **Halaman dasar**: `/privacy`, `/terms`, `/delete-account`.
- **Tanya DNA63 (`/api/chat`)**: Endpoint pembantu AI yang menjawab soalan MA63 berdasarkan pangkalan pengetahuan `src/data/dna63_framework.json`.

## 🛠️ Arkitektur Teknologi

- **Frontend**: [Next.js 15](https://nextjs.org/) dengan **Pages Router** (`src/pages/`) dan React 19.
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) dengan tema warna bendera Sabah (`src/styles/globals.css`).
- **Animasi**: [Motion](https://motion.dev/) (`motion/react`).
- **Editor artikel**: [TipTap](https://tiptap.dev/).
- **AI Engine**: [Groq](https://groq.com/) (model `llama-3.3-70b-versatile`) untuk `/api/chat`.
- **Backend/DB**: [Firebase](https://firebase.google.com/) — Auth, Firestore dan Storage melalui `firebase` (klien) dan `firebase-admin` (API routes).
- **Hosting**: Firebase Hosting dengan sokongan web frameworks (SSR dijalankan oleh Cloud Function `ssrdna63landing` di `us-central1`).

## 📁 Struktur Folder

```
src/
├── pages/
│   ├── index.js            Laman utama
│   ├── apply.js            Borang Runner / Vendor
│   ├── berita/             Senarai & halaman artikel awam
│   ├── newsroom/           CMS penulis (senarai, baharu, edit, kategori, penulis, log masuk)
│   ├── feed.xml.js         Suapan RSS
│   └── api/
│       ├── apply/          Terima permohonan Runner / Vendor
│       ├── newsroom/       Artikel, kategori, jemputan, sesi, muat naik gambar
│       └── chat.js         Tanya DNA63
├── components/             NewsLayout, NewsroomLayout, ArticleForm, RichTextEditor, ArticleEditLink
├── lib/                    articles, categories, newsroomAuth, firebase, firebaseAdmin, storageUpload
├── data/                   Pangkalan pengetahuan Tanya DNA63
└── styles/                 globals.css
public/                     Imej, ads.txt, robots.txt, sitemap.xml
firebase.json               Sasaran hosting
```

## 💻 Pembangunan Tempatan

1. **Clone repository:**
   ```bash
   git clone https://github.com/irwanidris/dna63-landing.git
   cd dna63-landing
   ```

2. **Pasang dependencies:**
   ```bash
   npm install
   ```

3. **Set Environment Variables:**
   Cipta fail `.env.local` dan masukkan:
   ```env
   GROQ_API_KEY=gsk_xxx

   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
   NEXT_PUBLIC_FIREBASE_APP_ID=xxx
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxx

   # Rahsia sekali guna untuk menjemput admin Newsroom yang pertama
   ADMIN_BOOTSTRAP_SECRET=xxx

   # Dev tempatan sahaja, jika firebase-admin tidak jumpa kelayakan secara automatik:
   # JSON penuh service account dalam satu baris
   FIREBASE_SERVICE_ACCOUNT_KEY=xxx
   ```

4. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

Laman ini di-deploy secara manual dengan Firebase CLI dari akar repo ini. `firebase.json` mentakrifkan dua sasaran hosting dalam projek Firebase `dna63-app`:

| Sasaran | Tapak Hosting | Domain |
|---|---|---|
| `landing-page` | `dna63-landing` | dna63.com |
| `app-site` | `dna63-app` | — |

Untuk deploy dna63.com:

```bash
firebase deploy --only hosting:landing-page
```

Perintah ini membina Next.js dan mengemas kini fail statik serta fungsi SSR. Push ke GitHub sahaja **tidak** mengemas kini laman.

Selepas deploy, halaman yang telah dibuka mungkin masih dicache oleh pelayar sehingga sejam; muat semula untuk melihat perubahan.

### ⚠️ Projek Firebase dikongsi

Auth, Firestore dan Storage dikongsi dengan aplikasi mudah alih DNA63. Oleh itu:

- Sentiasa deploy dengan `--only hosting:...`. Jangan jalankan `firebase deploy` tanpa penapis.
- Jangan deploy `firestore.rules` dari repo ini.
- Tambah index Firestore secara tambahan sahaja; jangan buang index sedia ada.
- Laman ini tidak menulis ke koleksi `users` (profil aplikasi). Profil Newsroom disimpan dalam `newsroomUsers`.

---
© 2026 DNA63. Diusahakan oleh Saudara Irwan Idris.
