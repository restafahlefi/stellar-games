# ⚡ Quick Deploy - Railway + Vercel (Cheat Sheet)

**Total: 15 menit | Biaya: GRATIS**

---

## 🎯 **3 Langkah Utama**

```
1. GitHub  →  Push code
2. Railway →  Deploy backend
3. Vercel  →  Deploy frontend
```

---

## 📦 **1. PUSH KE GITHUB (3 menit)**

```bash
cd D:\games\stellar_games

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/stellar-games.git
git branch -M main
git push -u origin main
```

✅ **Done! Code di GitHub**

---

## 🚂 **2. RAILWAY - BACKEND (5 menit)**

### **A. Deploy**
1. https://railway.app → Login with GitHub
2. New Project → Deploy from GitHub repo
3. Pilih `stellar-games`

### **B. Configure**
**Settings:**
- Root Directory: `backend_node`
- Start Command: `npm start`

**Variables:**
```
PORT=5000
NODE_ENV=production
```

### **C. Get URL**
Settings → Domains → Generate Domain

**Copy URL**: `https://xxx.railway.app`

### **D. Test**
```
https://xxx.railway.app/health
```

✅ **Backend ONLINE!**

---

## ⚡ **3. VERCEL - FRONTEND (5 menit)**

### **A. Deploy**
1. https://vercel.com → Continue with GitHub
2. Add New → Project
3. Import `stellar-games`

### **B. Configure**
- Framework: **Vite**
- Root Directory: **`frontend`**
- Build Command: `npm run build`
- Output Directory: `dist`

**Environment Variables:**
```
VITE_API_URL=https://xxx.railway.app/api/v1
```
(Ganti xxx dengan Railway URL Anda)

### **C. Deploy**
Klik **Deploy** → Tunggu 2-3 menit

**Copy URL**: `https://xxx.vercel.app`

✅ **Frontend ONLINE!**

---

## 🔧 **4. FIX CORS (2 menit)**

### **Kembali ke Railway:**

**Variables → Add:**
```
CORS_ORIGIN=https://xxx.vercel.app
FRONTEND_URL=https://xxx.vercel.app
```
(Ganti xxx dengan Vercel URL Anda)

**Auto redeploy** → Tunggu SUCCESS

---

## ✅ **5. TEST**

Buka: `https://xxx.vercel.app`

- [ ] Homepage loads
- [ ] Modal muncul
- [ ] Loading screen
- [ ] Games bisa dimainkan
- [ ] Leaderboard update

**DONE! Website LIVE! 🎉**

---

## 🔄 **Update Code**

```bash
git add .
git commit -m "Update: ..."
git push
```

**Auto deploy!** Railway & Vercel otomatis update.

---

## 🐛 **Troubleshooting**

### **Railway Build Failed**
→ Check Root Directory = `backend_node`

### **Vercel Build Failed**
→ Check Root Directory = `frontend`

### **CORS Error**
→ Check CORS_ORIGIN di Railway = exact Vercel URL

### **Backend Sleep**
→ Normal di free tier, wake up otomatis (~10s)

---

## 📊 **Free Tier Limits**

**Railway:**
- $5 credit/bulan (~500 jam)
- Backend sleep setelah 5 menit idle

**Vercel:**
- Unlimited bandwidth
- 100 GB/bulan
- Always online

---

## 🌐 **URLs**

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://your-app.railway.app`  
**API**: `https://your-app.railway.app/api/v1`

---

## 📞 **Help**

**Full Guide**: `DEPLOY_RAILWAY_VERCEL.md`

**Railway**: https://railway.app  
**Vercel**: https://vercel.com  
**GitHub**: https://github.com

---

**🎮 Deploy sekarang! 15 menit = Website LIVE!**
