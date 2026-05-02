# 🎮 STELLAR GAMES - ADMIN PANEL GUIDE

## 📋 OVERVIEW

Admin Panel adalah dashboard khusus untuk administrator yang memungkinkan Anda mengelola seluruh sistem Stellar Games dari satu tempat.

**URL Admin Panel:** `https://stellargame.up.railway.app/admin`

---

## 🔐 LOGIN CREDENTIALS

**Username:** `adminresta`  
**Password:** `adminresta123`

⚠️ **PENTING:** Ganti password setelah login pertama kali!

---

## 🎯 FITUR-FITUR ADMIN PANEL

### 1. 📊 DASHBOARD (Overview)

**URL:** `/admin`

**Fitur:**
- **Real-time Statistics:**
  - Total Users (semua registered users)
  - Total Games Played (all time)
  - Active Players (last 5 minutes)
  - Top Players count

- **Game Popularity Chart:**
  - Menampilkan 10 game paling populer
  - Jumlah plays dan unique players per game
  - Visual bar chart untuk perbandingan

- **Top Players Leaderboard:**
  - Top 10 players berdasarkan total score
  - Total score dan games played
  - Ranking dengan badge (Gold, Silver, Bronze)

- **Recent Activity Log:**
  - 10 aktivitas terakhir
  - Score submissions
  - New user registrations
  - Timestamp untuk setiap activity

**Actions:**
- 🔄 Refresh button untuk update data manual

---

### 2. 👥 USER MANAGEMENT

**URL:** `/admin/users`

**Fitur:**
- **View All Users:**
  - Table dengan semua user data
  - Username, Email, Role, Status, Games, Score, Join Date
  - Real-time status indicator (Active/Inactive)

- **Search & Filter:**
  - Search by username atau email
  - Filter by role (All, Users, Admins)
  - Real-time filtering

- **User Statistics:**
  - Total users
  - Active users (last 5 minutes)
  - Total admins

- **Edit User:**
  - Change username
  - Change email
  - Change role (User ↔ Admin)
  - Modal dialog dengan form validation

- **Delete User:**
  - Delete user dan semua data terkait (scores, achievements)
  - Confirmation dialog
  - Cannot delete admin users (safety)

- **Export Data:**
  - Export user list ke CSV file
  - Includes all user data

**Actions:**
- ✏️ Edit button per user
- 🗑️ Delete button per user (disabled for admins)
- 📥 Export CSV button

---

### 3. 🏆 LEADERBOARD MANAGEMENT

**URL:** `/admin/leaderboard`

**Fitur:**
- **Reset Leaderboard:**
  - Reset all games atau specific game
  - Auto-archive data sebelum reset
  - Confirmation dialog dengan warning

- **View Archives:**
  - List semua archived leaderboards
  - Download archive data
  - Restore dari archive (coming soon)

**Available Reset Options:**
- 🔄 Reset All Games
- 🐍 Reset Snake
- 👻 Reset Pac-Man
- (Dan game lainnya)

**Safety Features:**
- Confirmation dialog sebelum reset
- Auto-backup ke archive
- Cannot be undone warning

---

### 4. 📈 GAME ANALYTICS

**URL:** `/admin/analytics`

**Fitur:**
- **Game Selector:**
  - Dropdown untuk pilih game
  - 12 games available

- **Per-Game Statistics:**
  - Total Plays
  - Unique Players
  - Average Score
  - Highest Score

- **Top Players per Game:**
  - Top 10 players untuk game yang dipilih
  - Best score dan total plays
  - Ranking dengan visual indicators

**Supported Games:**
- Snake, Pac-Man, Flappy Bird, 2048, Memory Match
- Tic Tac Toe, Connect Four, Rock Paper Scissors
- Simon Says, Typing Test, Minesweeper, Wordle

---

### 5. ⚙️ SYSTEM SETTINGS

**URL:** `/admin/settings`

**Fitur:**
- **General Settings:**
  - Site Name configuration
  - Allow new registrations toggle
  - Maintenance mode toggle

- **Backup Status:**
  - Last backup timestamp
  - GitHub backup status
  - Auto-backup indicator

- **System Information:**
  - Version number
  - Environment (Production/Development)
  - Server uptime

**Actions:**
- 💾 Save Settings button

---

## 🎨 DESIGN & UI

### **Theme:**
- Dark theme dengan gradient accents
- Konsisten dengan game theme
- Modern glassmorphism effects

