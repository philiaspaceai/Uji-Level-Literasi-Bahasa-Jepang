import React, { useEffect, useRef } from 'react';

interface ExplanationModalProps {
  onClose: () => void;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent background scrolling when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function: re-enable scrolling when modal is closed
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explanation-title"
    >
      <div 
        ref={modalRef}
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto relative animate-card-in"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 id="explanation-title" className="text-xl font-bold text-emerald-400 mb-3">
          Memahami Skor Anda: Kosakata Pasif
        </h2>

        <div className="space-y-3 text-slate-300">
          <div>
            <h3 className="font-semibold text-slate-100 mb-2">Apa Arti Angka Ini?</h3>
            <p>
              Skor ini adalah <strong className="text-emerald-300">estimasi jumlah kata unik yang dapat Anda kenali dan baca</strong> saat melihatnya. Ini disebut 'Kosakata Pasif'.
            </p>
            <p className="mt-2 text-sm text-slate-400 italic">
              Bayangkan ini seperti perpustakaan di kepala Anda. Anda tahu judul dan sampul dari (misalnya) 15.000 'buku' (kata), meskipun Anda mungkin tidak ingat isi detail dari setiap buku tersebut setiap saat.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-2">Kemampuan Pasif vs. Aktif</h3>
            <p>
              Penting untuk dipahami, tes ini secara spesifik mengukur kemampuan <strong className="text-emerald-300">pasif</strong> (membaca/mengenali), bukan kemampuan <strong className="text-rose-400">aktif</strong> (berbicara/menulis).
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="font-bold text-emerald-300">✓ Pasif (Yang Diukur)</p>
                <p className="mt-1 text-slate-400">Anda melihat <span className="font-jp font-bold">環境</span> (kankyō) dan langsung tahu cara bacanya, bahkan jika butuh sedetik untuk ingat artinya adalah "lingkungan".</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="font-bold text-rose-400">✗ Aktif (Tidak Diukur)</p>
                <p className="mt-1 text-slate-400">Anda ingin bilang "lingkungan kerja" dan kata <span className="font-jp font-bold">環境</span> langsung muncul di kepala Anda untuk diucapkan.</p>
              </div>
            </div>
             <p className="mt-3 text-sm">
                Skor tinggi di sini menunjukkan Anda memiliki fondasi yang sangat kuat untuk menjadi pembaca yang hebat. Langkah selanjutnya adalah melatih diri untuk mengubah 'perpustakaan pasif' ini menjadi kosakata aktif yang siap pakai.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-2">Bagaimana Menggunakan Hasil Ini?</h3>
            <p>
              Gunakan skor ini sebagai panduan untuk memilih materi bacaan yang tepat untuk level Anda.
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-400">
              <li><strong className="text-slate-200">1.000 - 3.000 kata:</strong> Siap untuk manga sederhana (Yotsuba&!), buku cerita anak, dan materi level JLPT N5/N4.</li>
              <li><strong className="text-slate-200">8.000 - 15.000 kata:</strong> Bisa mulai membaca novel ringan, artikel berita sederhana, dan mayoritas konten web umum.</li>
              <li><strong className="text-slate-200">25.000+ kata:</strong> Mampu membaca novel sastra, artikel koran, dan bahkan materi teknis dengan lebih nyaman.</li>
            </ul>
             <p className="mt-4 font-semibold text-emerald-400">
                Teruslah membaca materi yang sedikit menantang tapi tetap bisa Anda nikmati. Itulah cara tercepat untuk memperluas jangkauan kosakata Anda!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};