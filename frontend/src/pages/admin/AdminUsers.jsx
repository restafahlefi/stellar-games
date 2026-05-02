import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './AdminUsers.css';

/**
 * Admin Users Page
 * Manage all users - view, edit, delete
 */
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(user.id);
      alert('User deleted successfully');
      loadUsers();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      username: formData.get('username'),
      email: formData.get('email'),
      role: formData.get('role')
    };

    try {
      await adminService.updateUser(selectedUser.id, updates);
      alert('User updated successfully');
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  const handleExport = () => {
    adminService.exportToCSV(filteredUsers, 'users.csv');
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="admin-users"><div className="loading">Loading users...</div></div>;
  }

  return (
    <div className="admin-users">
      <header className="page-header">
        <h1>👥 User Management</h1>
        <button className="btn-export" onClick={handleExport}>
          📥 Export CSV
        </button>
      </header>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="filter-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Stats */}
      <div className="user-stats">
        <div className="stat">Total: {users.length}</div>
        <div className="stat">Active: {users.filter(u => u.status === 'active').length}</div>
        <div className="stat">Admins: {users.filter(u => u.role === 'admin').length}</div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Games</th>
              <th>Score</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="username">{user.username}</td>
                <td>{user.email || '-'}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status status-${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.totalGames}</td>
                <td>{user.totalScore.toLocaleString()}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  <button 
                    className="btn-action btn-edit"
                    onClick={() => handleEdit(user)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-action btn-delete"
                    onClick={() => handleDelete(user)}
                    disabled={user.role === 'admin'}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Edit User</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  defaultValue={selectedUser.username}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedUser.email || ''}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" defaultValue={selectedUser.role}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
