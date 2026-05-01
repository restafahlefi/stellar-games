# 📁 File Penting untuk Deployment

**Panduan lengkap file dan folder yang dibutuhkan untuk deployment.**

---

## 🎯 **File yang WAJIB Ada**

### **✅ Backend Files (backend_node/)**

```
backend_node/
├── src/                          ← Source code (WAJIB)
│   ├── application/              ← Use cases
│   ├── domain/                   ← Business logic
│   ├── infrastructure/           ← External services
│   ├── interfaces/               ← HTTP routes
│   ├── config/                   ← Configuration
│   ├── shared/                   ← Utilities
│   ├── index.js                  ← Entry point (WAJIB)
│   └── server.js                 ← Express server (WAJIB)
│
├── package.json                  ← Dependencies (WAJIB)
├── package-lock.json             ← Lock file (WAJIB)
├── .env.example                  ← Environment template
├── .env.production               ← Production config
├── Dockerfile.prod               ← Docker production
└── .gitignore                    ← Git ignore
```

**File Terpenting:**
1. ✅ **src/** - Semua source code
2. ✅ **package.json** - Dependencies
3. ✅ **package-lock.json** - Lock versions
4. ✅ **.env.production** - Production config

---

### **✅ Frontend Files (frontend/)**

```
frontend/
├── src/                          ← Source code (WAJIB)
│   ├── games/                    ← 12 game components
│   ├── components/               ← UI components
│   ├── services/                 ← API services
│   ├── hooks/                    ← Custom hooks
│   ├── data/                     ← Static data
│   ├── utils/                    ← Utilities
│   ├── App.jsx                   ← Main app (WAJIB)
│   ├── main.jsx                  ← Entry point (WAJIB)
│   └── index.css                 ← Global styles
│
├── public/                       ← Static assets (WAJIB)
│   ├── anime-bg.gif              ← Background
│   └── vite.svg                  ← Icon
│
├── index.html                    ← HTML template (WAJIB)
├── package.json                  ← Dependencies (WAJIB)
├── package-lock.json             ← Lock file (WAJIB)
├── vite.config.js                ← Vite config (WAJIB)
├── tailwind.config.js            ← Tailwind config (WAJIB)
├── postcss.config.js             ← PostCSS config (WAJIB)
├── .env.example                  ← Environment template
├── .env.production               ← Production config (WAJIB)
└── .gitignore                    ← Git ignore
```

**File Terpenting:**
1. ✅ **src/** - Semua source code
2. ✅ **public/** - Static assets
3. ✅ **index.html** - HTML template
4. ✅ **package.json** - Dependencies
5. ✅ **vite.config.js** - Build config
6. ✅ **.env.production** - Production config

---

### **✅ Root Files**

```
stellar_games/
├── .gitignore                    ← Git ignore (WAJIB)
├── railway.toml                  ← Railway config (WAJIB untuk Railway)
├── vercel.json                   ← Vercel config (WAJIB untuk Vercel)
├── docker-compose.yml            ← Docker dev
├── docker-compose.prod.yml       ← Docker production
└── README.md                     ← Documentation
```

**File Terpenting:**
1. ✅ **.gitignore** - Ignore node_modules, .env, dll
2. ✅ **railway.toml** - Railway configuration (untuk Railway All-in-One)
3. ✅ **vercel.json** - Vercel configuration (untuk Vercel deployment)

---

## 🚫 **File yang TIDAK Perlu di-Deploy**

### **❌ Jangan Push ke GitHub:**

```
# Development files
node_modules/                     ← Dependencies (install ulang)
.env                              ← Local environment (JANGAN PUSH!)
.env.local                        ← Local environment (JANGAN PUSH!)

# Build output
frontend/dist/                    ← Build output (generate ulang)
backend_node/dist/                ← Build output (generate ulang)

# IDE files
.vscode/                          ← VS Code settings
.idea/                            ← IntelliJ settings
*.swp                             ← Vim swap files

# OS files
.DS_Store                         ← macOS
Thumbs.db                         ← Windows

# Logs
*.log                             ← Log files
npm-debug.log*                    ← NPM logs
```

**PENTING:** File-file ini sudah ada di `.gitignore`

---

## 📋 **Checklist File untuk Deployment**

### **Railway All-in-One:**

**Backend:**
- [ ] ✅ `backend_node/src/` - All source code
- [ ] ✅ `backend_node/package.json` - Dependencies
- [ ] ✅ `backend_node/package-lock.json` - Lock file
- [ ] ✅ `backend_node/.env.production` - Production config
- [ ] ✅ `backend_node/src/server.js` - Updated untuk serve frontend

**Frontend:**
- [ ] ✅ `frontend/src/` - All source code
- [ ] ✅ `frontend/public/` - Static assets
- [ ] ✅ `frontend/package.json` - Dependencies
- [ ] ✅ `frontend/package-lock.json` - Lock file
- [ ] ✅ `frontend/.env.production` - Production config (API URL = `/api/v1`)
- [ ] ✅ `frontend/vite.config.js` - Build config

**Root:**
- [ ] ✅ `railway.toml` - Railway configuration
- [ ] ✅ `.gitignore` - Ignore unnecessary files

**Total:** ~15 file/folder penting

---

### **Railway + Vercel:**

**Backend (Railway):**
- [ ] ✅ `backend_node/src/` - All source code
- [ ] ✅ `backend_node/package.json` - Dependencies
- [ ] ✅ `backend_node/package-lock.json` - Lock file
- [ ] ✅ `backend_node/.env.production` - Production config

**Frontend (Vercel):**
- [ ] ✅ `frontend/src/` - All source code
- [ ] ✅ `frontend/public/` - Static assets
- [ ] ✅ `frontend/package.json` - Dependencies
- [ ] ✅ `frontend/package-lock.json` - Lock file
- [ ] ✅ `frontend/.env.production` - Production config (API URL = Railway URL)
- [ ] ✅ `frontend/vite.config.js` - Build config

**Root:**
- [ ] ✅ `vercel.json` - Vercel configuration
- [ ] ✅ `.gitignore` - Ignore unnecessary files

**Total:** ~14 file/folder penting

---

## 🔧 **File Configuration**

### **1. railway.toml** (Railway All-in-One)

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd frontend && npm install && npm run build && cd ../backend_node && npm install"

[deploy]
startCommand = "cd backend_node && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

**Fungsi:**
- Build frontend dulu
- Install backend dependencies
- Start backend (yang akan serve frontend)

---

### **2. vercel.json** (Vercel Deployment)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

**Fungsi:**
- Build frontend dengan Vite
- Serve static files
- SPA routing

---

### **3. frontend/.env.production**

**Railway All-in-One:**
```env
VITE_API_URL=/api/v1
```

**Railway + Vercel:**
```env
VITE_API_URL=https://your-backend.railway.app/api/v1
```

**Fungsi:**
- Configure API URL untuk production
- Railway All-in-One: relative path (same domain)
- Railway + Vercel: absolute URL (different domains)

---

### **4. backend_node/.env.production**

```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url
FRONTEND_URL=https://your-frontend-url
```

**Fungsi:**
- Configure backend untuk production
- Set CORS untuk allow frontend
- Set frontend URL untuk Socket.IO

---

## 📊 **File Size Estimation**

### **Backend:**
```
Source code: ~2 MB
node_modules: ~50 MB (installed on server)
Total: ~52 MB
```

### **Frontend:**
```
Source code: ~5 MB
node_modules: ~200 MB (installed on server)
Build output (dist): ~1 MB
Total: ~206 MB (before build)
Total: ~1 MB (after build)
```

### **Total Project:**
```
Development: ~260 MB
Production (deployed): ~53 MB (Railway All-in-One)
Production (deployed): ~52 MB backend + 1 MB frontend (Railway + Vercel)
```

---

## 🎯 **Minimal Files untuk Deploy**

Jika ingin deploy dengan file minimal:

### **Railway All-in-One (Minimal):**

```
stellar_games/
├── backend_node/
│   ├── src/                      ← All source code
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/                      ← All source code
│   ├── public/                   ← Static assets
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.production
├── railway.toml
└── .gitignore
```

**Total:** ~10 file/folder penting

---

## ✅ **Verification Checklist**

### **Before Push to GitHub:**

- [ ] ✅ All source code committed
- [ ] ✅ `.env` NOT in git (check .gitignore)
- [ ] ✅ `node_modules/` NOT in git (check .gitignore)
- [ ] ✅ `.env.production` configured correctly
- [ ] ✅ `railway.toml` or `vercel.json` present
- [ ] ✅ `package.json` has all dependencies
- [ ] ✅ Build works locally (`npm run build`)

### **After Push to GitHub:**

- [ ] ✅ Repository accessible
- [ ] ✅ All files visible on GitHub
- [ ] ✅ No sensitive data exposed
- [ ] ✅ README.md updated

---

## 🚀 **Ready to Deploy**

Jika semua file di atas sudah ada dan configured:

**Railway All-in-One:**
1. Push to GitHub ✅
2. Deploy to Railway ✅
3. Set environment variables ✅
4. Done! 🎉

**Railway + Vercel:**
1. Push to GitHub ✅
2. Deploy backend to Railway ✅
3. Deploy frontend to Vercel ✅
4. Configure CORS ✅
5. Done! 🎉

---

## 📚 **Related Documentation**

- **[QUICK_START_RAILWAY.md](./QUICK_START_RAILWAY.md)** - Quick deployment guide
- **[docs/deployment/DEPLOY_RAILWAY_ALLINONE.md](./docs/deployment/DEPLOY_RAILWAY_ALLINONE.md)** - Full Railway guide
- **[docs/deployment/DEPLOY_RAILWAY_VERCEL.md](./docs/deployment/DEPLOY_RAILWAY_VERCEL.md)** - Full Railway + Vercel guide
- **[docs/deployment/DEPLOYMENT_COMPARISON.md](./docs/deployment/DEPLOYMENT_COMPARISON.md)** - Compare options

---

**Last Updated:** 2026-05-02  
**Status:** ✅ All Files Ready for Deployment

