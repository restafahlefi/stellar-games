// Leaderboard Scheduler - Auto Reset Setiap 30 Hari

const cron = require('node-cron');

class LeaderboardScheduler {
  constructor(scoreRepository) {
    this.scoreRepository = scoreRepository;
    this.lastResetDate = new Date();
    this.resetInterval = 30; // days
  }

  /**
   * Start scheduler untuk reset leaderboard otomatis setiap 30 hari
   */
  start() {
    console.log('🕐 Starting Leaderboard Scheduler...');
    console.log(`📅 Next reset: ${this.getNextResetDate()}`);

    // Cek setiap hari jam 00:00
    cron.schedule('0 0 * * *', async () => {
      await this.checkAndResetIfNeeded();
    });

    // Cek juga setiap jam untuk safety
    cron.schedule('0 * * * *', async () => {
      await this.checkAndResetIfNeeded();
    });

    console.log('✅ Leaderboard Scheduler started successfully');
  }

  /**
   * Cek apakah sudah waktunya reset
   */
  async checkAndResetIfNeeded() {
    const now = new Date();
    const daysSinceLastReset = Math.floor((now - this.lastResetDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastReset >= this.resetInterval) {
      console.log(`🔄 Auto-resetting leaderboard (${daysSinceLastReset} days since last reset)`);
      await this.resetLeaderboard();
    }
  }

  /**
   * Reset leaderboard - Archive old data dan clear current
   */
  async resetLeaderboard() {
    try {
      const allScores = await this.scoreRepository.findAll();
      
      // Archive old scores (simpan ke history)
      const archiveData = {
        resetDate: new Date(),
        period: `${this.lastResetDate.toISOString()} - ${new Date().toISOString()}`,
        totalScores: allScores.length,
        scores: allScores
      };

      // Simpan archive (bisa ke file atau database terpisah)
      await this.archiveScores(archiveData);

      // Clear all current scores
      for (const score of allScores) {
        await this.scoreRepository.delete(score.id);
      }

      this.lastResetDate = new Date();
      
      console.log(`✅ Leaderboard reset completed. Archived ${allScores.length} scores.`);
      console.log(`📅 Next reset: ${this.getNextResetDate()}`);

      return {
        success: true,
        archived: allScores.length,
        nextReset: this.getNextResetDate()
      };
    } catch (error) {
      console.error('❌ Error resetting leaderboard:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Archive scores ke storage
   */
  async archiveScores(archiveData) {
    // Implementasi: Simpan ke file atau database terpisah
    const fs = require('fs').promises;
    const path = require('path');
    
    const archiveDir = path.join(__dirname, '../../../archives');
    const archiveFile = path.join(archiveDir, `leaderboard_${Date.now()}.json`);

    try {
      // Create directory if not exists
      await fs.mkdir(archiveDir, { recursive: true });
      
      // Save archive
      await fs.writeFile(archiveFile, JSON.stringify(archiveData, null, 2));
      
      console.log(`📦 Archived to: ${archiveFile}`);
    } catch (error) {
      console.error('❌ Error archiving scores:', error);
    }
  }

  /**
   * Get next reset date
   */
  getNextResetDate() {
    const nextReset = new Date(this.lastResetDate);
    nextReset.setDate(nextReset.getDate() + this.resetInterval);
    return nextReset.toISOString();
  }

  /**
   * Manual reset (untuk admin)
   */
  async manualReset() {
    console.log('🔧 Manual reset triggered by admin');
    return await this.resetLeaderboard();
  }

  /**
   * Get reset info
   */
  getResetInfo() {
    const now = new Date();
    const daysSinceLastReset = Math.floor((now - this.lastResetDate) / (1000 * 60 * 60 * 24));
    const daysUntilNextReset = this.resetInterval - daysSinceLastReset;

    return {
      lastResetDate: this.lastResetDate.toISOString(),
      nextResetDate: this.getNextResetDate(),
      daysSinceLastReset,
      daysUntilNextReset,
      resetInterval: this.resetInterval
    };
  }
}

module.exports = LeaderboardScheduler;
