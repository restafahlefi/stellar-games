import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

/**
 * Admin Dashboard - Overview Page
 * Shows key statistics and recent activity
 */
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>📊 Dashboard Overview</h1>
        <button className="btn-refresh" onClick={loadDashboard}>
          🔄 Refresh
        </button>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalGamesPlayed || 0}</div>
            <div className="stat-label">Games Played</div>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activePlayers || 0}</div>
            <div className="stat-label">Active Now</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.topPlayers?.length || 0}</div>
            <div className="stat-label">Top Players</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-grid">
        {/* Game Popularity */}
        <div className="dashboard-card">
          <h2>🎮 Game Popularity</h2>
          <div className="game-list">
            {stats?.gamePopularity?.slice(0, 10).map((game, index) => (
              <div key={game.gameId} className="game-item">
                <div className="game-rank">#{index + 1}</div>
                <div className="game-info">
                  <div className="game-name">{game.gameId}</div>
                  <div className="game-stats">
                    {game.plays} plays • {game.uniquePlayers} players
                  </div>
                </div>
                <div className="game-bar">
                  <div 
                    className="game-bar-fill"
                    style={{ 
                      width: `${(game.plays / stats.gamePopularity[0].plays) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Players */}
        <div className="dashboard-card">
          <h2>🏆 Top Players</h2>
          <div className="player-list">
            {stats?.topPlayers?.slice(0, 10).map((player, index) => (
              <div key={player.playerId} className="player-item">
                <div className={`player-rank rank-${index + 1}`}>
                  {index + 1}
                </div>
                <div className="player-info">
                  <div className="player-name">{player.playerName}</div>
                  <div className="player-stats">
                    {player.totalScore.toLocaleString()} pts • {player.gamesPlayed} games
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card">
        <h2>📋 Recent Activity</h2>
        <div className="activity-list">
          {stats?.recentActivity?.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === 'score' ? '🎮' : '👤'}
              </div>
              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