### **Color Scheme:**
- **Primary:** Indigo (#6366f1)
- **Success:** Green (#10b981)
- **Warning:** Orange (#f59e0b)
- **Danger:** Red (#ef4444)
- **Background:** Dark blue gradients

### **Layout:**
- **Sidebar Navigation:** Fixed left sidebar dengan icons
- **Collapsible:** Sidebar bisa di-collapse untuk lebih banyak space
- **Responsive:** Mobile-friendly dengan auto-collapse pada mobile
- **Smooth Transitions:** Semua interactions dengan smooth animations

---

## 🔒 SECURITY FEATURES

### **Authentication:**
- JWT token-based authentication
- 30-day token expiry
- Auto-logout on token expiry

### **Authorization:**
- Role-based access control (RBAC)
- Admin-only routes protected
- Middleware validation pada setiap request

### **Data Protection:**
- Cannot delete admin users
- Confirmation dialogs untuk destructive actions
- Auto-backup sebelum data deletion
- Audit trail untuk admin actions

---

## 📱 RESPONSIVE DESIGN

### **Desktop (>768px):**
- Full sidebar dengan labels
- Multi-column layouts
- Large tables dengan all columns

### **Mobile (<768px):**
- Collapsed sidebar (icons only)
- Single-column layouts
- Horizontal scroll untuk tables
- Touch-optimized buttons

---

## 🚀 DEPLOYMENT

### **Backend API Endpoints:**

```
GET    /api/v1/admin/dashboard          - Dashboard stats
GET    /api/v1/admin/users               - All users
GET    /api/v1/admin/users/:id           - User details
PUT    /api/v1/admin/users/:id           - Update user
DELETE /api/v1/admin/users/:id           - Delete user
GET    /api/v1/admin/analytics/games/:id - Game analytics
POST   /api/v1/admin/leaderboard/reset   - Reset leaderboard
GET    /api/v1/admin/logs                - System logs
```

### **Frontend Routes:**

```
/admin                  - Dashboard
/admin/users            - User Management
/admin/leaderboard      - Leaderboard Management
/admin/analytics        - Game Analytics
/admin/settings         - System Settings
```

---

## 📊 DATA EXPORT

### **CSV Export Features:**
- Export user list dengan all data
- Export leaderboard data
- Export game analytics
- One-click download

### **Export Format:**
```csv
username,email,role,totalGames,totalScore,createdAt
player1,email@example.com,user,50,12345,2026-05-03
```

---

## 🔧 TROUBLESHOOTING

### **Cannot Access Admin Panel:**
1. Pastikan sudah login dengan admin account
2. Check role di users.json (harus "admin")
3. Clear browser cache dan cookies
4. Try incognito/private mode

### **Data Not Loading:**
1. Check browser console untuk errors
2. Verify backend API is running
3. Check network tab untuk failed requests
4. Refresh page atau click Refresh button

### **Permission Denied:**
1. Verify user role adalah "admin"
2. Check JWT token belum expired
3. Re-login jika perlu

---

## 📝 CHANGELOG

### **Version 1.0.0 (2026-05-03)**
- ✅ Initial release
- ✅ Dashboard with real-time stats
- ✅ User management (CRUD)
- ✅ Leaderboard reset functionality
- ✅ Game analytics per-game
- ✅ System settings page
- ✅ CSV export functionality
- ✅ Responsive design
- ✅ Dark theme UI

---

## 🎯 FUTURE ENHANCEMENTS

### **Planned Features:**
- [ ] Advanced analytics dengan charts (Chart.js/Recharts)
- [ ] Activity logs dengan filtering
- [ ] Bulk user operations
- [ ] Email notifications
- [ ] Achievement management
- [ ] Daily challenge editor
- [ ] Rate limiting configuration
- [ ] Backup scheduling UI
- [ ] User ban/unban functionality
- [ ] IP blocking
- [ ] API rate limit monitoring
- [ ] Real-time notifications
- [ ] Dark/Light theme toggle

---

## 💡 TIPS & BEST PRACTICES

### **Security:**
1. **Ganti password default** setelah first login
2. **Jangan share** admin credentials
3. **Logout** setelah selesai menggunakan admin panel
4. **Backup data** sebelum melakukan reset atau delete

### **Performance:**
1. **Refresh data** secara berkala untuk stats terbaru
2. **Export data** untuk backup offline
3. **Monitor active players** untuk detect issues
4. **Check system logs** untuk errors

### **User Management:**
1. **Verify user data** sebelum delete
2. **Use search** untuk find specific users
3. **Filter by role** untuk manage admins
4. **Export CSV** untuk reporting

---

## 📞 SUPPORT

Jika ada pertanyaan atau issues:
1. Check troubleshooting section
2. Check browser console untuk errors
3. Verify backend logs
4. Contact system administrator

---

## 🎉 SELAMAT MENGGUNAKAN ADMIN PANEL!

Admin Panel Stellar Games dirancang untuk memberikan Anda kontrol penuh atas sistem dengan interface yang intuitif dan modern. Semua fitur sudah terintegrasi dan siap digunakan!

**Happy Managing! 🚀**
