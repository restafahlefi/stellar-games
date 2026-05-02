import React, { useState, useEffect } from 'react';
import { adminBypassService } from '../services/adminBypassService';

/**
 * Admin Panel Bypass Component - EMERGENCY SOLUTION
 * Simple admin interface dengan bypass authentication
 */
function AdminPanelBypass({ onClose }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [backupStatus, setBackupStatus] = useState(null);

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsData, usersData, backupData] = await Promise.all([
        adminBypassService.getStats(),
        adminBypassService.getUsers(),
        adminBypassService.getBackupStatus()
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

  // Load data on mount
  useEffect(() => {
    if (adminBypassService.isLoggedIn()) {
      loadDashboardData();
    }
  }, []);

  /**
   * Handle force backup
   */
  const handleForceBackup = async () => {
    try {
      setLoading(true);
      await adminBypassService.forceBackup();
      await loadDashboardData(); // Refresh data
      alert('✅ Manual backup completed successfully!');
    } catch (error) {
      alert('❌ Backup failed: ' + error.message);
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
      await adminBypassService.deleteUser(userId);
      await loadDashboardData(); // Refresh data
      alert(`✅ User "${username}" deleted successfully!`);
    } catch (error) {
      alert('❌ Delete failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    adminBypassService.logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚨 Admin Panel (Emergency Access)</h1>
          <div className="flex gap-2">
            <button 
              onClick={handleLogout}
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl font-bold"
            >
              Logout
            </button>
            <button 
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
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
                  ? 'bg-orange-600 text-white' 
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
            <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">👥 User Management</h2>
              <button
                onClick={loadDashboardData}
                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl font-bold"
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
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
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
                  <h4 className="font-bold text-orange-400 mb-2">🌐 Environment Variables Backup</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className={`ml-2 font-bold ${backupStatus.environmentBackup.exists ? 'text-green-400' : 'text-red-400'}`}>
                        {backupStatus.environmentBackup.exists ? '✅ Active' : '❌ Not Found'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Users:</span>
                      <span className="ml-2 text-white font-bold">{backupStatus.totalUsers || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Backup Actions */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold mb-3">⚡ Backup Actions</h3>
              
              <div className="flex gap-4">
                <button
                  onClick={handleForceBackup}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 px-4 py-2 rounded-xl font-bold"
                >
                  🔄 Force Backup
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
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanelBypass;