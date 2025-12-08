import { BandConfig, TestMode } from './types';

// Refactored Bands to use Ratios instead of fixed sample sizes.
// This allows the test to scale to 100, 200, or 500 questions while maintaining distribution.

export const BANDS: BandConfig[] = [
  { id: 1, minRank: 1, maxRank: 1000, ratio: 0.10 },       // 10% - Core
  { id: 2, minRank: 1001, maxRank: 3000, ratio: 0.15 },    // 15% - Basic
  { id: 3, minRank: 3001, maxRank: 9000, ratio: 0.20 },    // 20% - Intermediate
  { id: 4, minRank: 9001, maxRank: 20000, ratio: 0.20 },   // 20% - Advanced
  { id: 5, minRank: 20001, maxRank: 40000, ratio: 0.15 },  // 15% - Native
  { id: 6, minRank: 40001, maxRank: 70000, ratio: 0.10 },  // 10% - Highly Educated
  { id: 7, minRank: 70001, maxRank: 100000, ratio: 0.05 }, // 5% - Specialist
  { id: 8, minRank: 100001, maxRank: 150000, ratio: 0.05 } // 5% - Ultra Rare
];

export const TEST_MODES: TestMode[] = [
  {
    id: 'quick',
    label: 'Cepat',
    totalQuestions: 100,
    estimatedTime: '~2 Menit',
    description: 'Estimasi kasar untuk sekedar tahu.',
    icon: '⚡'
  },
  {
    id: 'standard',
    label: 'Standar',
    totalQuestions: 200,
    estimatedTime: '~4 Menit',
    description: 'Paling seimbang dan direkomendasikan.',
    icon: '🎯'
  },
  {
    id: 'accurate',
    label: 'Akurat',
    totalQuestions: 500,
    estimatedTime: '~10 Menit',
    description: 'Analisis mendalam dengan margin error rendah.',
    icon: '🔬'
  }
];

export const TOTAL_QUESTIONS_DEFAULT = 200;

export const API_URL = "https://xxnsvylzzkgcnubaegyv.supabase.co";
export const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bnN2eWx6emtnY251YmFlZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDE0MjcsImV4cCI6MjA3OTk3NzQyN30.x0wz0v_qqvg6riMipKMr3IM30YnGaGs1b9uMvJRGG5M";

export const CEFR_LEVELS = [
  { threshold: 0, level: 'Pre-A1 (Pemula)' },
  { threshold: 1000, level: 'A1 (Dasar)' },
  { threshold: 2500, level: 'A2 (Dasar Lanjut)' },
  { threshold: 5000, level: 'B1 (Menengah)' },
  { threshold: 9000, level: 'B2 (Menengah Atas)' },
  { threshold: 14000, level: 'C1 (Mahir)' },
  { threshold: 24000, level: 'C2 (Sangat Mahir)' },
];

// RECALIBRATED FOR LITERACY (READING ABILITY)
// N1 is typically cited as ~10,000 words. N2 around ~6,000.
export const JLPT_LEVELS = [
  { threshold: 0, level: 'Belum N5' },
  { threshold: 800, level: 'N5 (Dasar)' },
  { threshold: 1800, level: 'N4 (Dasar)' },
  { threshold: 3800, level: 'N3 (Menengah)' },
  { threshold: 6500, level: 'N2 (Bisnis)' },
  { threshold: 10500, level: 'N1 (Akademik)' },
  { threshold: 22000, level: 'N1+ (Native)' },
  { threshold: 35000, level: 'N1++ (Ahli Bahasa)' },
];

// RECALIBRATED FOR LITERACY AGE (Not Spoken Age)
// Japanese kids learn ~1000 Kanji by age 12. Reading 10k words requires knowing most Joyo Kanji.
// Thus, 10k-12k words is Junior High level literacy, not Primary School.
export const AGE_EQUIVALENTS = [
  { threshold: 0, age: 'Belum Bisa Baca' },
  { threshold: 500, age: '3-5 Tahun (TK)' },
  { threshold: 1500, age: '6-7 Tahun (SD Kelas 1-2)' },
  { threshold: 3500, age: '8-9 Tahun (SD Kelas 3-4)' },
  { threshold: 6500, age: '10-12 Tahun (Lulus SD)' },
  { threshold: 10000, age: '13-15 Tahun (SMP)' },
  { threshold: 16000, age: '16-18 Tahun (SMA)' },
  { threshold: 25000, age: 'Mahasiswa / Dewasa' },
  { threshold: 40000, age: 'Akademisi / Penulis' },
  { threshold: 60000, age: 'Kamus Berjalan' },
];

// MATRIX LITERACY DESCRIPTIONS
export const LITERACY_DESCRIPTIONS = {
  general: [
    { threshold: 0, desc: 'Butuh bantuan visual untuk mengerti.' },
    { threshold: 800, desc: 'Bisa membaca kalimat sederhana & hiragana/katakana.' },
    { threshold: 3500, desc: 'Bisa membaca Manga shonen (dengan furigana).' },
    { threshold: 6500, desc: 'Bisa membaca subtitle Anime & Manga tanpa furigana.' },
    { threshold: 11000, desc: 'Bisa membaca Light Novel & Koran umum.' },
    { threshold: 20000, desc: 'Bisa membaca Novel Sastra & Jurnal Berita.' },
    { threshold: 35000, desc: 'Bisa membaca Makalah Akademik & Literatur Klasik.' },
  ],
  academic: [
    { threshold: 0, desc: 'Butuh bimbingan dasar pengenalan huruf.' },
    { threshold: 800, desc: 'Bisa membaca soal latihan JLPT N5 & kalimat buku teks dasar.' },
    { threshold: 3500, desc: 'Bisa membaca soal latihan JLPT N4 & teks buku harian sederhana.' },
    { threshold: 6500, desc: 'Bisa membaca materi ujian N3, cerpen formal, & pengumuman stasiun.' },
    { threshold: 11000, desc: 'Bisa membaca editorial koran, esai akademik, & materi kuliah dasar.' },
    { threshold: 20000, desc: 'Bisa membaca jurnal penelitian & dokumen hukum resmi.' },
    { threshold: 35000, desc: 'Bisa membaca literatur klasik & naskah kuno.' },
  ],
  intuitive: [
    { threshold: 0, desc: 'Mengenali karakter visual tertentu tapi belum bisa membaca.' },
    { threshold: 800, desc: 'Bisa mengenali judul Anime & menu game RPG sederhana.' },
    { threshold: 3500, desc: 'Bisa membaca dialog Manga simpel & caption Instagram/Twitter.' },
    { threshold: 6500, desc: 'Bisa membaca Manga Shonen (tanpa furigana) & lirik lagu Pop.' },
    { threshold: 11000, desc: 'Bisa membaca Light Novel Isekai, Visual Novel, & utas Twitter Jepang.' },
    { threshold: 20000, desc: 'Bisa membaca Web Novel fantasi berat & lore dalam Game.' },
    { threshold: 35000, desc: 'Bisa membaca Novel Misteri kompleks & Sastra Modern.' },
  ]
};