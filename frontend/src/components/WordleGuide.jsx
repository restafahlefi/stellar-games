import React, { useState } from 'react';

export default function WordleGuide({ onClose, onStart }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🎯 Tujuan Game",
      content: (
        <div className="space-y-4">
          <p className="text-lg text-slate-300 leading-relaxed">
            <strong className="text-white">Tebak kata bahasa Inggris 5 huruf</strong> dalam maksimal 6 percobaan!
          </p>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Contoh kata yang valid:</p>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-emerald-600 px-3 py-1 rounded text-white font-bold">APPLE</span>
              <span className="bg-emerald-600 px-3 py-1 rounded text-white font-bold">HOUSE</span>
              <span className="bg-emerald-600 px-3 py-1 rounded text-white font-bold">MUSIC</span>
              <span className="bg-emerald-600 px-3 py-1 rounded text-white font-bold">WORLD</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🎨 Sistem Warna",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 mb-4">Setelah menebak, setiap huruf akan berubah warna:</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <div>
                <p className="text-emerald-400 font-bold">HIJAU = Benar & Posisi Tepat</p>
                <p className="text-sm text-slate-400">Huruf ini ada di kata dan posisinya sudah benar</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <div>
                <p className="text-amber-400 font-bold">KUNING = Ada tapi Salah Posisi</p>
                <p className="text-sm text-slate-400">Huruf ini ada di kata tapi posisinya salah</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-600 rounded flex items-center justify-center text-white font-bold text-xl">
                X
              </div>
              <div>
                <p className="text-slate-400 font-bold">ABU-ABU = Tidak Ada</p>
                <p className="text-sm text-slate-400">Huruf ini tidak ada di kata yang dicari</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "📝 Cara Bermain",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <p className="text-white font-bold">Ketik kata 5 huruf</p>
                <p className="text-sm text-slate-400">Gunakan keyboard di layar atau keyboard fisik</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <p className="text-white font-bold">Tekan ENTER untuk submit</p>
                <p className="text-sm text-slate-400">Kata harus valid (ada dalam kamus)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <p className="text-white font-bold">Lihat petunjuk warna</p>
                <p className="text-sm text-slate-400">Gunakan info warna untuk tebakan berikutnya</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <div>
                <p className="text-white font-bold">Ulangi sampai berhasil</p>
                <p className="text-sm text-slate-400">Maksimal 6 percobaan untuk menebak</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "💡 Tips & Strategi",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/50">
              <p className="text-blue-300 font-bold mb-1">🎯 Kata Pembuka yang Baik:</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">AUDIO</span>
                <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">HOUSE</span>
                <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">STONE</span>
              </div>
              <p className="text-xs text-blue-200 mt-1">Kata dengan banyak vokal dan huruf umum</p>
            </div>
            
            <div className="bg-amber-900/30 p-3 rounded-lg border border-amber-700/50">
              <p className="text-amber-300 font-bold mb-1">⚡ Strategi Cerdas:</p>
              <ul className="text-xs text-amber-200 space-y-1">
                <li>• Gunakan huruf yang belum dicoba</li>
                <li>• Hindari huruf abu-abu (sudah terbukti salah)</li>
                <li>• Pindahkan huruf kuning ke posisi lain</li>
                <li>• Pertahankan huruf hijau di posisi yang sama</li>
              </ul>
            </div>
            
            <div className="bg-emerald-900/30 p-3 rounded-lg border border-emerald-700/50">
              <p className="text-emerald-300 font-bold mb-1">🏆 Huruf Paling Sering:</p>
              <p className="text-xs text-emerald-200">E, A, R, I, O, T, N, S (coba dulu huruf-huruf ini)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🎮 Contoh Permainan",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 mb-3">Misalnya kata yang dicari adalah <strong className="text-white">HOUSE</strong>:</p>
          
          <div className="space-y-2">
            <div className="text-sm text-slate-400 mb-1">Percobaan 1: AUDIO</div>
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center text-white text-xs font-bold">A</div>
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white text-xs font-bold">U</div>
              <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center text-white text-xs font-bold">D</div>
              <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center text-white text-xs font-bold">I</div>
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white text-xs font-bold">O</div>
            </div>
            <p className="text-xs text-slate-400">U dan O ada di kata, tapi posisi salah</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-slate-400 mb-1">Percobaan 2: HOUSE</div>
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold">H</div>
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold">O</div>
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold">U</div>
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold">S</div>
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold">E</div>
            </div>
            <p className="text-xs text-emerald-400 font-bold">🎉 BENAR! Semua huruf hijau = Menang!</p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStart();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">📝 Panduan Wordle</h2>
            <p className="text-sm text-slate-400">Step {currentStep + 1} dari {steps.length}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">{steps[currentStep].title}</h3>
          <div className="text-slate-300">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              currentStep === 0 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            ← Sebelumnya
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
          >
            {currentStep === steps.length - 1 ? 'Mulai Main! 🚀' : 'Selanjutnya →'}
          </button>
        </div>

        {/* Quick Start */}
        {currentStep === 0 && (
          <div className="mt-4 p-3 bg-emerald-900/30 rounded-xl border border-emerald-700/50">
            <p className="text-emerald-300 text-sm text-center">
              💡 <strong>Sudah tahu cara main?</strong> 
              <button 
                onClick={onStart}
                className="ml-2 text-emerald-400 hover:text-emerald-300 underline font-bold"
              >
                Langsung mulai!
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}