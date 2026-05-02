import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

/**
 * Admin Leaderboard Management
 * Reset leaderboard, view archives
 */
function AdminLeaderboard() {
  const [loading, setLoading] = useState(false);

  const handleReset = async (gameId = null) => {
    const gameName = gameId || 'ALL GAMES';
    if (!confirm(`Reset leaderboard for ${gameName}? This will archive current data.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.resetLeaderboard(gameId);
      if (response.success) {
        alert(response.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>🏆 Leaderboard Management</h1>
      </header>

      <div className="dashboard-card">
        <h2>Reset Leaderboard</h2>
        <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.6)' }}>
          Reset leaderboard data. All scores will be archived before deletion.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-refresh"
            onClick={() => handleReset(null)}
            disabled={loading}
          >
            🔄 Reset All Games
          </button>
          <button 
            className="btn-refresh"
            onClick={() => handleReset('snake')}
            disabled={loading}
          >
            Reset Snake
          </button>
          <button 
            className="btn-refresh"
            onClick={() => handleReset('pacman')}
            disabled={loading}
          >
            Reset Pac-Man
          </button>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h2>📦 Archives</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Archive viewing feature coming soon...
        </p>
      </div>
    </div>
  );
}

export default AdminLeaderboard;
