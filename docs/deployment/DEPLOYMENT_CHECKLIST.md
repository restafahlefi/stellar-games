# ✅ Deployment Checklist - Stellar Games

## 📋 Pre-Deployment Checklist

### **1. Code & Configuration**
- [x] ✅ Struktur folder terorganisir (backend_node & frontend)
- [x] ✅ package.json dengan scripts yang benar
- [x] ✅ .gitignore mengexclude file sensitif (.env, node_modules)
- [x] ✅ .env.example tersedia untuk referensi
- [x] ✅ CORS dikonfigurasi dengan environment variable
- [x] ✅ Socket.IO CORS dikonfigurasi dengan FRONTEND_URL
- [x] ✅ Frontend menggunakan VITE_API_URL environment variable
- [x] ✅ Dockerfile.prod siap untuk production
- [x] ✅ railway.toml dikonfigurasi
- [x] ✅ vercel.json dikonfigurasi

### **2. Dependencies**
- [x] ✅ Backend dependencies terinstall
- [x] ✅ Frontend dependencies terinstall
- [x] ✅ Tidak ada vulnerable packages (run `npm audit`)

### **3. Documentation**
- [x] ✅ README.md lengkap
- [x] ✅ DEPLOY_RAILWAY_VERCEL.md (panduan lengkap)
- [x] ✅ QUICK_DEPLOY_RAILWAY.md (quick reference)
- [x] ✅ ARCHITECTURE.md (system architecture)

---

## 🚀 Deployment Steps

### **STEP 1: Push ke GitHub** (5 menit)

```bash
# Masuk ke folder project
cd stellar_games

# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment - Stellar Games v1.0"

# Add remote (ganti dengan URL repository Anda)
git remote add origin https://github.com/YOUR_USERNAME/stellar-games.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

**✅ Checklist:**
- [ ] Repository dibuat di GitHub
- [ ] Code berhasil di-push
- [ ] Semua file terlihat di GitHub (kecuali yang di .gitignore)

---

### **STEP 2: Deploy Backend ke Railway** (5 menit)

1. **Login ke Railway**
   - [ ] Buka https://railway.app
   - [ ] Login dengan GitHub

2. **Create New Project**
   - [ ] Klik "New Project"
   - [ ] Pilih "Deploy from GitHub repo"
   - [ ] Pilih repository `stellar-games`

3. **Configure Settings**
   - [ ] Set Root Directory: `backend_node`
   - [ ] Set Start Command: `npm start`

4. **Add Environment Variables**
   ```
   PORT=5000
   NODE_ENV=production
   ```
   
   **JANGAN isi CORS_ORIGIN dan FRONTEND_URL dulu!**

5. **Deploy & Get URL**
   - [ ] Tunggu deployment selesai (status SUCCESS)
   - [ ] Generate domain di Settings → Domains
   - [ ] Copy URL backend (contoh: `https://stellar-games-production-xxxx.up.railway.app`)

6. **Test Backend**
   - [ ] Buka `https://your-backend-url.railway.app/health`
   - [ ] Harus return JSON dengan status "success"

---

### **STEP 3: Deploy Frontend ke Vercel** (5 menit)

1. **Login ke Vercel**
   - [ ] Buka https://vercel.com
   - [ ] Login dengan GitHub

2. **Import Project**
   - [ ] Klik "Add New..." → "Project"
   - [ ] Pilih repository `stellar-games`

3. **Configure Project**
   - [ ] Framework Preset: **Vite**
   - [ ] Root Directory: **frontend**
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`

4. **Add Environment Variable**
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api/v1
   ```
   
   **Ganti dengan URL Railway dari Step 2!**

5. **Deploy & Get URL**
   - [ ] Klik "Deploy"
   - [ ] Tunggu build selesai (~2-3 menit)
   - [ ] Copy URL frontend (contoh: `https://stellar-games.vercel.app`)

6. **Test Frontend (akan ada CORS error - normal)**
   - [ ] Buka URL Vercel
   - [ ] Website load tapi ada CORS error di console

---

### **STEP 4: Fix CORS** (2 menit)

