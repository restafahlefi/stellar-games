# 👑 Stellar Games - Admin Guide

## 🔐 **CARA AKSES ADMIN PANEL**

### **1. Buka Website**
- Kunjungi: https://stellargame.up.railway.app/
- Login dengan akun biasa terlebih dahulu

### **2. Akses Admin Panel**
- Tekan kombinasi keyboard: **`Ctrl + Shift + A`**
- Atau lihat hint di bagian atas halaman utama

### **3. Login Admin**
- **Username**: `admin`
- **Password**: `stellar2026!`

---

## 🎯 **FITUR ADMIN PANEL**

### **📊 Dashboard Tab**
- **System Statistics**: Total users, active players, games played
- **Server Information**: Uptime, memory usage, Node version
- **Rate Limiting Stats**: Blocked IPs, blocked users
- **Real-time Monitoring**: Live system status

### **👥 Users Tab**
- **View All Users**: List semua registered users
- **User Details**: Username, role, created date, last login, status
- **Delete Users**: Hapus user (kecuali admin users)
- **User Management**: Monitor user activity

### **💾 Backup Tab**
- **Backup Status**: Environment Variables, GitHub, Local File
- **Force Backup**: Manual backup ke semua services
- **Verify Backups**: Check integrity semua backups
- **Backup Information**: Penjelasan sistem backup

---

## 🛡️ **SISTEM BACKUP OTOMATIS**

### **Environment Variables Backup (PRIMARY)**
- ✅ **Otomatis**: Backup setiap kali ada perubahan user data
- ✅ **Persistent**: Survive Railway redeployments
- ✅ **Compressed**: Data dikompres untuk efisiensi
- ✅ **Chunked**: Split data besar menjadi beberapa chunks

### **GitHub Backup (SECONDARY)**
- ✅ **Version History**: Menyimpan history perubahan
- ✅ **External Storage**: Backup di luar Railway
- ✅ **Automatic**: Triggered bersamaan dengan ENV backup

### **Local File Backup (TERTIARY)**
- ⚠️ **Ephemeral**: Hilang saat Railway redeploy
- ✅ **Fast Access**: Akses cepat untuk operasi normal
- ✅ **JSON Format**: Human-readable format

---

## 🚨 **RATE LIMITING SYSTEM**

### **Registration Limits**
- **3 attempts per 15 minutes per IP**
- **Automatic IP blocking** untuk repeated violations
- **30 minutes block duration**

### **Login Limits**
- **10 attempts per 15 minutes per IP**
- **Username-based limiting** untuk brute force protection
- **15 minutes block duration**

### **API Limits**
- **100 requests per minute per IP**
- **General API protection**
- **5 minutes block duration**

---

## 🔧 **TROUBLESHOOTING**

### **User Data Hilang Setelah Deploy**
1. Buka Admin Panel (`Ctrl+Shift+A`)
2. Masuk ke **Backup Tab**
3. Klik **🔍 Verify Backups**
4. Jika Environment backup OK, data akan auto-restore

### **Rate Limiting Issues**
1. Buka Admin Panel
2. Lihat **Rate Limiting Stats** di Dashboard
3. Reset specific IP/user di **Rate Limit Management**

### **Backup Verification**
1. **Force Backup**: Trigger manual backup
2. **Verify Backups**: Check integrity
3. **Refresh Status**: Update backup information

---

## 📱 **MOBILE ACCESS**

Admin Panel **responsive** dan bisa diakses dari mobile:
- **Touch-friendly**: Semua button mudah di-tap
- **Responsive Design**: Otomatis adjust ke screen size
- **Mobile Keyboard**: Shortcut `Ctrl+Shift+A` bisa pakai external keyboard

---

## 🔒 **SECURITY FEATURES**

### **Admin Authentication**
- **Basic Auth**: Username/password protection
- **Session-based**: Tidak menyimpan credentials di localStorage
- **Secure Headers**: Proper authorization headers

### **Activity Logging**
- **Admin Actions**: Semua admin actions di-log
- **User Management**: Track user deletions/updates
- **Backup Operations**: Log backup/restore activities

---

## 📈 **MONITORING & ALERTS**

### **Real-time Stats**
- **Active Players**: Live count
- **System Health**: Server status
- **Memory Usage**: Resource monitoring
- **Uptime Tracking**: Server availability

### **Backup Health**
- **Last Backup Time**: Timestamp tracking
- **Backup Size**: Data compression stats
- **Integrity Checks**: Automatic verification

---

## 🚀 **PRODUCTION TIPS**

### **Regular Maintenance**
1. **Weekly**: Check backup status
2. **Monthly**: Review user activity
3. **As Needed**: Reset rate limits for legitimate users

### **Performance Monitoring**
- Monitor **Memory Usage** di Dashboard
- Check **Active Players** vs **Total Users**
- Review **Rate Limiting Stats** untuk abuse patterns

### **Data Management**
- **User Cleanup**: Delete inactive/spam accounts
- **Backup Verification**: Regular integrity checks
- **System Health**: Monitor server performance

---

## 📞 **SUPPORT**

Jika ada masalah dengan admin panel:
1. Check browser console untuk error messages
2. Verify admin credentials
3. Test keyboard shortcut `Ctrl+Shift+A`
4. Check network connection untuk API calls

**Default Admin Credentials:**
- Username: `admin`
- Password: `stellar2026!`

⚠️ **PENTING**: Ganti password default di production!