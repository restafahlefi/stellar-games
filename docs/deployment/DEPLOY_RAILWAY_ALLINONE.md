# 🚀 Deploy ke Railway (All-in-One) - Backend + Frontend

**Deploy backend dan frontend dalam 1 platform Railway - GRATIS & MUDAH!**

---

## 🎯 **Kenapa Railway All-in-One?**

### **✅ Keuntungan:**
- ✅ **1 Platform** - Backend + Frontend dalam 1 tempat
- ✅ **Lebih Simple** - Tidak perlu setup 2 platform berbeda
- ✅ **Gratis** - $5 credit gratis per bulan (cukup untuk project kecil)
- ✅ **Auto Deploy** - Push ke GitHub = auto deploy
- ✅ **Custom Domain** - Bisa pakai domain sendiri
- ✅ **No CORS Issues** - Karena 1 domain yang sama

### **❌ Kekurangan:**
- ❌ **Credit Terbatas** - $5/bulan (habis jika traffic tinggi)
- ❌ **Slower Frontend** - Railway tidak se-optimal Vercel untuk static files
- ❌ **1 Service = 1 URL** - Perlu proxy untuk serve frontend dari backend

---

## 📋 **Persiapan File**

### **File yang Dibutuhkan:**

```
stellar_games/
├── backend_node/           ← Backend code
│   ├── src/
│   ├── package.json
│   └── Dockerfile.prod
├── frontend/               ← Frontend code
│   ├── src/
│   ├── package.json
│   └── dist/              ← Build output (akan dibuat)
└── railway.json           ← Railway config (BARU)
```

---

## 🔧 **Step 1: Setup Backend untuk Serve Frontend**

Backend akan serve frontend static files setelah di-build.

### **1.1 Update Backend `server.js`**

Tambahkan code untuk serve frontend static files:

```javascript
// stellar_games/backend_node/src/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ... existing middleware ...

// Serve frontend static files (PRODUCTION ONLY)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from frontend/dist
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // All non-API routes serve index.html (SPA routing)
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// ... rest of code ...
```

---

## 🚀 **Step 2: Deploy ke Railway**

### **2.1 Push ke GitHub**

```bash
cd stellar_games
git add .
git commit -m "Ready for Railway all-in-one deployment"
git push origin main
```

### **2.2 Create Railway Project**

1. **Buka Railway**: https://railway.app
2. **Login** dengan GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Pilih repository** `stellar-games`
6. **Railway akan auto-detect** dan create service

### **2.3 Configure Build Settings**

Railway akan detect `backend_node` folder. Kita perlu custom build command:

1. **Click service** yang baru dibuat
2. **Go to "Settings"**
3. **Scroll ke "Build"**
4. **Set Root Directory**: `backend_node`
5. **Set Build Command**:
   ```bash
   cd ../frontend && npm install && npm run build && cd ../backend_node && npm install
   ```
6. **Set Start Command**:
   ```bash
   npm start
   ```

### **2.4 Set Environment Variables**

1. **Go to "Variables" tab**
2. **Add variables**:

```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-app.railway.app
FRONTEND_URL=https://your-app.railway.app
```

**Note:** Ganti `your-app.railway.app` dengan URL Railway Anda (akan muncul setelah deploy)

### **2.5 Deploy**

1. **Click "Deploy"**
2. **Wait 3-5 minutes** untuk build
3. **Check logs** untuk memastikan tidak ada error
4. **Copy URL** dari Railway (e.g., `https://stellar-games-production.up.railway.app`)

---

## 🔧 **Step 3: Update Environment Variables**

Setelah dapat URL Railway, update environment variables:

1. **Go to "Variables" tab**
2. **Update**:
   ```env
   CORS_ORIGIN=https://stellar-games-production.up.railway.app
   FRONTEND_URL=https://stellar-games-production.up.railway.app
   ```
3. **Save** (akan auto redeploy)

---

## ✅ **Step 4: Test Deployment**

### **4.1 Test Backend API**

```bash
# Health check
curl https://your-app.railway.app/health

# Get games
curl https://your-app.railway.app/api/v1/games
```

### **4.2 Test Frontend**

1. **Open browser**: `https://your-app.railway.app`
2. **Check homepage** loads
3. **Test game** (e.g., Snake)
4. **Check leaderboard** updates
5. **Test multiplayer** (e.g., Tic-Tac-Toe)

---

## 📊 **Monitoring**

### **Check Logs:**
1. Go to Railway dashboard
2. Click your service
3. Go to "Deployments" tab
4. Click latest deployment
5. View logs

### **Check Metrics:**
1. Go to "Metrics" tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

---

## 💰 **Cost Estimation**

Railway gives **$5 free credit per month**.

**Estimated Usage:**
- **Low Traffic** (< 1000 users/month): ~$2-3/month ✅ FREE
- **Medium Traffic** (1000-5000 users/month): ~$5-8/month ⚠️ May exceed free tier
- **High Traffic** (> 5000 users/month): ~$10+/month ❌ Need paid plan

