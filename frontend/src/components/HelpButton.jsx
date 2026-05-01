import { useState } from 'react';

export default function HelpButton({ game }) {
  const [showHelp, setShowHelp] = useState(false);

  const gameGuides = {
    snake: {
      title: 'Snake',
      objective: 'Makan apel untuk tumbuh panjang tanpa menabrak dinding atau tubuh sendiri',
      controls: [
        '⬆️ Arrow Up - Ke atas',
        '⬇️ Arrow Down - Ke bawah',
        '⬅️ Arrow Left - Ke kiri',
        '➡️ Arrow Right - Ke kanan',
        'Space - Pause'
      ],
      tips: [
        'Rencanakan jalur sebelum bergerak',
        'Gunakan tepi untuk manuver',
        'Jangan terburu-buru di awal',
        'Perhatikan pola pergerakan'
      ]
    },
    memory: {
      title: 'Memory Match',
      objective: 'Temukan semua pasangan kartu dengan moves sesedikit mungkin',
      controls: [
        '🖱️ Click - Buka kartu',
        '👁️ Ingat posisi kartu'
      ],
      tips: [
        'Fokus pada satu area dulu',
        'Ingat posisi kartu yang sudah dibuka',
        'Mulai dari sudut untuk sistematis',
        'Jangan terburu-buru'
      ]
    },
    tictactoe: {
      title: 'Tic Tac Toe',
      objective: 'Buat 3 simbol berjajar (horizontal, vertikal, atau diagonal)',
      controls: [
        '🖱️ Click - Pilih kotak',
        '🎮 3 Mode: AI, Local, Online'
      ],
      tips: [
        'Ambil tengah jika bisa',
        'Blok lawan jika hampir menang',
        'Buat 2 ancaman sekaligus',
        'Perhatikan diagonal'
      ]
    },
    simon: {
      title: 'Simon Says',
      objective: 'Ikuti urutan warna yang ditampilkan',
      controls: [
        '🖱️ Click - Pilih warna',
        '👀 Perhatikan sequence',
        '🧠 Ingat urutan'
      ],
      tips: [
        'Fokus penuh saat sequence',
        'Ulangi dalam hati',
        'Jangan terburu-buru klik',
        'Gunakan pola untuk mengingat'
      ]
    },
    typing: {
      title: 'Typing Test',
      objective: 'Ketik teks secepat dan seakurat mungkin',
      controls: [
        '⌨️ Keyboard - Ketik teks',
        '🎯 Akurasi penting',
        '⚡ Kecepatan bonus'
      ],
      tips: [
        'Posisi jari yang benar',
        'Jangan lihat keyboard',
        'Ritme lebih penting dari kecepatan',
        'Akurasi > Kecepatan'
      ]
    },
    minesweeper: {
      title: 'Minesweeper',
      objective: 'Buka semua kotak tanpa menginjak ranjau',
      controls: [
        '🖱️ Left Click - Buka kotak',
        '🖱️ Right Click - Flag ranjau',
        '🔢 Angka = jumlah ranjau di sekitar'
      ],
      tips: [
        'Mulai dari sudut',
        'Gunakan logika, bukan tebakan',
        'Flag ranjau yang pasti',
        'Angka adalah petunjuk'
      ]
    },
    connect4: {
      title: 'Connect Four',
      objective: 'Buat 4 keping berjajar (horizontal, vertikal, atau diagonal)',
      controls: [
        '🖱️ Click - Jatuhkan keping',
        '🎮 Mode: AI atau Local'
      ],
      tips: [
        'Kontrol tengah',
        'Buat ancaman ganda',
        'Blok lawan',
        'Perhatikan diagonal'
      ]
    },
    rps: {
      title: 'Rock Paper Scissors',
      objective: 'Menang 3 ronde untuk juara',
      controls: [
        '🖱️ Click - Pilih: Batu, Kertas, atau Gunting',
        '🪨 Batu > Gunting',
        '📄 Kertas > Batu',
        '✂️ Gunting > Kertas'
      ],
      tips: [
        'Perhatikan pola lawan',
        'Jangan terlalu predictable',
        'Gunakan psikologi',
        'Variasikan pilihan'
      ]
    },
    wordle: {
      title: 'Wordle',
      objective: 'Tebak kata 5 huruf dalam 6 percobaan',
      controls: [
        '⌨️ Keyboard - Ketik kata',
        '🟩 Hijau = huruf benar & posisi benar',
        '🟨 Kuning = huruf benar, posisi salah',
        '⬜ Abu = huruf tidak ada'
      ],
      tips: [
        'Mulai dengan kata vokal banyak',
        'Gunakan huruf umum dulu',
        'Perhatikan posisi huruf',
        'Eliminasi huruf yang salah'
      ]
    },
    flappybird: {
      title: 'Flappy Bird',
      objective: 'Terbang melewati pipa tanpa menabrak',
      controls: [
        'Space / Click - Terbang',
        '⬆️ Tap untuk naik',
        '⬇️ Jatuh otomatis'
      ],
      tips: [
        'Timing adalah segalanya',
        'Jangan spam tap',
        'Tetap di tengah',
        'Antisipasi pipa berikutnya'
      ]
    },
    pacman: {
      title: 'Pac-Man',
      objective: 'Makan semua dot sambil menghindari hantu',
      controls: [
        '⬆️⬇️⬅️➡️ Arrow Keys - Gerak',
        '🔵 Power pellet - Makan hantu',
        '🍒 Bonus fruit'
      ],
      tips: [
        'Rencanakan rute',
        'Gunakan power pellet strategis',
        'Pelajari pola hantu',
        'Clear satu area dulu'
      ]
    },
    '2048': {
      title: '2048',
      objective: 'Gabungkan angka untuk mencapai 2048',
      controls: [
        '⬆️⬇️⬅️➡️ Arrow Keys - Geser',
        '🔢 Angka sama = gabung & double'
      ],
      tips: [
        'Simpan angka besar di sudut',
        'Jangan acak arah',
        'Buat strategi jangka panjang',
        'Hindari mengisi penuh'
      ]
    }
  };

  const guide = gameGuides[game] || gameGuides.snake;

  if (!showHelp) {
    return (
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl font-bold transition-all hover:scale-110 active:scale-95 z-50 border-4 border-blue-400"
        title="Bantuan"
      >
        ?
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              ❓
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{guide.title}</h2>
              <p className="text-blue-100 text-sm font-medium">Panduan Bermain</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Objective */}
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-black text-emerald-400 mb-2 flex items-center gap-2">
              🎯 Tujuan
            </h3>
            <p className="text-slate-300 leading-relaxed">{guide.objective}</p>
          </div>

          {/* Controls */}
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-black text-blue-400 mb-3 flex items-center gap-2">
              🎮 Kontrol
            </h3>
            <div className="space-y-2">
              {guide.controls.map((control, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-300">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{control}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-black text-amber-400 mb-3 flex items-center gap-2">
              💡 Tips & Trik
            </h3>
            <div className="space-y-2">
              {guide.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-300">
                  <span className="text-amber-400 font-bold">{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowHelp(false)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black rounded-xl transition-all shadow-lg"
          >
            Mengerti, Mulai Bermain! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
