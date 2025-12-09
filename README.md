# Tes Frekuensi Kosakata Jepang (JP Vocab Test)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css)

Aplikasi web modern untuk mengukur **jangkauan kosakata pasif bahasa Jepang** Anda secara akurat menggunakan data frekuensi korpus BCCWJ.

🔗 **[Live Demo](https://jp-vocab-test.vercel.app)** *(Jangan lupa update link ini nanti)*

## 📖 Tentang Proyek

Aplikasi ini menggunakan algoritma adaptif cerdas untuk mengestimasi ukuran kosakata bahasa Jepang Anda. Berbeda dengan tes JLPT biasa, sistem ini menguji berdasarkan lapisan frekuensi kata dari **BCCWJ (Balanced Corpus of Contemporary Written Japanese)**, memberikan gambaran nyata tentang kemampuan literasi Anda.

## ✨ Fitur Utama

*   **⚡ Smart Adaptive Testing**: Level kesulitan menyesuaikan secara otomatis dan berhenti saat mencapai batas kemampuan pengguna.
*   **📚 Data Valid**: Menggunakan data frekuensi dari 70.000 kata teratas di korpus BCCWJ.
*   **📊 Analisis Visual Mendalam**:
    *   **Radar Chart JLPT**: Estimasi kekuatan per level (N5-N1).
    *   **Density Map**: Visualisasi kepadatan pengetahuan di setiap zona frekuensi.
*   **🏎️ Performa Tinggi**: Dibangun dengan React 18, Vite, dan strategi *prefetching* (ref & queue) untuk interaksi instan tanpa loading.
*   **📱 Responsif Penuh**: Tampilan optimal di Mobile dan Desktop.

## 🛠️ Teknologi

*   **Frontend**: React 18, TypeScript
*   **Styling**: Tailwind CSS
*   **Build Tool**: Vite
*   **Data**: Supabase (REST API)

## 🚀 Cara Menjalankan (Development)

Pastikan Anda sudah menginstall [Node.js](https://nodejs.org/).

1.  **Clone Repositori**
    ```bash
    git clone https://github.com/philia-space/jp-vocab-test.git
    cd jp-vocab-test
    ```

2.  **Install Dependensi**
    ```bash
    npm install
    ```

3.  **Jalankan Server Lokal**
    ```bash
    npm run dev
    ```
    Buka `http://localhost:5173` di browser Anda.

## 📂 Struktur Proyek

```
src/
├── components/     # Komponen UI (Card, Charts, Views)
├── services/       # Logika API (Fetch, Retry, Timeout)
├── constants.ts    # Konfigurasi Band & Parameter Tes
├── types.ts        # Definisi TypeScript Interfaces
└── App.tsx         # Logic Utama & State Management
```

## 🤝 Berkontribusi

Kontribusi sangat diterima! Silakan fork repositori ini dan buat Pull Request.

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT.

## 💖 Kredit

Dibuat dengan ❤️ oleh **[Philia Space Community](https://philiaspace.my.id/)**.