**Tips to Save Credit:**
- Use sleep mode (auto-sleep after 30 min inactivity)
- Optimize bundle size
- Use CDN for images
- Cache API responses

---

## 🔄 **Auto Deploy on Push**

Railway auto-deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update game"
git push origin main

# Railway will auto-deploy in 3-5 minutes
```

---

## 🎯 **Alternative: Render (All-in-One)**

Jika Railway credit habis, bisa pakai **Render** (juga gratis):

### **Render Setup:**

1. **Buka**: https://render.com
2. **Create "Web Service"**
3. **Connect GitHub repo**
4. **Set**:
   - **Root Directory**: `backend_node`
   - **Build Command**: 
     ```bash
     cd ../frontend && npm install && npm run build && cd ../backend_node && npm install
     ```
   - **Start Command**: `npm start`
5. **Add Environment Variables** (sama seperti Railway)
6. **Deploy**

**Render Free Tier:**
- ✅ Unlimited bandwidth
- ✅ Auto SSL
- ❌ Spins down after 15 min inactivity (cold start ~30s)

---

## 🎯 **Alternative: Vercel (Frontend) + Railway (Backend)**

Jika ingin frontend lebih cepat, tetap pakai Vercel + Railway terpisah:

**Keuntungan:**
- ✅ **Vercel** = Super fast frontend (CDN global)
- ✅ **Railway** = Reliable backend
- ✅ **Best Performance**

**Kekurangan:**
- ❌ Perlu setup 2 platform
- ❌ Perlu configure CORS

**Panduan:** Lihat `DEPLOY_RAILWAY_VERCEL.md`

---

## 📝 **Checklist Deployment**

### **Pre-Deployment:**
- [ ] Push code ke GitHub
- [ ] Frontend build berhasil (`npm run build`)
- [ ] Backend bisa serve static files
- [ ] Environment variables ready

### **Deployment:**
- [ ] Create Railway project
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy
- [ ] Update CORS_ORIGIN dengan Railway URL
- [ ] Redeploy

### **Post-Deployment:**
- [ ] Test homepage
- [ ] Test all 12 games
- [ ] Test leaderboard
- [ ] Test multiplayer
- [ ] Test on mobile
- [ ] Monitor logs for errors

---

## 🐛 **Troubleshooting**

### **Build Failed:**
```bash
# Check logs in Railway dashboard
# Common issues:
- Node version mismatch (use Node 18+)
- Missing dependencies
- Build command error
```

**Fix:**
1. Check `package.json` has all dependencies
2. Test build locally: `npm run build`
3. Check Railway logs for specific error

### **Frontend Not Loading:**
```bash
# Check if static files are served
curl https://your-app.railway.app/index.html
```

**Fix:**
1. Verify `frontend/dist` folder exists after build
2. Check `server.js` has static file serving code
3. Check path in `express.static()` is correct

### **API Not Working:**
```bash
# Test API endpoint
curl https://your-app.railway.app/api/v1/games
```

**Fix:**
1. Check backend is running (view logs)
2. Verify API routes are registered
3. Check CORS configuration

### **WebSocket Not Connecting:**
```bash
# Check Socket.IO connection
# Open browser console, look for Socket.IO errors
```

**Fix:**
1. Verify `FRONTEND_URL` in environment variables
2. Check Socket.IO CORS configuration
3. Ensure Railway supports WebSocket (it does)

---

## 🎉 **Success!**

Jika semua berhasil, Anda akan punya:

- ✅ **1 URL** untuk backend + frontend
- ✅ **Auto Deploy** on git push
- ✅ **Free Hosting** (Railway $5 credit)
- ✅ **SSL Certificate** (HTTPS)
- ✅ **Custom Domain** (optional)

**URL Example:**
```
https://stellar-games-production.up.railway.app
```

---

## 📚 **Next Steps**

1. **Custom Domain** - Add your own domain in Railway settings
2. **Monitoring** - Setup error tracking (Sentry)
3. **Analytics** - Add Google Analytics
4. **SEO** - Add meta tags for better SEO
5. **Performance** - Optimize bundle size

---

## 💡 **Tips**

### **Optimize Bundle Size:**
```bash
# Analyze bundle
npm run build -- --analyze

# Use code splitting
# Use lazy loading
# Remove unused dependencies
```

### **Enable Caching:**
```javascript
// In server.js
app.use(express.static(path.join(__dirname, '../../frontend/dist'), {
  maxAge: '1d', // Cache for 1 day
  etag: true
}));
```

### **Add Health Check:**
```javascript
// In server.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 📞 **Support**

**Railway Issues:**
- 📖 Docs: https://docs.railway.app
- 💬 Discord: https://discord.gg/railway
- 📧 Support: help@railway.app

**Project Issues:**
- 🐛 GitHub Issues
- 📧 Email support

---

**Last Updated:** 2026-05-02  
**Status:** ✅ Ready for All-in-One Deployment  
**Estimated Time:** 15 minutes

