# DNA63 Landing Page - Platform Literasi Hak Sabah 🌊

DNA63 adalah platform digital pertama yang memfokuskan kepada literasi undang-undang Perjanjian Malaysia 1963 (MA63) dan Perlembagaan Persekutuan menerusi pendekatan teknologi dan naratif sejarah yang sahih.

![DNA63 Banner](/images/logo_dna63.png)

## 🚀 Ciri-Ciri Utama

- **Tanya DNA63 (AI Chat)**: Pembantu AI pintar yang menggunakan teknologi **RAG (Retrieval-Augmented Generation)** untuk menjawab persoalan sejarah MA63 berdasarkan fakta kajian Saudara Irwan Idris.
- **Gedung Ilmu DNA63**: Katalog trilogi buku pembongkaran sejarah Sabah:
  - **VETO (2025)**: Rundingan awal MA63 & Laporan Cobbold.
  - **KENDADU (2024)**: Perubahan hak Sabah & Ordinan Darurat 1969.
  - **MA63 THE CONSTITUTION (2023)**: Bedah tuntas Annex A Perjanjian Malaysia.
- **Eksklusif Pop-up**: Info naskhah Limited Edition "Surat Dari London".
- **Multi-Platform**: Pautan muat turun aplikasi Android (Beta) dan akses portal web.

## 🛠️ Arkitektur Teknologi

Laman web ini dibina menggunakan *stack* moden untuk kelajuan dan kestabilan tinggi:

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router & SSR).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) dengan tema warna bendera Sabah 1963.
- **Animasi**: [Framer Motion](https://www.framer.com/motion/).
- **AI Engine**: [Groq AI](https://groq.com/) (Model Llama 3.3 70B) untuk respon sepantas kilat.
- **Backend/DB**: [Firebase](https://firebase.google.com/) (Firestore & App Hosting).

## 💻 Pembangunan Tempatan

1. **Clone repository:**
   ```bash
   git clone https://github.com/irwanidris/dna63-landing.git
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
   ... (ikut konfigurasi firebase anda)
   ```

4. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

Projek ini dihoskan secara rasmi menggunakan **Firebase App Hosting** yang dihubungkan terus ke cawangan `main` di GitHub untuk proses *Continuous Deployment*.

---
© 2026 DNA63. Diusahakan oleh Saudara Irwan Idris.
