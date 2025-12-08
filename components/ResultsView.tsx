

import React from 'react';
import { TestResult } from '../types';

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

  // Generate detailed analysis text based on score and bands
  const getAnalysisReport = () => {
    const score = result.totalPredicted;
    const band1Score = result.details.find(d => d.bandId === 1);
    const band1Ratio = band1Score ? band1Score.knownInBand / band1Score.totalInBand : 0;
    
    let summary = "";
    let practical = "";
    let advice = "";

    // STANDARD LEVEL ANALYSIS
    if (score < 1500) {
      summary = "Anda berada di tahap awal. Fokus utama Anda saat ini masih pada pengenalan bentuk visual kata dan karakter dasar.";
      practical = "Bisa mengenali kata-kata salam & angka, namun teks panjang masih sulit.";
      advice = "Prioritas: Kuasai Hiragana dan Katakana sepenuhnya. Hafalkan 100 Kanji dasar.";
    } else if (score < 8000) {
      summary = "Anda berada di level menengah (Intermediate). Anda sudah bukan pemula, tapi belum sepenuhnya lancar membaca teks kompleks.";
      practical = "Bisa memahami pesan sehari-hari, namun berita standar masih berat.";
      advice = "Perbanyak input membaca tanpa kamus (Extensive Reading) dan perkuat Jukugo.";
    } else {
      summary = "Kemampuan literasi Anda kuat. Anda sudah dikategorikan sebagai pembaca mandiri.";
      practical = "Hampir semua media hiburan terbuka untuk Anda.";
      advice = "Tantang diri Anda dengan materi teknis, sastra, atau editorial koran.";
    }

    // Weakness Check (Foundation)
    let warning = "";
    if (band1Ratio < 0.7 && score > 3000) {
      warning = "CATATAN PENTING: Meskipun skor total Anda lumayan, akurasi Anda di kata-kata dasar (Band 1) terlihat kurang stabil. Ini menandakan 'Swiss Cheese Knowledge'—pengetahuan bolong-bolong. Jangan remehkan kata-kata dasar karena mereka membentuk struktur kalimat.";
    }

    return { summary, practical, advice, warning };
  };

  const report = getAnalysisReport();

  return (
    <div className="w-full max-w-3xl mx-auto text-center px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        
        {/* Background glow effect */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

        <h2 className="text-slate-400 text-sm uppercase tracking-widest mb-4 relative z-10">Hasil Tes Kemampuan Membaca</h2>
        
        <div className="relative mb-12 z-10">
            <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm">
            {result.totalPredicted.toLocaleString()}
            </div>
            <div className="text-xl text-slate-400 font-medium -mt-2">Kosakata Terbaca</div>
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