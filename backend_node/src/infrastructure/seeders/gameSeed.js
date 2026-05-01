// Seed data untuk games
const { GAME_CATEGORIES, GAME_TYPES } = require('../../config/constants');

const GAMES_SEED_DATA = [
  {
    id: GAME_TYPES.TICTACTOE,
    name: 'Tic-Tac-Toe',
    description: 'Play against a smart AI or challenge a friend locally. Features score tracking.',
    icon: ['❌', '⭕'],
    category: GAME_CATEGORIES.STRATEGY,
    color: 'blue',
    difficulty: 'easy',
    maxPlayers: 2,
    guide: [
      "Papan terdiri dari 3x3 kotak kosong.",
      "Pemain bergantian meletakkan tanda (X atau O) di kotak kosong.",
      "Pemain pertama yang berhasil menyusun 3 tanda berurutan (horizontal, vertikal, atau diagonal) adalah pemenangnya!",
      "Jika semua kotak terisi dan tidak ada yang mendapat 3 berurutan, permainan berakhir seri."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.8 }
  },
  {
    id: GAME_TYPES.SNAKE,
    name: 'Classic Snake',
    description: 'Eat to grow, don\'t hit yourself! Features wall-wrapping and high scores.',
    icon: ['🐍'],
    category: GAME_CATEGORIES.ARCADE,
    color: 'emerald',
    difficulty: 'medium',
    maxPlayers: 1,
    guide: [
      "Gunakan tombol Panah di keyboard (atau tombol di layar) untuk mengarahkan ular.",
      "Makan titik merah untuk mencetak skor dan memperpanjang tubuh ular.",
      "✨ Dinding Tembus (Wall-Wrap): Anda TIDAK AKAN mati jika menabrak dinding luar.",
      "⚠️ Game Over terjadi HANYA jika kepala ular menabrak tubuh/ekornya sendiri."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.7 }
  },
  {
    id: GAME_TYPES.FLAPPYBIRD,
    name: 'Flappy Bird',
    description: 'Tap to flap! Navigate through pipes in this addictive endless runner.',
    icon: ['🐦'],
    category: GAME_CATEGORIES.ARCADE,
    color: 'amber',
    difficulty: 'hard',
    maxPlayers: 1,
    guide: [
      "Tekan SPACE atau Klik layar untuk membuat burung terbang ke atas (flap).",
      "Burung akan jatuh karena gravitasi, jadi terus flap untuk tetap terbang!",
      "Hindari pipa hijau di atas dan bawah. Jangan sampai menabrak!",
      "Setiap pipa yang berhasil dilewati = +1 skor. Bertahan selama mungkin untuk skor tertinggi!"
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.5 }
  },
  {
    id: GAME_TYPES.PACMAN,
    name: 'Pac-Man',
    description: 'Navigate the maze, eat dots, avoid ghosts! Classic arcade action.',
    icon: ['👻'],
    category: GAME_CATEGORIES.ARCADE,
    color: 'amber',
    difficulty: 'medium',
    maxPlayers: 1,
    guide: [
      "Gunakan tombol Panah untuk menggerakkan Pac-Man di dalam labirin.",
      "Makan semua titik kecil untuk menang. Hindari 4 hantu berwarna!",
      "Makan Power Pellet (titik besar) untuk mengaktifkan Power Mode selama 8 detik.",
      "Saat Power Mode aktif, hantu berubah biru dan Anda bisa memakannya untuk bonus poin!"
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.9 }
  },
  {
    id: GAME_TYPES.MEMORY,
    name: 'Memory Match',
    description: 'Flip cards to find matching pairs. Test your memory speed with 3D animations!',
    icon: ['🎴'],
    category: GAME_CATEGORIES.MEMORY,
    color: 'purple',
    difficulty: 'medium',
    maxPlayers: 1,
    guide: [
      "Pilih tingkat kesulitan (Easy, Medium, Hard).",
      "Klik kartu untuk membaliknya dan melihat gambar di baliknya.",
      "Cobalah mencari dan membalik 2 kartu dengan gambar yang sama untuk mencocokkannya.",
      "Ingat posisi kartu yang salah! Selesaikan game dengan langkah sesedikit mungkin."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.6 }
  },
  {
    id: GAME_TYPES.RPS,
    name: 'Rock Paper Scissors',
    description: 'Battle against the AI. Can you outsmart the machine?',
    icon: ['✊', '✋', '✌️'],
    category: GAME_CATEGORIES.QUICK,
    color: 'rose',
    difficulty: 'easy',
    maxPlayers: 1,
    guide: [
      "Pilih salah satu senjata Anda: Batu ✊, Kertas ✋, atau Gunting ✌️.",
      "Batu mengalahkan Gunting (Menghancurkan).",
      "Gunting mengalahkan Kertas (Memotong).",
      "Kertas mengalahkan Batu (Membungkus)."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.2 }
  },
  {
    id: GAME_TYPES.SIMON,
    name: 'Simon Says',
    description: 'Follow the memory patterns and sound sequence. Test your brain!',
    icon: ['🧠', '💡', '✨'],
    category: GAME_CATEGORIES.MEMORY,
    color: 'yellow',
    difficulty: 'hard',
    maxPlayers: 1,
    guide: [
      "Perhatikan Polanya: Mesin akan menyalakan lampu warna secara berurutan.",
      "Hafalkan: Tunggu sampai mesin selesai memutar seluruh urutan warnanya.",
      "Ulangi: Setelah giliran Anda, klik warna-warna tersebut dengan urutan yang sama."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.4 }
  },
  {
    id: GAME_TYPES.TYPING,
    name: 'Typing Test',
    description: 'Test your Words Per Minute (WPM) and accuracy with random paragraphs.',
    icon: ['⌨️'],
    category: GAME_CATEGORIES.QUICK,
    color: 'cyan',
    difficulty: 'medium',
    maxPlayers: 1,
    guide: [
      "Sebuah teks paragraf acak akan muncul di layar.",
      "Mulai ketik teks tersebut menggunakan keyboard fisik Anda.",
      "Hasil akhir akan menunjukkan Kecepatan (WPM) dan Akurasi (%) Anda."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.3 }
  },
  {
    id: GAME_TYPES.CONNECT4,
    name: 'Connect Four',
    description: 'Drop discs into the 7x6 grid. Features AI mode and 3-Player Chaos mode!',
    icon: ['🔴', '🟡', '🟢'],
    category: GAME_CATEGORIES.STRATEGY,
    color: 'indigo',
    difficulty: 'medium',
    maxPlayers: 3,
    guide: [
      "Papan terdiri dari 7 kolom dan 6 baris.",
      "Koin akan jatuh ke slot kosong paling bawah.",
      "Pemain pertama yang berhasil menyusun 4 koin miliknya secara berurutan menang!"
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.7 }
  },
  {
    id: GAME_TYPES.GAME2048,
    name: '2048',
    description: 'Slide and merge numbers to reach the legendary 2048 tile!',
    icon: ['🔢'],
    category: GAME_CATEGORIES.PUZZLE,
    color: 'orange',
    difficulty: 'hard',
    maxPlayers: 1,
    guide: [
      "Gunakan tombol Panah untuk menggeser kotak.",
      "Jika dua kotak dengan angka yang sama bertabrakan, mereka akan bergabung.",
      "Gabungkan terus hingga Anda berhasil menciptakan kotak berangka 2048."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.8 }
  },
  {
    id: GAME_TYPES.MINESWEEPER,
    name: 'Minesweeper',
    description: 'Use logic to find all the hidden mines without blowing up.',
    icon: ['💣'],
    category: GAME_CATEGORIES.PUZZLE,
    color: 'red',
    difficulty: 'hard',
    maxPlayers: 1,
    guide: [
      "Klik Kiri pada kotak untuk membukanya.",
      "Gunakan Klik Kanan untuk menancapkan Bendera 🚩 pada kotak bom.",
      "Buka semua kotak yang aman untuk menang."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.5 }
  },
  {
    id: GAME_TYPES.WORDLE,
    name: 'Wordle Clone',
    description: 'Guess the hidden 5-letter word in 6 tries.',
    icon: ['📝'],
    category: GAME_CATEGORIES.WORD,
    color: 'green',
    difficulty: 'medium',
    maxPlayers: 1,
    guide: [
      "Tebak kata rahasia (5 huruf) dalam 6 kali percobaan.",
      "🟩 HIJAU: Huruf BENAR dan posisi TEPAT.",
      "🟨 KUNING: Huruf BENAR tapi posisi SALAH.",
      "⬛ ABU-ABU: Huruf itu TIDAK ADA di kata rahasia."
    ],
    isActive: true,
    metadata: { totalPlays: 0, highestScore: 0, rating: 4.6 }
  }
];

async function seedGames(gameService) {
  console.log('🌱 Seeding all 12 games...');
  
  for (const gameData of GAMES_SEED_DATA) {
    try {
      await gameService.createGame(gameData);
      console.log(`✅ Created game: ${gameData.name}`);
    } catch (error) {
      // Jika sudah ada, kita update metadatanya saja agar tetap segar
      try {
        await gameService.updateGame(gameData.id, gameData);
        console.log(`🔄 Updated game: ${gameData.name}`);
      } catch (updateError) {
        console.log(`⚠️  Error seeding ${gameData.name}: ${updateError.message}`);
      }
    }
  }
  
  console.log('✨ Full game seeding completed!');
}

module.exports = { seedGames, GAMES_SEED_DATA };
