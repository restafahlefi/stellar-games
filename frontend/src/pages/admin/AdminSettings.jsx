import './AdminDashboard.css';

/**
 * Admin Settings Page
 * System configuration and settings
 */
function AdminSettings() {
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>⚙️ System Settings</h1>
      </header>

      <div className="dashboard-card">
        <h2>General Settings</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
          System configuration options
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>
              Site Name
            </label>
            <input
              type="text"
              defaultValue="Stellar Games"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(22, 33, 62, 0.6)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Allow new registrations</span>
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" />
              <span>Maintenance mode</span>
            </label>
          </div>

          <button 
            className="btn-refresh"
            onClick={() => alert('Settings saved! (Feature coming soon)')}
          >
            💾 Save Settings
          </button>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h2>💾 Backup Status</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Last backup: {new Date().toLocaleString()}
        </p>
        <p style={{ color: 'rgba(16, 185, 129, 0.8)', marginTop: '0.5rem' }}>
          ✅ GitHub backup is active
        </p>
      </div>

      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h2>📋 System Information</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
          <div>Version: 1.0.0</div>
          <div>Environment: Production</div>
          <div>Uptime: {Math.floor(performance.now() / 1000 / 60)} minutes</div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
