import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

/**
 * Admin Panel Component
 * Simple admin interface untuk system management
 */
function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [backupStatus, setBackupStatus] = useState(null);

  /**
   * Handle admin login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isValid = await adminService.testAuth(credentials.username, credentials.password);
      
      if (isValid) {
        setIsAuthenticated(true);
        await loadDashboardData();
      } else {
        setError('Invalid admin credentials');
      }
    } catch (error) {
      setError('Authentication failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, backupData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getBackupStatus()
      ]);
      
      setStats(statsData);
      setUsers(usersData);
      setBackupStatus(backupData);
    } catch (error) {
      setError('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle force backup
   */
  const handleForceBackup = async () => {
    try {
      setLoading(true);
      await adminService.forceBackup();
      await loadDashboardData(); // Refresh data
      alert('✅ Manual backup completed successfully!');
    } catch (error) {
      alert('❌ Backup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle verify backups
   */
  const handleVerifyBackups = async () => {
    try {
      setLoading(true);
      const results = await adminService.verifyBackups();
      
      const status = Object.entries(results)
        .map(([service, isValid]) => `${service}: ${isValid ? '✅' : '❌'}`)
        .join('\n');
        
      alert(`Backup Verification Results:\n${status}`);
    } catch (error) {
      alert('❌ Verification failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete user
   */
  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await adminService.deleteUser(userId);
      await loadDashboardData(); // Refresh data
      alert(`✅ User "${username}" deleted successfully!`);
    } catch (error) {
      alert('❌ Delete failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">👑 Admin Panel</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-xs text-slate-500 text-center">
            Default: admin / stellar2026!
          </div>
        </div>
      </div>
    );
  }

  // Main admin panel
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">👑 Stellar Games Admin Panel</h1>
          <button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'users', label: '👥 Users' },
            { id: 'backup', label: '💾 Backup' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-slate-400">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">📊 System Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <h3 className="text-slate-400 text-sm font-bold">Total Users</h3>
                <p className="text-2xl font-bold text-white">{stats.totalUsers || 0}</p>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <h3 className="text-slate-400 text-sm font-bold">Active Players</h3>
                <p className="text-2xl font-bold text-emerald-400">{stats.activePlayers || 0}</p>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <h3 className="text-slate-400 text-sm font-bold">Total Games Played</h3>
                <p className="text-2xl font-bold text-blue-400">{stats.totalGamesPlayed || 0}</p>
              </div>
            </div>

            {/* Server Info */}
            {stats.serverInfo && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <h3 className="text-lg font-bold mb-3">🖥️ Server Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Uptime:</span>
                    <span className="ml-2 text-white">{Math.floor(stats.serverInfo.uptime / 3600)}h {Math.floor((stats.serverInfo.uptime % 3600) / 60)}m</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Memory:</span>
                    <span className="ml-2 text-white">{Math.round(stats.serverInfo.memory.used / 1024 / 1024)}MB</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Node Version:</span>
                    <span className="ml-2 text-white">{stats.serverInfo.nodeVersion}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Platform:</span>
                    <span className="ml-2 text-white">{stats.serverInfo.platform}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rate Limiting Stats */}
            {stats.rateLimiting && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <h3 className="text-lg font-bold mb-3">🛡️ Rate Limiting</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Total IPs:</span>
                    <span className="ml-2 text-white">{stats.rateLimiting.totalIPs}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Blocked IPs:</span>
                    <span className="ml-2 text-red-400">{stats.rateLimiting.blockedIPs}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Users:</span>
                    <span className="ml-2 text-white">{stats.rateLimiting.totalUsers}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Blocked Users:</span>
                    <span className="ml-2 text-red-400">{stats.rateLimiting.blockedUsers}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">👥 User Management</h2>
              <button
                onClick={loadDashboardData}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Username</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Last Login</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id} className={index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                        <td className="px-4 py-3 text-white font-bold">{user.username}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.role === 'admin' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {user.status || 'inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && backupStatus && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">💾 Backup Management</h2>

            {/* Backup Status */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold mb-3">📊 Backup Status</h3>
              
              {backupStatus.environmentBackup && (
                <div className="mb-4">
                  <h4 className="font-bold text-blue-400 mb-2">🌐 Environment Variables Backup</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className={`ml-2 font-bold ${backupStatus.environmentBackup.exists ? 'text-green-400' : 'text-red-400'}`}>
                        {backupStatus.environmentBackup.exists ? '✅ Active' : '❌ Not Found'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Chunks:</span>
                      <span className="ml-2 text-white">{backupStatus.environmentBackup.chunkCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Backup:</span>
                      <span className="ml-2 text-white">
                        {backupStatus.environmentBackup.timestamp 
                          ? new Date(backupStatus.environmentBackup.timestamp).toLocaleString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Age:</span>
                      <span className="ml-2 text-white">
                        {backupStatus.environmentBackup.age 
                          ? `${Math.round(backupStatus.environmentBackup.age / 1000)}s ago`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm">
                <span className="text-slate-400">Total Users:</span>
                <span className="ml-2 text-white font-bold">{backupStatus.totalUsers || 0}</span>
              </div>
            </div>

            {/* Backup Actions */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold mb-3">⚡ Backup Actions</h3>
              
              <div className="flex gap-4">
                <button
                  onClick={handleForceBackup}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-xl font-bold"
                >
                  🔄 Force Backup
                </button>
                
                <button
                  onClick={handleVerifyBackups}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 px-4 py-2 rounded-xl font-bold"
                >
                  🔍 Verify Backups
                </button>
                
                <button
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 px-4 py-2 rounded-xl font-bold"
                >
                  🔄 Refresh Status
                </button>
              </div>
            </div>

            {/* Backup Information */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold mb-3">ℹ️ Backup Information</h3>
              <div className="text-sm text-slate-300 space-y-2">
                <p><strong>Environment Variables:</strong> Primary backup method that survives Railway redeployments</p>
                <p><strong>GitHub Backup:</strong> Secondary backup for version history and external storage</p>
                <p><strong>Local File:</strong> Tertiary backup stored locally (ephemeral on Railway)</p>
                <p><strong>Auto-Backup:</strong> Triggered automatically on every user data change</p>
                <p><strong>Auto-Restore:</strong> Automatically restores data on server startup if local file is missing</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;