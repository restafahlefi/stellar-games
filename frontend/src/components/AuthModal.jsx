import { useState } from 'react';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

/**
 * Auth Modal - Registration & Login
 * Handles user authentication with integrated admin detection
 */
export default function AuthModal({ onSuccess, onAdminSuccess }) {
  const [mode, setMode] = useState('login'); // Default to 'login' (not 'register')
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    if (username.length < 3 || username.length > 15) {
      setError('Username must be 3-15 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const result = await authService.register(username, password);
        
        // PERBAIKAN: Tidak auto-login setelah registrasi
        // Tampilkan pesan sukses dan switch ke login mode
        setRegistrationSuccess(true);
        setError('✅ Registration successful! Please login with your credentials.');
        setMode('login');
        setPassword(''); // Clear password untuk security
        setConfirmPassword('');
        
        // Tidak memanggil onSuccess() - user harus login manual
      } else if (isAdminMode) {
        // ADMIN LOGIN MODE
        const isValid = await adminService.testAuth(username, password);
        
        if (isValid) {
          // Setup admin credentials dan buka admin panel
          adminService.setCredentials(username, password);
          if (onAdminSuccess) {
            onAdminSuccess(username);
          }
        } else {
          throw new Error('Invalid admin credentials');
        }
      } else {
        // REGULAR USER LOGIN
        const result = await authService.login(username, password);
        onSuccess(result.user.username);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Video Background - Brighter & Less Blur */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.6)' }}
      >
        <source src="/86462-593059278.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay - Lighter */}
      <div className="absolute inset-0 bg-slate-950/40"></div>

      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Modal Card */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-slate-700/50 rounded-3xl p-4 sm:p-6 max-w-[90vw] sm:max-w-md w-full shadow-2xl shadow-blue-900/20 animate-scale-in">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl opacity-20 blur-xl animate-pulse"></div>
        
        {/* Content */}
        <div className="relative">
          {/* Icon Header */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg ${
                isAdminMode 
                  ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-red-900/50' 
                  : 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-blue-900/50'
              }`}>
                <span className="text-2xl sm:text-3xl">
                  {isAdminMode ? '👑' : mode === 'register' ? '📝' : '🔐'}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-black mb-2 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {isAdminMode ? 'Admin Panel' : mode === 'register' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-xs mb-4 font-bold text-center">
            {isAdminMode ? 'Admin authentication required' : mode === 'register' ? 'Register to save your progress' : 'Login to continue playing'}
          </p>

          {/* Error/Success Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-xl ${
              error.startsWith('✅') 
                ? 'bg-emerald-500/10 border border-emerald-500/20' 
                : 'bg-rose-500/10 border border-rose-500/20'
            }`}>
              <p className={`text-xs font-bold text-center ${
                error.startsWith('✅') ? 'text-emerald-400' : 'text-rose-400'
              }`}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                👤
              </div>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value.substring(0, 15))} 
                placeholder="Username (3-15 chars)" 
                className="w-full bg-slate-950/80 backdrop-blur-sm border-2 border-slate-700 rounded-xl pl-12 pr-12 py-3 text-white text-sm placeholder-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold transition-all" 
                autoFocus
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-bold">
                {username.length}/15
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                🔒
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password (min 8 chars)" 
                className="w-full bg-slate-950/80 backdrop-blur-sm border-2 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold transition-all" 
                disabled={loading}
              />
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && !isAdminMode && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  🔒
                </div>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm Password" 
                  className="w-full bg-slate-950/80 backdrop-blur-sm border-2 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold transition-all" 
                  disabled={loading}
                />
              </div>
            )}

            {/* Submit Button atau Admin Options */}
            {showAdminOption ? (
              // Admin Options - Muncul setelah admin login berhasil
              <div className="space-y-3">
                <div className="text-center text-sm text-emerald-400 font-bold mb-4">
                  👑 Admin Access Detected
                </div>
                
                <button
                  onClick={() => {
                    // Login sebagai user biasa
                    onSuccess(username);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white text-sm font-black rounded-xl transition-all shadow-xl shadow-blue-900/30 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>🎮</span>
                    <span>Login as Player</span>
                  </span>
                </button>
                
                <button
                  onClick={async () => {
                    // Setup admin credentials dan buka admin panel
                    adminService.setCredentials(username, password);
                    if (onAdminSuccess) {
                      onAdminSuccess(username);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 text-white text-sm font-black rounded-xl transition-all shadow-xl shadow-red-900/30 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>👑</span>
                    <span>Open Admin Panel</span>
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    setShowAdminOption(false);
                    setError('');
                  }}
                  className="w-full py-2 text-slate-400 hover:text-white text-sm font-bold transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            ) : (
              // Regular Submit Button
              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white text-sm font-black rounded-xl transition-all shadow-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAdminMode 
                    ? 'bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 shadow-red-900/30'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 shadow-blue-900/30'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>
                        {isAdminMode ? 'Authenticating Admin...' : mode === 'register' ? 'Creating Account...' : 'Logging In...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isAdminMode ? '👑' : mode === 'register' ? '📝' : '🚀'}
                      </span>
                      <span>
                        {isAdminMode ? 'Login as Admin' : mode === 'register' ? 'Create Account' : 'Login & Play'}
                      </span>
                    </>
                  )}
                </span>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isAdminMode 
                    ? 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600'
                    : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600'
                }`}></div>
              </button>
            )}
          </form>

          {/* Toggle Mode */}
          <div className="mt-4 text-center space-y-2">
            {!isAdminMode ? (
              <>
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                    setPassword('');
                    setConfirmPassword('');
                    setRegistrationSuccess(false); // Reset registration success state
                  }}
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors font-bold block"
                  disabled={loading}
                >
                  {mode === 'login' ? (
                    <>Don't have an account? <span className="text-blue-400">Register</span></>
                  ) : (
                    <>Already have an account? <span className="text-blue-400">Login</span></>
                  )}
                </button>
                
                {/* Admin Access Button */}
                <button
                  onClick={() => {
                    setIsAdminMode(true);
                    setMode('login');
                    setError('');
                    setPassword('');
                    setUsername('');
                  }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors font-bold flex items-center justify-center gap-1 mx-auto"
                  disabled={loading}
                >
                  <span>👑</span>
                  <span>Admin Access</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setMode('login');
                  setError('');
                  setPassword('');
                  setUsername('');
                }}
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors font-bold"
                disabled={loading}
              >
                ← Back to Player Login
              </button>
            )}
          </div>

          {/* Info Footer */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <div className="text-lg">
                {isAdminMode ? '👑' : 'ℹ️'}
              </div>
              <div>
                <p className={`text-xs font-bold mb-0.5 ${isAdminMode ? 'text-red-400' : 'text-blue-400'}`}>
                  {isAdminMode ? 'Admin Authentication' : 'Secure Authentication'}
                </p>
                {isAdminMode ? (
                  <div className="text-[10px] leading-relaxed text-slate-500 space-y-1">
                    <div>Default: <span className="text-slate-400 font-mono">admin / stellar2026!</span></div>
                    <div>Custom: <span className="text-slate-400 font-mono">adminresta / adminresta123</span></div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-[10px] leading-relaxed">
                    Your password is encrypted and stored securely. Join the <span className="text-emerald-400 font-bold">Global Leaderboard</span>!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
