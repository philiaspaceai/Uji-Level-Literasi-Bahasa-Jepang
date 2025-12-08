# JP Kanji Literacy Test (Uji Literasi Jepang)

Aplikasi web interaktif untuk menguji estimasi jumlah kosakata (Vocabulary Size) bahasa Jepang, dengan fokus khusus pada **Kemampuan Membaca (Literasi)**.

Dibuat menggunakan **React**, **TypeScript**, **Vite**, dan **Tailwind CSS**.

## 🌟 Fitur Utama

- **Jukugo Filter**: Algoritma cerdas yang memprioritaskan kata majemuk Kanji (Jukugo) di level tinggi untuk meminimalisir tebakan fonetik.
- **Guillotine Scoring**: Sistem penilaian ketat yang menghentikan perhitungan level tinggi jika fondasi level menengah tidak kuat.
- **3 Mode Tes**: Cepat (100 kata), Standar (200 kata), Akurat (500 kata).
- **Responsive UI**: Tampilan Dark Mode yang indah dengan animasi halus.

## 🚀 Cara Menjalankan (Local)

1. **Clone repository ini**
   ```bash
   git clone https://github.com/username-anda/jp-vocab-test.git
   cd jp-vocab-test
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Jalankan Server Development**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser.

## 📦 Cara Deploy ke Vercel

1. Push kode ini ke repository GitHub Anda.
2. Buka [Vercel](https://vercel.com) dan buat New Project.
3. Import repository GitHub tadi.
4. Vercel akan otomatis mendeteksi framework **Vite**.
5. Klik **Deploy**.

## 🛠 Teknologi

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (via CDN untuk portabilitas tinggi)
- **Icons**: SVG Heroicons
- **Database**: Supabase (via REST API)

## 📝 Kredit

Dibuat oleh **Philia Space Community**.