1. **Update Railway Environment Variables**
   - [ ] Kembali ke Railway dashboard
   - [ ] Buka project backend
   - [ ] Klik tab "Variables"
   - [ ] Tambahkan 2 variables:
   
   ```
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
   
   **Ganti dengan URL Vercel dari Step 3!**

2. **Wait for Redeploy**
   - [ ] Railway akan auto-redeploy
   - [ ] Tunggu status SUCCESS

3. **Test Lagi**
   - [ ] Buka URL Vercel dan refresh (Ctrl+F5)
   - [ ] Website harus jalan sempurna tanpa CORS error!

---

## 🧪 Testing Checklist

### **Functional Testing**
- [ ] Homepage loads dengan anime background
- [ ] Modal "Identify Yourself" muncul
- [ ] Bisa register dengan nama
- [ ] Loading screen muncul dengan anime GIF
- [ ] Homepage muncul setelah loading
- [ ] Stats muncul (Total Players, Players Online)
- [ ] Semua 12 game cards terlihat
- [ ] Bisa klik dan buka game
- [ ] Game bisa dimainkan
- [ ] Score bisa di-submit
- [ ] Leaderboard update setelah submit score
- [ ] Countdown timer berfungsi dengan color indicators
- [ ] Bisa logout dan login lagi

### **Multiplayer Testing** (jika ada)
- [ ] Bisa create room
- [ ] Bisa join room dengan room code
- [ ] Game state sync antar players
- [ ] Chat berfungsi (jika ada)
- [ ] Disconnect handling berfungsi

### **Performance Testing**
- [ ] Page load < 3 detik
- [ ] Game responsive (no lag)
- [ ] Leaderboard update smooth
- [ ] No console errors
- [ ] No memory leaks

### **Mobile Testing**
- [ ] Responsive di mobile (320px+)
- [ ] Touch controls berfungsi
- [ ] Swipe gestures berfungsi
- [ ] Layout tidak broken

---

## 🔍 Troubleshooting

### **Problem: Railway Build Failed**
**Error**: `Cannot find module 'express'`

**Solution**:
```bash
# Pastikan package.json ada di backend_node
# Pastikan Root Directory = backend_node di Railway settings
# Redeploy
```

### **Problem: Vercel Build Failed**
**Error**: `Command "npm run build" exited with 1`

**Solution**:
```bash
# Pastikan Root Directory = frontend di Vercel settings
# Pastikan VITE_API_URL sudah diset
# Check build logs untuk error detail
```

### **Problem: CORS Error**
**Error**: `Access to fetch at '...' has been blocked by CORS policy`

**Solution**:
```bash
# Pastikan CORS_ORIGIN dan FRONTEND_URL sudah diset di Railway
# Pastikan URL EXACT match (termasuk https://)
# Redeploy Railway backend
# Clear browser cache dan refresh
```

### **Problem: WebSocket Not Working**
**Issue**: Multiplayer games tidak connect

**Solution**:
```bash
# Pastikan FRONTEND_URL sudah diset di Railway
# Check browser console untuk error
# Railway support WebSocket by default
```

### **Problem: Backend Sleep (Railway Free Tier)**
**Issue**: Backend tidak respond setelah beberapa menit

**Solution**:
```bash
# Ini normal di free tier
# Backend akan wake up otomatis saat ada request (cold start ~10 detik)
# Upgrade ke paid plan jika butuh always-on
```

---

## 📊 Post-Deployment

### **Monitoring**
- [ ] Setup Railway monitoring (check credit usage)
- [ ] Setup Vercel analytics
- [ ] Monitor error logs
- [ ] Check performance metrics

### **Optional Enhancements**
- [ ] Setup custom domain
- [ ] Add Google Analytics
- [ ] Setup error tracking (Sentry)
- [ ] Add SEO meta tags
- [ ] Setup sitemap.xml
- [ ] Add robots.txt

### **Maintenance**
- [ ] Regular dependency updates
- [ ] Security patches
- [ ] Performance optimization
- [ ] User feedback collection

---

## 🎯 Success Criteria

✅ **Deployment berhasil jika:**
1. Backend health check return 200 OK
2. Frontend load tanpa error
3. Bisa register dan login
4. Semua game bisa dimainkan
5. Score bisa di-submit
6. Leaderboard update real-time
7. No CORS errors
8. No console errors
9. Responsive di mobile
10. Multiplayer berfungsi (jika ada)

---

## 📞 Support Resources

**Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

**Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

**GitHub:**
- Docs: https://docs.github.com

---

## 🎉 Selamat!

Jika semua checklist ✅, website Anda sudah **LIVE dan siap digunakan!**

**Share URL Anda:**
- 🌐 Frontend: `https://your-app.vercel.app`
- 🔌 Backend API: `https://your-app.railway.app`

**Total Biaya: Rp 0 (GRATIS!)** 🎊

---

**Last Updated**: 2026-05-02
**Version**: 1.0.0
