import React, { useState } from 'react';
import { adminService } from '../services/adminService';
import AdminPanel from './AdminPanel';

/**
 * Dedicated Admin Login Page
 * Halaman login admin terpisah yang bisa diakses via /admin
 */
function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      } else {
        setError('Invalid admin credentials');
      }
    } catch (error) {
      setError('Authentication failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // If authenticated, show admin panel
  if (isAuthenticated) {
    return <AdminPanel onClose={() => setIsAuthenticated(false)} />;
  }

  // Admin login form
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative bg-slate-900 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">👑</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Stellar Games Administration
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Admin Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              placeholder="Enter admin username"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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
            className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🔐</span>
                Login to Admin Panel
              </span>
            )}
          </button>
        </form>

        {/* Admin Credentials Info */}
        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
          <h3 className="text-sm font-bold text-slate-300 mb-2">📋 Available Admin Accounts:</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Default Admin:</span>
              <span className="text-slate-300 font-mono">admin / stellar2026!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Custom Admin:</span>
              <span className="text-slate-300 font-mono">adminresta / adminresta123</span>
            </div>
          </div>
        </div>

        {/* Back to Website */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
          >
            ← Back to Stellar Games
          </a>
        </div>

        {/* Keyboard Shortcut Info */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/30 px-3 py-1 rounded-full text-xs text-slate-500">
            <span>💡 Tip: Use</span>
            <kbd className="bg-slate-700 px-2 py-0.5 rounded font-mono">Ctrl+Shift+A</kbd>
            <span>from main site</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;