# 🚂 Deploy Stellar Games ke Railway + Vercel (GRATIS!)

**Total waktu: ~15 menit**  
**Biaya: GRATIS (dengan batasan)**

---

## 📋 **Yang Anda Butuhkan**

1. ✅ Akun GitHub (gratis)
2. ✅ Akun Railway (gratis, login dengan GitHub)
3. ✅ Akun Vercel (gratis, login dengan GitHub)

---

## 🎯 **Overview Deployment**

```
GitHub Repository
    ↓
    ├─→ Railway (Backend Node.js)  → https://your-backend.railway.app
    └─→ Vercel (Frontend React)    → https://your-frontend.vercel.app
```

---

## 📦 **PART 1: Push Code ke GitHub (5 menit)**

### **Step 1: Buat Repository di GitHub**

1. Buka https://github.com
2. Klik tombol **"+"** (kanan atas) → **"New repository"**
3. Isi form:
   - **Repository name**: `stellar-games`
   - **Description**: `Stellar Games - Gaming Portal with 12 Games`
   - **Visibility**: **Public** (atau Private jika mau)
   - **JANGAN** centang "Add a README file"
4. Klik **"Create repository"**
5. **COPY URL repository** Anda (contoh: `https://github.com/username/stellar-games.git`)

### **Step 2: Initialize Git di Project Anda**

Buka terminal/command prompt di folder `stellar_games`:

```bash
# Masuk ke folder project
cd D:\games\stellar_games

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Stellar Games ready for deployment"

# Add remote (ganti dengan URL repository Anda)
git remote add origin https://github.com/YOUR_USERNAME/stellar-games.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

**Troubleshooting:**
- Jika diminta login GitHub, masukkan username dan password
- Jika password tidak work, gunakan **Personal Access Token**:
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token → Centang "repo" → Generate
  3. Copy token dan gunakan sebagai password

✅ **Setelah push berhasil, refresh halaman GitHub repository Anda. Code sudah ada!**

---

## 🚂 **PART 2: Deploy Backend ke Railway (5 menit)**

### **Step 1: Login ke Railway**

1. Buka https://railway.app
2. Klik **"Login"**
3. Pilih **"Login with GitHub"**
4. Authorize Railway

### **Step 2: Create New Project**

1. Klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Jika diminta, klik **"Configure GitHub App"** dan authorize Railway untuk akses repository Anda
4. Pilih repository **`stellar-games`**
5. Railway akan otomatis detect dan mulai deploy

### **Step 3: Configure Environment Variables**

1. Setelah deploy selesai, klik project Anda
2. Klik tab **"Variables"**
3. Tambahkan environment variables berikut:

```
PORT=5000
NODE_ENV=production
```

**JANGAN isi CORS_ORIGIN dan FRONTEND_URL dulu** (kita isi setelah dapat URL Vercel)

### **Step 4: Configure Root Directory**

Railway mungkin tidak tahu folder mana yang harus di-deploy. Mari kita set:

1. Klik tab **"Settings"**
2. Scroll ke **"Build"** section
3. Set **"Root Directory"**: `backend_node`
4. Set **"Start Command"**: `npm start`
5. Klik **"Save"**

### **Step 5: Redeploy**

1. Klik tab **"Deployments"**
2. Klik **"Redeploy"** (atau tunggu auto-deploy)
3. Tunggu sampai status **"SUCCESS"** (hijau)

### **Step 6: Get Backend URL**

1. Klik tab **"Settings"**
2. Scroll ke **"Domains"** section
3. Klik **"Generate Domain"**
4. Railway akan generate URL seperti: `https://stellar-games-production-xxxx.up.railway.app`
5. **COPY URL ini** (kita butuh untuk frontend)

### **Step 7: Test Backend**

Buka browser dan test:
```
https://your-backend-url.railway.app/health
```

Jika berhasil, Anda akan lihat:
```json
{
  "status": "success",
  "message": "Stellar Games API is running",
  "timestamp": "2026-05-02T..."
}
```

✅ **Backend ONLINE!**

---

