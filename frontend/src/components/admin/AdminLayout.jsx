import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './AdminLayout.css';

/**
 * Admin Layout Component
 * Sidebar navigation + main content area
 */
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🎮 Admin Panel</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {sidebarOpen && (
              <>
                <div className="user-name">{user?.username}</div>
                <div className="user-role">{user?.role}</div>
              </>
            )}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
