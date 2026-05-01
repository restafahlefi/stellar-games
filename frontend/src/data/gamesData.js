export const GAMES = [
  {
    id: 'tictactoe',
    icon: ['❌', '⭕'],
    name: 'Tic-Tac-Toe Neon',
    desc: 'Uji strategi Anda dalam pertempuran klasik! Kalahkan AI cerdas atau tantang teman dalam duel neon yang memukau.',
    color: 'blue',
    category: 'multiplayer',
    difficulty: 'Easy',
    players: 0,
    badge: 'HOT',
    guide: [
      "Papan terdiri dari 3x3 kotak futuristik.",
      "Letakkan tanda (X atau O) secara bergantian untuk menguasai area.",
      "Susun 3 tanda sejajar (horizontal, vertikal, atau diagonal) untuk meraih kemenangan mutlak!",
      "Hati-hati, AI kami dirancang untuk tidak membiarkan Anda menang dengan mudah."
    ]
  },
  {
    id: 'snake',
    icon: ['🐍', '🍎'],
    name: 'Stellar Snake',
    color: 'emerald',
    desc: 'Nostalgia dengan sentuhan modern! Tumbuh lebih panjang, buru apel bercahaya, dan kuasai kecepatan tanpa batas.',
    category: 'arcade',
    difficulty: 'Medium',
    players: 0,
    badge: 'POPULAR',
    guide: [
      "Gunakan tombol Panah untuk mengendalikan arah gerakan ular.",
      "Makan apel merah untuk skor tinggi dan memperpanjang tubuh ular.",
      "✨ Fitur Spesial: Tembus Dinding! Anda bisa muncul dari sisi berlawanan untuk strategi bertahan.",
      "⚠️ Jangan sampai menabrak tubuh sendiri atau permainan akan berakhir."
    ]
  },
  {
    id: 'flappybird',
    icon: ['🐦', '🌵'],
    name: 'Stellar Flight',
    desc: 'Uji refleks dan ketahanan Anda! Terbang melewati rintangan pipa dalam petualangan tanpa akhir yang adiktif.',
    color: 'amber',
    category: 'arcade',
    difficulty: 'Hard',
    players: 0,
    guide: [
      "Tekan SPACE atau Klik layar untuk melompat (flap) melawan gravitasi.",
      "Jaga ketinggian dengan ritme yang tepat untuk melewati celah sempit.",
      "Setiap pipa yang terlewati memberikan +1 poin prestasi.",
      "Satu kesalahan fatal akan mengakhiri penerbangan Anda!"
    ]
  },
  {
    id: 'pacman',
    icon: ['🟡', '👻'],
    name: 'Pac-Man Mastery',
    desc: 'Lari dari kegelapan! Jelajahi labirin, santap seluruh titik, dan balikkan keadaan saat hantu mulai memburu Anda.',
    color: 'amber',
    category: 'arcade',
    difficulty: 'Medium',
    players: 0,
    guide: [
      "Gunakan Panah untuk navigasi cepat di dalam labirin neon.",
      "Makan semua titik kecil dan hindari kejaran 4 hantu pelindung labirin.",
      "Makan Power Pellet (titik besar) untuk mengubah hantu menjadi mangsa selama 8 detik!",
      "Manfaatkan lorong rahasia untuk melarikan diri dari kepungan hantu."
    ]
  },
  {
    id: 'memory',
    icon: ['🎴'],
    name: 'Memory Match',
    desc: 'Flip cards to find matching pairs. Test your memory speed with 3D animations!',
    color: 'purple',
    category: 'puzzle',
    difficulty: 'Easy',
    players: 0,
    guide: [
      "Pilih tingkat kesulitan (Easy, Medium, Hard).",
      "Klik kartu untuk membaliknya dan melihat gambar di baliknya.",
      "Cobalah mencari dan membalik 2 kartu dengan gambar yang sama untuk mencocokkannya.",
      "Ingat posisi kartu yang salah! Selesaikan game dengan langkah sesedikit mungkin untuk mendapat 3 Bintang ⭐."
    ]
  },
  {
    id: 'rps',
    icon: ['✊', '✋', '✌️'],
    name: 'Rock Paper Scissors',
    desc: 'Battle against the AI. Can you outsmart the machine?',
    color: 'rose',
    category: 'multiplayer',
    difficulty: 'Easy',
    players: 0,
    badge: 'NEW',
    guide: [
      "Pilih salah satu senjata Anda: Batu ✊, Kertas ✋, atau Gunting ✌️.",
      "Batu mengalahkan Gunting (Menghancurkan).",
      "Gunting mengalahkan Kertas (Memotong).",
      "Kertas mengalahkan Batu (Membungkus).",
      "Kalahkan AI sebanyak mungkin untuk mengumpulkan skor tertinggi!"
    ]
  },
  {
    id: 'simon',
    icon: ['🧠', '💡', '✨'],
    name: 'Simon Says',
    desc: 'Follow the memory patterns and sound sequence. Test your brain!',
    color: 'yellow',
    category: 'brain',
    difficulty: 'Medium',
    players: 0,
    guide: [
      "Perhatikan Polanya: Mesin akan menyalakan lampu warna dan membunyikan nada secara berurutan.",
      "Hafalkan: Tunggu sampai mesin selesai memutar seluruh urutan warnanya.",
      "Ulangi: Setelah giliran Anda, klik warna-warna tersebut dengan urutan yang persis sama.",
      "Bertahan Hidup: Setiap babak, mesin akan menambahkan 1 warna extra. Salah ketuk satu kali saja, Anda langsung kalah!"
    ]
  },
  {
    id: 'typing',
    icon: ['⌨️'],
    name: 'Typing Test',
    desc: 'Test your Words Per Minute (WPM) and accuracy with random paragraphs.',
    color: 'cyan',
    category: 'brain',
    difficulty: 'Easy',
    players: 0,
    guide: [
      "Sebuah teks paragraf acak akan muncul di layar.",
      "Mulai ketik teks tersebut menggunakan keyboard fisik Anda persis seperti yang tertulis.",
      "Waktu akan otomatis berjalan saat Anda menekan huruf pertama.",
      "Jika Anda salah huruf, layar akan bergetar dan menyala merah. Teruslah mengetik!",
      "Hasil akhir akan menunjukkan Kecepatan (WPM) dan Akurasi (%) Anda."
    ]
  },
  {
    id: 'connect4',
    icon: ['🔴', '🟡', '🟢'],
    name: 'Connect Four',
    desc: 'Drop discs into the 7x6 grid. Features AI mode and 3-Player Chaos mode!',
    color: 'indigo',
    category: 'multiplayer',
    difficulty: 'Medium',
    players: 0,
    badge: 'NEW',
    guide: [
      "Papan terdiri dari 7 kolom dan 6 baris.",
      "Terdapat 3 Mode Permainan (Pilih di dalam game): 👥 2P Klasik, 🤖 Melawan AI, atau 🎮 3P Chaos (Merah vs Kuning vs Hijau).",
      "Koin akan jatuh ke slot kosong paling bawah karena gaya gravitasi.",
      "Pemain pertama yang berhasil menyusun 4 koin miliknya secara berurutan (vertikal, horizontal, atau diagonal) menang!"
    ]
  },
  {
    id: 'game2048',
    icon: ['🔢'],
    name: '2048',
    desc: 'Slide and merge numbers to reach the legendary 2048 tile!',
    color: 'orange',
    category: 'puzzle',
    difficulty: 'Medium',
    players: 0,
    guide: [
      "Gunakan tombol Panah (Kiri, Kanan, Atas, Bawah) di keyboard untuk menggeser kotak.",
      "Setiap kali Anda menggeser, semua kotak akan meluncur sejauh mungkin ke arah tersebut.",
      "Jika dua kotak dengan angka yang sama bertabrakan, mereka akan bergabung (Misal: 2 + 2 = 4).",
      "Gabungkan terus hingga Anda berhasil menciptakan kotak berangka 2048."
    ]
  },
  {
    id: 'minesweeper',
    icon: ['💣'],
    name: 'Minesweeper',
    desc: 'Use logic to find all the hidden mines without blowing up.',
    color: 'red',
    category: 'puzzle',
    difficulty: 'Hard',
    players: 0,
    guide: [
      "Klik Kiri pada kotak untuk membukanya.",
      "Jika kotak aman, akan muncul angka yang menunjukkan JUMLAH BOM di 8 kotak sekelilingnya.",
      "Gunakan Klik Kanan untuk menancapkan Bendera 🚩 pada kotak yang Anda yakini sebagai bom.",
      "Buka semua kotak yang aman untuk menang. Jika Anda mengklik bom, DUARR! Game Over."
    ]
  },
  {
    id: 'wordle',
    icon: ['📝'],
    name: 'Wordle Clone',
    desc: 'Guess the hidden 5-letter word in 6 tries.',
    color: 'green',
    category: 'brain',
    difficulty: 'Medium',
    players: 0,
    guide: [
      "Tebak kata rahasia (berbahasa Inggris, 5 huruf) dalam 6 kali percobaan.",
      "Ketik tebakan Anda menggunakan keyboard lalu tekan Enter.",
      "Setelah ditebak, warna kotak akan berubah memberikan petunjuk:",
      "🟩 HIJAU: Hurufnya BENAR dan posisinya TEPAT.",
      "🟨 KUNING: Hurufnya BENAR tapi posisinya SALAH.",
      "⬛ ABU-ABU: Huruf itu TIDAK ADA di kata rahasia sama sekali."
    ]
  }
];

// Game categories untuk filtering
export const GAME_CATEGORIES = {
  all: { name: 'All Games', icon: '🎮', color: 'slate' },
  arcade: { name: 'Arcade', icon: '🕹️', color: 'amber' },
  puzzle: { name: 'Puzzle', icon: '🧩', color: 'purple' },
  brain: { name: 'Brain', icon: '🧠', color: 'cyan' },
  multiplayer: { name: 'Multiplayer', icon: '👥', color: 'blue' }
};

// Helper function untuk get games by category
export const getGamesByCategory = (category) => {
  if (category === 'all') return GAMES;
  return GAMES.filter(game => game.category === category);
};
