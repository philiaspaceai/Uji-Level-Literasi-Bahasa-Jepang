import React from 'react';
import { TestResult, LearnerType } from '../types';
import { RadarChart } from './RadarChart';

interface ResultsViewProps {
  result: TestResult;
  onRetry: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onRetry }) => {
  
  // Helper to split Age string "8-10 Tahun (SD Kelas 3-4)" into two lines
  const formatAgeText = (text: string) => {
    const splitIndex = text.indexOf('(');
    if (splitIndex === -1) return text;
    
    const mainText = text.substring(0, splitIndex).trim();
    const subText = text.substring(splitIndex);
    
    return (
      <>
        <span className="block">{mainText}</span>
        <span className="block text-sm md:text-base text-slate-400 font-normal mt-1 leading-tight">{subText}</span>
      </>
    );
  };

  const getLearnerTypeConfig = (type: LearnerType) => {
    switch (type) {
        case 'ACADEMIC':
            return {
                label: 'Textbook Learner (Akademis)',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                icon: (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                )
            };
        case 'IMMERSION':
            return {
                label: 'Intuitive Learner (Tipe Intuitif)',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/20',
                icon: (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )
            };
        case 'BALANCED':
            return {
                label: 'Balanced Master',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                icon: (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )
            };
        default:
            return {
                label: 'Pemula',
                color: 'text-slate-400',
                bg: 'bg-slate-500/10',
                border: 'border-slate-500/20',
                icon: (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                )
            };
    }
  };

  // Generate detailed analysis text based on score and bands
  const getAnalysisReport = () => {
    const score = result.totalPredicted;
    const band1Score = result.details.find(d => d.bandId === 1);
    const band1Ratio = band1Score ? band1Score.knownInBand / band1Score.totalInBand : 0;
    
    let summary = "";
    let practical = "";
    let advice = "";

    // BASE LEVEL ANALYSIS (Generic fallback, mostly overwritten by Learner Type Logic)
    if (score < 1500) {
      summary = "Anda berada di tahap awal. Fokus utama Anda saat ini masih pada pengenalan bentuk visual kata dan karakter dasar.";
      practical = "Bisa mengenali kata-kata salam & angka, namun teks panjang masih sulit.";
      advice = "Prioritas: Kuasai Hiragana dan Katakana sepenuhnya. Hafalkan 100 Kanji dasar.";
    } else if (score < 8000) {
      summary = "Anda berada di level menengah (Intermediate). Anda sudah bukan pemula, tapi belum sepenuhnya lancar.";
      practical = "Bisa memahami pesan sehari-hari, namun berita standar masih berat.";
      advice = "Perbanyak input membaca tanpa kamus (Extensive Reading).";
    } else {
      summary = "Kemampuan literasi Anda kuat. Anda sudah dikategorikan sebagai pembaca mandiri.";
      practical = "Hampir semua media hiburan terbuka untuk Anda.";
      advice = "Tantang diri Anda dengan materi teknis atau sastra.";
    }

    // LEARNER TYPE SPECIFIC ANALYSIS
    if (result.learnerType === 'BALANCED') {
        summary = "Sempurna. Kami mendeteksi profil 'Balanced Master'. Anda menggabungkan disiplin belajar formal dengan kekayaan input media asli. Tidak ada celah berarti dalam literasi Anda.";
        practical = "Anda bisa beradaptasi dengan segala jenis teks, baik itu dokumen kaku pemerintah maupun slang liar di internet.";
        advice = "Anda sudah di level elite. Tantangan Anda berikutnya adalah output (Writing/Speaking) atau bidang spesialis (Hukum/Medis).";
    } else if (result.learnerType === 'IMMERSION') {
        summary = "Kami mendeteksi pola 'Intuitif' (Intuitive Learner). Anda mengenali banyak kosakata sulit yang sering muncul di Anime/Game/Novel, meskipun mungkin melewatkan beberapa kata formal.";
        practical = "Anda sangat nyaman dengan media hiburan (Manga/Game) dan bahasa lisan yang dituliskan. Namun, dokumen formal mungkin terasa membosankan atau membingungkan bagi Anda.";
        advice = "Sebagai tipe 'Intuitif', intuisi bahasa Anda sangat tajam. Untuk menyeimbangkan kemampuan, cobalah pelajari tata bahasa formal (Keigo) dan Kanji standar agar bahasa Jepang Anda tidak terdengar terlalu kasual di situasi serius.";
    } else if (result.learnerType === 'ACADEMIC') {
        summary = "Kami mendeteksi pola 'Akademis' (Textbook Learner). Pengetahuan Anda sangat terstruktur sesuai kurikulum buku teks, namun menurun drastis pada kosakata di luar materi pelajaran.";
        practical = "Anda sangat jago mengerjakan soal ujian dan membaca teks standar buku pelajaran. Namun, Anda mungkin kaget saat membaca bahasa Jepang 'asli' di Twitter atau Novel yang penuh idiom tidak baku.";
        advice = "Sebagai tipe 'Akademis', fondasi Anda sangat kokoh. Untuk melompat ke level berikutnya, tinggalkan buku teks sejenak. Cobalah 'tenggelam' dalam media asli (Novel, Twitter Jepang, Berita) untuk menangkap kosakata liar yang jarang diajarkan di kelas.";
    }

    // Weakness Check (Foundation)
    let warning = "";
    if (band1Ratio < 0.7 && score > 3000) {
      warning = "CATATAN PENTING: Meskipun skor total Anda lumayan, akurasi Anda di kata-kata dasar (Band 1) terlihat kurang stabil. Ini menandakan 'Swiss Cheese Knowledge'—pengetahuan bolong-bolong. Jangan remehkan kata-kata dasar karena mereka membentuk struktur kalimat.";
    }

    return { summary, practical, advice, warning };
  };

  const report = getAnalysisReport();
  const learnerConfig = getLearnerTypeConfig(result.learnerType);

  return (
    <div className="w-full max-w-3xl mx-auto text-center px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        
        {/* Background glow effect */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

        <h2 className="text-slate-400 text-sm uppercase tracking-widest mb-4 relative z-10">Hasil Tes Kemampuan Membaca</h2>
        
        <div className="relative mb-8 z-10">
            <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm">
            {result.totalPredicted.toLocaleString()}
            </div>
            <div className="text-xl text-slate-400 font-medium -mt-2">Kosakata Terbaca</div>
        </div>

        {/* LEARNER TYPE BADGE */}
        {result.learnerType !== 'BEGINNER' && (
             <div className={`inline-flex items-center px-4 py-2 rounded-full border mb-8 ${learnerConfig.bg} ${learnerConfig.border} ${learnerConfig.color} relative z-10`}>
                 {learnerConfig.icon}
                 <span className="font-bold text-sm tracking-wide">{learnerConfig.label}</span>
             </div>
        )}
        
        {/* RADAR CHART (PENTAGON STATS) */}
        <div className="mb-10 relative z-10 flex flex-col items-center">
            <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-4">Profil Kompetensi</h3>
            <RadarChart stats={result.radarStats} />
        </div>

        <div className="bg-slate-900/60 rounded-2xl p-6 mb-10 border border-slate-700/50 relative z-10">
             <div className="text-slate-400 text-xs uppercase mb-2 tracking-widest">Tingkat Literasi</div>
             <div className="text-lg md:text-xl font-medium text-emerald-100 italic">
                "{result.literacyDescription}"
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 relative z-10">
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-center hover:bg-slate-900/80 transition-colors">
            <div className="text-slate-500 text-xs uppercase mb-1">Setara JLPT</div>
            <div className="text-2xl font-bold text-white">{result.jlptLevel}</div>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-center hover:bg-slate-900/80 transition-colors">
            <div className="text-slate-500 text-xs uppercase mb-1">Standar CEFR</div>
            <div className="text-2xl font-bold text-white">{result.cefrLevel}</div>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-center hover:bg-slate-900/80 transition-colors">
            <div className="text-slate-500 text-xs uppercase mb-1">Usia Native Jepang</div>
            <div className="text-2xl font-bold text-white leading-tight">
              {formatAgeText(result.ageEquivalent)}
            </div>
          </div>
        </div>

        {/* --- DEEP ANALYSIS REPORT SECTION --- */}
        <div className="text-left mb-10 bg-slate-900/40 p-8 rounded-3xl border border-slate-700/50 relative z-10">
           <h3 className="text-emerald-400 font-bold text-lg mb-6 flex items-center tracking-wide uppercase">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                Laporan Analisis Lengkap
           </h3>
           
           <div className="space-y-6 text-slate-300 leading-relaxed">
             <div>
               <h4 className="text-white font-semibold mb-2">Evaluasi Tingkat</h4>
               <p className="text-sm md:text-base">{report.summary}</p>
             </div>
             
             <div>
               <h4 className="text-white font-semibold mb-2">Aplikasi Praktis</h4>
               <p className="text-sm md:text-base">{report.practical}</p>
             </div>
             
             {report.warning && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <h4 className="text-yellow-400 font-semibold mb-1 text-sm">Peringatan Fondasi</h4>
                  <p className="text-sm text-yellow-100/80 italic">{report.warning}</p>
                </div>
             )}

             <div className="bg-emerald-900/20 p-5 rounded-xl border border-emerald-500/20">
               <h4 className="text-emerald-300 font-semibold mb-2 flex items-center">
                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                 Saran Pengembangan
               </h4>
               <p className="text-sm md:text-base text-emerald-100/90">{report.advice}</p>
             </div>
           </div>
        </div>

        <div className="text-left mb-10 bg-slate-900/30 p-6 rounded-2xl relative z-10">
           <h3 className="text-slate-300 font-semibold mb-6 flex items-center text-sm uppercase tracking-wider">
                <span className="w-2 h-6 bg-slate-600 rounded-full mr-3"></span>
                Distribusi Frekuensi (Band Analysis)
           </h3>
           <div className="space-y-5">
             {result.details.map((band) => (
                <div key={band.bandId} className="flex flex-col text-sm">
                   <div className="flex justify-between text-slate-400 mb-2 font-medium">
                      <span>Band {band.bandId} (Top {band.totalInBand * (band.bandId === 1 ? 50 : band.bandId === 2 ? 66 : 100)}~ Rank)</span>
                      <span className={band.predictedInBand > 0 ? "text-emerald-400" : "text-slate-600"}>
                          {Math.round((band.knownInBand / band.totalInBand) * 100)}% Dikenali
                      </span>
                   </div>
                   <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-1000" 
                        style={{ width: `${(band.knownInBand / band.totalInBand) * 100}%` }} 
                      />
                   </div>
                </div>
             ))}
           </div>
        </div>

        <button
          onClick={onRetry}
          className="relative z-10 bg-slate-100 hover:bg-white text-slate-900 font-bold py-4 px-12 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-95"
        >
          Tes Ulang
        </button>
      </div>
    </div>
  );
}