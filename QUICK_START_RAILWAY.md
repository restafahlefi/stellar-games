# 🚀 Quick Start - Deploy ke Railway (5 Menit!)

**Deploy backend + frontend dalam 1 platform Railway - SUPER SIMPLE!**

---

## ⚡ **Quick Steps (5 Menit)**

### **1. Push ke GitHub** (1 menit)

```bash
cd stellar_games
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### **2. Deploy ke Railway** (2 menit)

1. Buka: **https://railway.app**
2. Login dengan GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Pilih repository **stellar-games**
6. Railway akan auto-deploy!

### **3. Set Environment Variables** (1 menit)

Setelah deploy selesai:

1. Click service Anda
2. Go to **"Variables"** tab
3. Add variables:

```env
NODE_ENV=production
PORT=5000
```

4. Copy URL Railway Anda (e.g., `https://stellar-games-production.up.railway.app`)
5. Add 2 variables lagi:

```env
CORS_ORIGIN=https://stellar-games-production.up.railway.app
FRONTEND_URL=https://stellar-games-production.up.railway.app
```

6. Save (akan auto redeploy)

### **4. Test!** (1 menit)

1. Buka URL Railway Anda
2. Test homepage ✅
3. Test game (e.g., Snake) ✅
4. Test leaderboard ✅
5. **DONE!** 🎉

---

## 📋 **File Penting yang Sudah Disiapkan**

✅ **backend_node/src/server.js** - Sudah bisa serve frontend  
✅ **frontend/.env.production** - Config production  
✅ **railway.toml** - Railway configuration  
✅ **Semua dependencies** - Sudah lengkap

**Anda tinggal push ke GitHub dan deploy!**

---

## 🎯 **Struktur Deployment**

```
Railway Service (1 URL)
├── Backend (Node.js + Express)
│   ├── API: /api/v1/*
│   ├── Health: /health
│   └── Socket.IO: /socket.io
└── Frontend (React Static Files)
    └── All other routes: /*
```

**Keuntungan:**
- ✅ 1 URL untuk semua
- ✅ No CORS issues
- ✅ Simple setup
- ✅ Auto deploy on push

---

## 💰 **Biaya**

**Railway Free Tier:**
- ✅ $5 credit gratis per bulan
- ✅ Cukup untuk ~1000 users/month
- ✅ Auto-sleep setelah 30 min inactivity (save credit)

**Estimasi:**
- Low traffic: ~$2-3/month ✅ **GRATIS**
- Medium traffic: ~$5-8/month ⚠️ Mungkin perlu top-up
- High traffic: ~$10+/month ❌ Perlu paid plan

---

## 🐛 **Troubleshooting**

### **Build Failed?**
1. Check Railway logs
2. Pastikan Node.js version 18+
3. Test build locally: `cd frontend && npm run build`

### **Frontend Not Loading?**
1. Check environment variables sudah benar
2. Verify `NODE_ENV=production`
3. Check Railway logs untuk error

### **API Not Working?**
1. Test health endpoint: `https://your-app.railway.app/health`
2. Check CORS_ORIGIN sudah benar
3. View Railway logs

---

## 📚 **Dokumentasi Lengkap**

Untuk panduan detail, lihat:
- **[DEPLOY_RAILWAY_ALLINONE.md](./docs/deployment/DEPLOY_RAILWAY_ALLINONE.md)** - Tutorial lengkap

---

## 🎉 **Selesai!**

Setelah deploy berhasil, Anda akan punya:

- ✅ Website live di Railway
- ✅ Backend + Frontend dalam 1 URL
- ✅ Auto deploy on git push
- ✅ Free hosting ($5 credit/month)
- ✅ SSL certificate (HTTPS)

**URL Example:**
```
https://stellar-games-production.up.railway.app
```

**Enjoy! 🚀**

---

**Last Updated:** 2026-05-02  
**Estimated Time:** 5 minutes  
**Difficulty:** ⭐ Easy
