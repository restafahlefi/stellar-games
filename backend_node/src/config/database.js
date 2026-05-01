// Database configuration
// Untuk saat ini menggunakan in-memory storage
// Bisa diganti dengan MongoDB, PostgreSQL, dll

class InMemoryDatabase {
  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.scores = new Map();
    this.sessions = new Map();
    this.lastResetDate = new Date(); // Kapan season dimulai
    this.SEASON_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Hari dalam Milidetik
  }

  // Fungsi pengecekan musim otomatis
  checkAndResetSeason() {
    const now = new Date();
    const timeDiff = now - this.lastResetDate;

    if (timeDiff >= this.SEASON_DURATION_MS) {
      console.log('--- SEASON RESET: Memulai Musim Baru ---');
      this.scores.clear(); // Hapus semua skor untuk musim baru
      this.lastResetDate = now; // Update tanggal reset terakhir
      return true;
    }
    return false;
  }

  // Generic CRUD operations
  create(collection, id, data) {
    if (collection === 'scores') this.checkAndResetSeason();
    this[collection].set(id, { ...data, id, createdAt: new Date() });
    return this[collection].get(id);
  }

  findById(collection, id) {
    return this[collection].get(id);
  }

  findAll(collection) {
    if (collection === 'scores') this.checkAndResetSeason();
    return Array.from(this[collection].values());
  }

  update(collection, id, data) {
    const existing = this[collection].get(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this[collection].set(id, updated);
    return updated;
  }

  delete(collection, id) {
    return this[collection].delete(id);
  }

  query(collection, predicate) {
    if (collection === 'scores') this.checkAndResetSeason();
    return Array.from(this[collection].values()).filter(predicate);
  }
}

// Singleton instance
const db = new InMemoryDatabase();

module.exports = db;
