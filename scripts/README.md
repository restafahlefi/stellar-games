# 🔧 Scripts - Stellar Games

Helper scripts untuk development, testing, dan deployment.

---

## 📝 **Available Scripts**

### **🐳 Docker Scripts**

#### `start-docker.bat`
Start semua services di background dan buka browser otomatis.

```bash
# Double click atau jalankan di terminal
start-docker.bat
```

**Apa yang terjadi:**
- ✅ Build dan start semua services di background
- ✅ Browser otomatis terbuka ke http://localhost:5173
- ✅ Services tetap running setelah terminal ditutup

---

#### `stop-docker.bat`
Stop semua running services.

```bash
# Double click atau jalankan di terminal
stop-docker.bat
```

**Apa yang terjadi:**
- ✅ Stop semua containers
- ✅ Remove containers
- ✅ Clean up resources

---

### **🧪 Test Scripts**

#### `test_complete_system.js`
Complete system test untuk semua features.

**Tests:**
- ✅ Backend health check
- ✅ API endpoints
- ✅ Database operations
- ✅ Game functionality
- ✅ Leaderboard system
- ✅ Player tracking

**Usage:**
```bash
node scripts/test_complete_system.js
```

---

#### `test_realtime_verification.js`
Real-time system verification test.

**Tests:**
- ✅ Real-time stats updates
- ✅ Leaderboard auto-refresh
- ✅ Player online tracking
- ✅ Heartbeat system
- ✅ Socket.IO connections

**Usage:**
```bash
node scripts/test_realtime_verification.js
```

---

## 🎯 **Cara Penggunaan**

### **Development Workflow**

**1. Start Development:**
```bash
# Cara 1: Menggunakan script (background)
scripts/start-docker.bat

# Cara 2: Manual dengan logs (recommended)
docker-compose up --build
```

**2. Lihat Logs (jika start di background):**
```bash
docker-compose logs -f

# Atau logs service tertentu
docker-compose logs -f frontend
docker-compose logs -f backend-node
```

**3. Stop Services:**
```bash
# Cara 1: Menggunakan script
scripts/stop-docker.bat

# Cara 2: Manual
docker-compose down
```

---

### **Testing Workflow**

**1. Test Complete System:**
```bash
# Pastikan backend running
npm start --prefix backend_node

# Run test
node scripts/test_complete_system.js
```

**2. Test Real-time Features:**
```bash
# Pastikan backend running
npm start --prefix backend_node

# Run test
node scripts/test_realtime_verification.js
```

---

## 💡 **Tips**

### Lihat Status Containers
```bash
docker-compose ps
```

### Restart Service Tertentu
```bash
docker-compose restart frontend
docker-compose restart backend-node
```

### Rebuild Setelah Perubahan Dependencies
```bash
docker-compose up -d --build
```

### Clean Restart (Hapus Volumes)
```bash
docker-compose down -v
docker-compose up --build
```

---

## 📚 **Dokumentasi Lengkap**

- **Docker Guide:** [../docs/DOCKER_GUIDE.md](../docs/DOCKER_GUIDE.md)
- **Deployment Guide:** [../docs/deployment/DEPLOY_RAILWAY_VERCEL.md](../docs/deployment/DEPLOY_RAILWAY_VERCEL.md)
- **Testing Guide:** [../docs/COMPLETE_IMPLEMENTATION_GUIDE.md](../docs/COMPLETE_IMPLEMENTATION_GUIDE.md)

---

**Happy Coding! 🚀**