## ⚡ **PART 3: Deploy Frontend ke Vercel (5 menit)**

### **Step 1: Login ke Vercel**

1. Buka https://vercel.com
2. Klik **"Sign Up"** atau **"Login"**
3. Pilih **"Continue with GitHub"**
4. Authorize Vercel

### **Step 2: Import Project**

1. Klik **"Add New..."** → **"Project"**
2. Pilih **"Import Git Repository"**
3. Cari dan pilih repository **`stellar-games`**
4. Klik **"Import"**

### **Step 3: Configure Project**

Di halaman "Configure Project":

1. **Framework Preset**: Pilih **"Vite"**
2. **Root Directory**: Klik **"Edit"** → Pilih **`frontend`**
3. **Build Command**: `npm run build` (default, biarkan)
4. **Output Directory**: `dist` (default, biarkan)

### **Step 4: Add Environment Variables**

Scroll ke **"Environment Variables"** section:

1. Klik **"Add"**
2. Tambahkan variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api/v1`
   - (Ganti dengan URL Railway Anda dari Part 2 Step 6, tambahkan `/api/v1` di akhir)
3. Klik **"Add"**

### **Step 5: Deploy**

1. Klik **"Deploy"**
2. Tunggu proses build (~2-3 menit)
3. Jika berhasil, Anda akan lihat **"Congratulations!"** dengan confetti 🎉

### **Step 6: Get Frontend URL**

Vercel akan generate URL seperti:
```
https://stellar-games.vercel.app
```

atau

```
https://stellar-games-username.vercel.app
```

**COPY URL ini!**

### **Step 7: Test Frontend**

Buka URL Vercel Anda di browser. Anda akan lihat:
- ❌ **CORS Error** (ini normal, kita fix di step berikutnya)

---

## 🔧 **PART 4: Fix CORS (2 menit)**

Sekarang kita perlu update backend Railway dengan URL frontend Vercel.

### **Step 1: Update Railway Environment Variables**

1. Kembali ke https://railway.app
2. Buka project backend Anda
3. Klik tab **"Variables"**
4. Tambahkan 2 variables baru:

```
CORS_ORIGIN=https://your-frontend-url.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app
```

(Ganti dengan URL Vercel Anda dari Part 3 Step 6)

5. Klik **"Add"** untuk setiap variable

### **Step 2: Redeploy Backend**

Railway akan otomatis redeploy setelah Anda tambah environment variables.

Tunggu sampai status **"SUCCESS"** (hijau).

### **Step 3: Test Lagi**

Buka URL Vercel Anda lagi dan refresh (Ctrl+F5).

✅ **Website seharusnya sudah jalan sempurna!**

---

## 🎮 **PART 5: Test Semua Features**

Buka website Anda dan test:

- [ ] Homepage loads
- [ ] Modal "Identify Yourself" muncul
- [ ] Bisa register nama
- [ ] Loading screen muncul dengan anime GIF
- [ ] Homepage muncul setelah loading
- [ ] Stats (Total Players, Players Online) muncul
- [ ] Bisa klik dan main game
- [ ] Score bisa submit
- [ ] Leaderboard update
- [ ] Multiplayer games bisa connect

**Jika semua ✅, SELAMAT! Website Anda sudah LIVE! 🎉**

---

## 🌐 **PART 6: Custom Domain (Optional)**

### **Untuk Vercel (Frontend)**

1. Beli domain (Namecheap, Cloudflare, Niagahoster, dll)
2. Di Vercel dashboard → Project → Settings → Domains
3. Klik **"Add"**
4. Masukkan domain Anda (contoh: `stellargames.com`)
5. Follow instruksi untuk update DNS records
6. Tunggu DNS propagation (1-24 jam)

### **Untuk Railway (Backend)**

1. Di Railway dashboard → Project → Settings → Domains
2. Klik **"Add Custom Domain"**
3. Masukkan subdomain (contoh: `api.stellargames.com`)
4. Follow instruksi untuk update DNS records

---

## 💰 **Batasan Free Tier**

### **Railway Free Tier:**
- ✅ **$5 credit/bulan** (cukup untuk ~500 jam runtime)
- ✅ 1 GB RAM
- ✅ 1 GB disk
- ⚠️ Jika credit habis, service akan sleep (tidak bisa diakses)

**Tips menghemat credit:**
- Backend akan sleep setelah 5 menit tidak ada request
- Backend akan wake up otomatis saat ada request (cold start ~10 detik)

### **Vercel Free Tier:**
- ✅ **Unlimited** bandwidth
- ✅ **Unlimited** deployments
- ✅ 100 GB bandwidth/bulan
- ✅ Auto SSL (HTTPS)
- ✅ Global CDN

---

## 🔄 **Update Code (Auto Deploy)**

Setiap kali Anda push code baru ke GitHub:

```bash
git add .
git commit -m "Update: description of changes"
git push
```

Railway dan Vercel akan **otomatis detect dan deploy** code baru Anda!

**Tidak perlu manual deploy lagi!** 🎉

---

## 🐛 **Troubleshooting**

### **1. Railway Build Failed**

**Error**: `Cannot find module 'express'`

**Solution**:
- Pastikan `package.json` ada di folder `backend_node`
- Pastikan Root Directory di Railway settings = `backend_node`
- Redeploy

### **2. Vercel Build Failed**

**Error**: `Command "npm run build" exited with 1`

**Solution**:
- Pastikan Root Directory di Vercel settings = `frontend`
- Pastikan `VITE_API_URL` environment variable sudah diset
- Check build logs untuk error detail

### **3. CORS Error di Browser**

**Error**: `Access to fetch at '...' has been blocked by CORS policy`

**Solution**:
- Pastikan `CORS_ORIGIN` dan `FRONTEND_URL` sudah diset di Railway
- Pastikan URL-nya **EXACT** match (termasuk https://)
- Redeploy Railway backend

### **4. Backend Sleep (Railway)**

**Issue**: Backend tidak respond setelah beberapa menit

**Solution**:
- Ini normal di free tier
- Backend akan wake up otomatis saat ada request (cold start ~10 detik)
- Upgrade ke paid plan jika butuh always-on

### **5. WebSocket Not Working**

**Issue**: Multiplayer games tidak connect

**Solution**:
- Railway support WebSocket by default
- Pastikan `FRONTEND_URL` sudah diset di Railway
- Check browser console untuk error

---

## 📊 **Monitoring**

### **Railway Dashboard:**
- View logs: Project → Deployments → Click deployment → View logs
- View metrics: Project → Metrics (CPU, Memory, Network)
- View credit usage: Account → Usage

### **Vercel Dashboard:**
- View deployments: Project → Deployments
- View analytics: Project → Analytics
- View logs: Project → Deployments → Click deployment → View logs

---

## 🎯 **Next Steps**

Setelah website live:

1. ✅ Share URL ke teman-teman untuk testing
2. ✅ Monitor Railway credit usage
3. ✅ Setup custom domain (optional)
4. ✅ Add Google Analytics (optional)
5. ✅ Promote website Anda!

---

## 📞 **Support**

**Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

**Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

**GitHub:**
- Docs: https://docs.github.com

---

## ✅ **Checklist Deployment**

- [ ] Code pushed ke GitHub
- [ ] Railway project created
- [ ] Railway environment variables set (PORT, NODE_ENV)
- [ ] Railway root directory set (`backend_node`)
- [ ] Backend deployed dan health check passing
- [ ] Backend URL copied
- [ ] Vercel project created
- [ ] Vercel root directory set (`frontend`)
- [ ] Vercel environment variable set (`VITE_API_URL`)
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied
- [ ] Railway CORS variables updated (CORS_ORIGIN, FRONTEND_URL)
- [ ] Backend redeployed
- [ ] Website tested dan working
- [ ] All games tested
- [ ] Leaderboard working
- [ ] Multiplayer working

---

**🎮 Selamat! Website Anda sudah LIVE dan bisa diakses dari seluruh dunia! 🌍**

**Share URL Anda:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.railway.app`

**Total biaya: Rp 0 (GRATIS!)** 🎉
