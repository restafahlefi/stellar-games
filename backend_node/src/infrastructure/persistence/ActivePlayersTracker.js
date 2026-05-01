// Active Players Tracker - In-Memory
// Tracks which players are currently online based on heartbeat

class ActivePlayersTracker {
  constructor() {
    // Map: playerName -> lastHeartbeat timestamp
    this.activePlayers = new Map();
    
    // Cleanup inactive players every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  // Record player heartbeat
  heartbeat(playerName) {
    if (!playerName || playerName.trim() === '') return;
    
    this.activePlayers.set(playerName, Date.now());
  }

  // Get count of active players (heartbeat within last 60 seconds)
  getActiveCount() {
    this.cleanup();
    return this.activePlayers.size;
  }

  // Get list of active player names
  getActivePlayers() {
    this.cleanup();
    return Array.from(this.activePlayers.keys());
  }

  // Remove specific player (for explicit disconnect)
  removePlayer(playerName) {
    if (!playerName || playerName.trim() === '') return;
    
    const wasActive = this.activePlayers.has(playerName);
    this.activePlayers.delete(playerName);
    
    if (wasActive) {
      console.log(`🔴 Player disconnected: ${playerName}`);
    }
  }

  // Remove players with no heartbeat in last 60 seconds
  cleanup() {
    const now = Date.now();
    const timeout = 60000; // 60 seconds

    for (const [playerName, lastHeartbeat] of this.activePlayers.entries()) {
      if (now - lastHeartbeat > timeout) {
        this.activePlayers.delete(playerName);
      }
    }
  }

  // Clear all (for testing)
  clear() {
    this.activePlayers.clear();
  }

  // Stop cleanup interval
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
const activePlayersTracker = new ActivePlayersTracker();

module.exports = activePlayersTracker;
