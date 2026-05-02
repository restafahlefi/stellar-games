# 🚂 Railway Deployment Guide - Stellar Games

Panduan lengkap deploy Stellar Games ke Railway dengan GitHub Backup.

## 📋 Prerequisites

- ✅ Akun Railway (https://railway.app)
- ✅ Akun GitHub
- ✅ Repository Stellar Games sudah di GitHub
- ✅ 10-15 menit waktu setup

---

## 🚀 Step-by-Step Deployment

### Step 1: Setup GitHub Backup Repository

**PENTING**: Lakukan ini SEBELUM deploy ke Railway!

1. **Buat Private Repository untuk Data Backup**
   - Buka: https://github.com/new
   - Repository name: `stellar-games-data`
   - Description: "Private backup for Stellar Games user data"
   - Visibility: **PRIVATE** ⚠️ (PENTING!)
   - **JANGAN** centang "Initialize with README"
   - Klik **"Create repository"**
   - **COPY URL**: `https://github.com/YOUR_USERNAME/stellar-games-data.git`

2. **Generate GitHub Personal Access Token**
   - Buka: https://github.com/settings/tokens/new
   - Note: `Stellar Games Data Backup`
   - Expiration: `No expiration` (atau `1 year`)
   - Scopes: ✅ Centang **`repo`** (Full control of private repositories)
   - Klik **"Generate token"**
   - ⚠️ **COPY TOKEN SEKARANG** (format: `ghp_xxxxxxxxxxxx...`)
   - Simpan di tempat aman (Notepad, password manager)

---

### Step 2: Deploy ke Railway

1. **Login ke Railway**
   - Buka: https://railway.app
   - Login dengan GitHub

2. **Create New Project**
   - Klik **"New Project"**
   - Pilih **"Deploy from GitHub repo"**
   - Pilih repository **stellar-games**
   - Railway akan auto-detect dan mulai deploy

3. **Tunggu Initial Deploy Selesai**
   - Deploy pertama akan GAGAL (normal, karena belum ada env vars)
   - Tunggu sampai status "Failed" atau "Crashed"

---

### Step 3: Configure Environment Variables

1. **Buka Project Settings**
   - Di Railway dashboard, klik project Anda
   - Klik tab **"Variables"**

2. **Tambahkan Environment Variables**
   
   Klik **"New Variable"** untuk setiap variable berikut:

   ```bash
   # GitHub Backup Configuration
   GITHUB_TOKEN=ghp_your_token_from_step1
   GITHUB_REPO_URL=https://github.com/YOUR_USERNAME/stellar-games-data.git
   GITHUB_BRANCH=main
   GITHUB_USERNAME=your_github_username
   GITHUB_EMAIL=your_email@example.com
   
   # JWT Configuration
   JWT_SECRET=generate_random_string_here
   JWT_EXPIRES_IN=30d
   
   # Server Configuration
   NODE_ENV=production
   PORT=5000
   
   # CORS Configuration
   CORS_ORIGIN=https://stellargame.up.railway.app
   ```

   **Tips**:
   - `GITHUB_TOKEN`: Paste token dari Step 1.2
   - `GITHUB_REPO_URL`: Paste URL dari Step 1.1
   - `JWT_SECRET`: Generate random string di https://randomkeygen.com/ (pilih "Fort Knox Passwords")
   - `GITHUB_EMAIL`: Email GitHub Anda
   - `CORS_ORIGIN`: Ganti dengan domain Railway Anda (lihat di Settings → Domains)

3. **Save Variables**
   - Setelah semua variable ditambahkan, Railway akan **auto-redeploy**

---

### Step 4: Verify Deployment

1. **Check Deployment Logs**
   - Klik tab **"Deployments"**
   - Klik deployment terbaru
   - Klik **"View Logs"**
   - Cari messages berikut:

   ```
   ✅ GitHub Backup Service initialized successfully
   ✅ Loaded 0 users from file
   🎮 Stellar Games API Server running on port 5000
   ```

2. **Test Health Endpoint**
   - Buka: `https://your-app.up.railway.app/health`
   - Harus return:
   ```json
   {
     "status": "success",
     "message": "Stellar Games API is running",
     "timestamp": "2024-..."
   }
   ```

3. **Test Registration**
   - Buka: `https://your-app.up.railway.app`
   - Register akun baru
   - Cek GitHub repository `stellar-games-data`
   - File `users.json` harus muncul dengan data user

4. **Test Persistence (CRITICAL)**
   - Trigger manual redeploy di Railway:
     - Settings → Deploy → **"Redeploy"**
   - Tunggu deploy selesai (~5-10 menit)
   - Buka website lagi
   - Login dengan akun yang tadi dibuat
   - ✅ **Jika berhasil login = BACKUP BERHASIL!**

---

## 🔧 Configuration Details

### Environment Variables Explained

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_TOKEN` | ✅ Yes | GitHub Personal Access Token | `ghp_abc123...` |
| `GITHUB_REPO_URL` | ✅ Yes | Private backup repository URL | `https://github.com/user/stellar-games-data.git` |
| `GITHUB_BRANCH` | ✅ Yes | Git branch name | `main` |
| `GITHUB_USERNAME` | ✅ Yes | GitHub username | `your-username` |
| `GITHUB_EMAIL` | ✅ Yes | GitHub email | `you@example.com` |
| `JWT_SECRET` | ✅ Yes | Random secret for JWT | `random-32-char-string` |
| `JWT_EXPIRES_IN` | ✅ Yes | Token expiration | `30d` |
| `NODE_ENV` | ✅ Yes | Environment | `production` |
| `PORT` | ⚠️ Auto | Server port (Railway auto-set) | `5000` |
| `CORS_ORIGIN` | ✅ Yes | Frontend URL | `https://stellargame.up.railway.app` |

---

## 🐛 Troubleshooting

### ❌ Deploy Failed: "GitHub backup disabled"

**Penyebab**: Environment variables belum di-set

**Solusi**:
1. Cek Railway Variables tab
2. Pastikan `GITHUB_TOKEN` dan `GITHUB_REPO_URL` ada
3. Cek typo di nama variable (case-sensitive!)
4. Redeploy setelah menambahkan variables

---

### ❌ Deploy Failed: "Authentication failed"

**Penyebab**: GitHub token invalid atau expired

**Solusi**:
1. Generate token baru di https://github.com/settings/tokens/new
2. Pastikan scope `repo` di-centang
3. Update `GITHUB_TOKEN` di Railway Variables
4. Redeploy

---

### ❌ Deploy Failed: "Repository not found"

**Penyebab**: Repository URL salah atau tidak accessible

**Solusi**:
1. Cek `GITHUB_REPO_URL` format: `https://github.com/username/repo-name.git`
2. Pastikan repository sudah dibuat di GitHub
3. Pastikan repository visibility = **PRIVATE**
4. Cek username dan repo name (case-sensitive)

---

### ❌ Users Hilang Setelah Redeploy

**Penyebab**: Backup tidak berjalan atau restore gagal

**Solusi**:
1. Cek Railway logs untuk error messages
2. Cek GitHub repository - apakah `users.json` ada?
3. Verify GitHub token masih valid
4. Cek internet connectivity dari Railway

**Debug Steps**:
```bash
# Di Railway logs, cari:
✅ Successfully pushed to GitHub        # Backup berhasil
✅ Restored users.json (XXX bytes)      # Restore berhasil

# Jika tidak ada, cari error:
❌ Error during backup: ...
❌ Error restoring from GitHub: ...
```

---

### ❌ "Application failed to respond"

**Penyebab**: Server crash atau port configuration salah

**Solusi**:
1. Cek Railway logs untuk crash messages
2. Pastikan `PORT` variable tidak di-set manual (Railway auto-set)
3. Cek `NODE_ENV=production`
4. Verify semua required env vars ada

---

### ❌ CORS Error di Frontend

**Penyebab**: `CORS_ORIGIN` tidak match dengan frontend URL

**Solusi**:
1. Cek Railway domain di Settings → Domains
2. Update `CORS_ORIGIN` dengan domain yang benar
3. Format: `https://your-app.up.railway.app` (tanpa trailing slash)
4. Redeploy

---

## 📊 Monitoring

### Check Backup Status

1. **GitHub Repository**
   - Buka: `https://github.com/YOUR_USERNAME/stellar-games-data`
   - Cek commit history
   - Setiap user registration/login harus ada commit baru

2. **Railway Logs**
   ```
   ✅ Successfully pushed to GitHub
   ✅ Backup successful
   ```

3. **Backup Frequency**
   - Automatic: Setiap user register/login
   - Async: Non-blocking (tidak slow down response)
   - Retry: 3x dengan exponential backoff (5s, 10s, 20s)

### Performance Metrics

- **Response Time**: <500ms (login/register)
- **Backup Time**: <5s (async, non-blocking)
- **Restore Time**: <30s (on startup)
- **Uptime**: 99.9% (Railway SLA)

---

## 🔒 Security Best Practices

### ✅ DO:

- ✅ Use **PRIVATE** GitHub repository
- ✅ Rotate GitHub token every 6-12 months
- ✅ Use strong `JWT_SECRET` (32+ characters)
- ✅ Monitor Railway logs regularly
- ✅ Enable GitHub notifications for push events
- ✅ Keep `.env` files in `.gitignore`

### ❌ DON'T:

- ❌ NEVER make backup repository PUBLIC
- ❌ NEVER commit `.env` files to git
- ❌ NEVER share GitHub token
- ❌ NEVER hardcode secrets in source code
- ❌ NEVER use weak JWT_SECRET

---

## 📈 Scaling

### Current Capacity

- **Users**: Up to 5,000 (file-based)
- **Active Players**: Up to 500 concurrent
- **Backup Size**: ~1MB per 1000 users
- **GitHub Repo Size**: Unlimited (private repo)

### When to Scale?

**Migrate to PostgreSQL when**:
- Users > 5,000
- Active players > 500 concurrent
- Response time > 1s
- Backup time > 10s

---

## 🎉 Success Checklist

- [ ] Private GitHub repository created
- [ ] GitHub Personal Access Token generated (scope: `repo`)
- [ ] All environment variables added to Railway
- [ ] Initial deployment successful
- [ ] Health endpoint returns 200 OK
- [ ] User registration works
- [ ] `users.json` appears in GitHub repository
- [ ] User login works after redeploy
- [ ] No errors in Railway logs
- [ ] CORS working (frontend can call API)

---

## 📞 Support

**Dokumentasi Lengkap**:
- [GITHUB_BACKUP_SETUP.md](./GITHUB_BACKUP_SETUP.md) - Setup guide detail
- [backend_node/README.md](./backend_node/README.md) - Backend documentation

**Railway Resources**:
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app
- Status: https://status.railway.app

**GitHub Resources**:
- Token Settings: https://github.com/settings/tokens
- Repository Settings: https://github.com/YOUR_USERNAME/stellar-games-data/settings

---

**🎮 Happy Deploying! Semoga sukses!**
