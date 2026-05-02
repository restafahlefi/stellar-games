import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

/**
 * Admin Analytics Page
 * Game-specific analytics and insights
 */
function AdminAnalytics() {
  const [selectedGame, setSelectedGame] = useState('snake');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const games = [
    'snake', 'pacman', 'flappybird', 'game2048', 'memory',
    'tictactoe', 'connect4', 'rps', 'simon', 'typing',
    'minesweeper', 'wordle'
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedGame]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getGameAnalytics(selectedGame);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>📈 Game Analytics</h1>
      </header>

      {/* Game Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <select 
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(22, 33, 62, 0.6)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          {games.map(game => (
            <option key={game} value={game}>
              {game.charAt(0).toUpperCase() + game.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : analytics ? (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.totalPlays}</div>
                <div className="stat-label">Total Plays</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.uniquePlayers}</div>
                <div className="stat-label">Unique Players</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.avgScore}</div>
                <div className="stat-label">Avg Score</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.highestScore}</div>
                <div className="stat-label">Highest Score</div>
              </div>
            </div>
          </div>

          {/* Top Players */}
          <div className="dashboard-card" style={{ marginTop: '2rem' }}>
            <h2>🏆 Top Players</h2>
            <div className="player-list">
              {analytics.topPlayers?.map((player, index) => (
                <div key={player.playerId} className="player-item">
                  <div className={`player-rank rank-${index + 1}`}>
                    {index + 1}
                  </div>
                  <div className="player-info">
                    <div className="player-name">{player.playerName}</div>
                    <div className="player-stats">
                      Best: {player.bestScore} • Plays: {player.plays}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
}

export default AdminAnalytics;
