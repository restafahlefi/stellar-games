# 🔐 GitHub Backup Setup - Panduan Lengkap

## 📋 Apa itu GitHub Backup?

GitHub Backup adalah solusi untuk mengatasi masalah **data hilang** saat Railway melakukan redeploy. Railway menggunakan **ephemeral filesystem** yang artinya semua file (termasuk `users.json`) akan **dihapus** setiap kali redeploy.

Dengan GitHub Backup:
- ✅ Data user **otomatis backup** ke GitHub setiap ada perubahan
- ✅ Data **otomatis restore** saat server restart/redeploy
- ✅ User bisa login kembali setelah Railway redeploy
- ✅ **GRATIS** menggunakan private GitHub repository

---

## 🚀 Langkah Setup (5-10 Menit)

### Step 1: Buat Private GitHub Repository

1. Buka: https://github.com/new
2. Isi form:
   - **Repository name**: `stellar-games-data` (atau nama lain)
   - **Description**: "Private backup for Stellar Games user data"
   - **Visibility**: ⚠️ **PRIVATE** (PENTING!)
   - **Initialize**: ❌ JANGAN centang README, .gitignore, atau license
3. Klik **"Create repository"**
4. **COPY URL repository** (contoh: `https://github.com/username/stellar-games-data.git`)

---

### Step 2: Generate GitHub Personal Access Token

1. Buka: https://github.com/settings/tokens/new
2. Isi form:
   - **Note**: `Stellar Games Data Backup`
   - **Expiration**: `No expiration` (atau `1 year`)
   - **Scopes**: ✅ Centang **`repo`** (Full control of private repositories)
3. Scroll ke bawah, klik **"Generate token"**
4. ⚠️ **COPY TOKEN SEKARANG** (hanya muncul sekali!)
   - Token format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 3: Setup Environment Variables di Railway

1. Buka Railway Dashboard: https://railway.app/dashboard
2. Pilih project **Stellar Games**
3. Klik tab **"Variables"**
4. Tambahkan variable berikut (klik **"New Variable"** untuk setiap baris):

```bash
# GitHub Backup Configuration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPO_URL=https://github.com/your-username/stellar-games-data.git
GITHUB_BRANCH=main
GITHUB_USERNAME=your-github-username
GITHUB_EMAIL=your-email@example.com

# JWT Configuration (generate random string)
JWT_SECRET=your-super-secret-random-string-here
JWT_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=https://stellargame.up.railway.app
```

**Cara mengisi:**
- `GITHUB_TOKEN`: Paste token dari Step 2
- `GITHUB_REPO_URL`: Paste URL repository dari Step 1
- `GITHUB_BRANCH`: Isi `main` (atau `master` jika repo lama)
- `GITHUB_USERNAME`: Username GitHub Anda
- `GITHUB_EMAIL`: Email GitHub Anda
- `JWT_SECRET`: String random (bisa generate di: https://randomkeygen.com/)

5. Klik **"Add"** untuk setiap variable

---

### Step 4: Deploy & Test

1. Railway akan **otomatis redeploy** setelah Anda menambahkan environment variables
2. Tunggu deploy selesai (~5-10 menit)
3. Cek logs di Railway:
   ```
   ✅ GitHub Backup Service initialized successfully
   ✅ Loaded X users from file
   ```

4. **Test Registration:**
   - Buka: https://stellargame.up.railway.app
   - Register akun baru
   - Cek GitHub repository Anda - seharusnya ada file `users.json`

5. **Test Persistence:**
   - Trigger manual redeploy di Railway (Settings → Deploy → Redeploy)
   - Tunggu deploy selesai
   - Login dengan akun yang tadi dibuat
   - ✅ Jika berhasil login = **BACKUP BERHASIL!**

---

## 🔧 Troubleshooting

### ❌ Error: "GitHub backup disabled: Missing GITHUB_TOKEN"

**Solusi:**
- Pastikan environment variables sudah ditambahkan di Railway
- Cek typo di nama variable (harus EXACT: `GITHUB_TOKEN`, bukan `GITHUB_TOKEN_`)
- Redeploy Railway setelah menambahkan variables

---

### ❌ Error: "Push failed: Authentication failed"

**Solusi:**
- Token expired atau tidak valid
- Generate token baru dengan scope `repo`
- Update `GITHUB_TOKEN` di Railway variables
- Pastikan repository visibility adalah **PRIVATE**

---

### ❌ Error: "Repository not found"

**Solusi:**
- Cek `GITHUB_REPO_URL` format: `https://github.com/username/repo-name.git`
- Pastikan repository sudah dibuat di GitHub
- Pastikan username dan repo name benar (case-sensitive)

---

### ❌ Users.json tidak muncul di GitHub

**Solusi:**
- Cek Railway logs untuk error messages
- Pastikan ada user yang register (backup hanya trigger saat ada perubahan)
- Cek GitHub token masih valid
- Cek internet connection dari Railway server

---

## 📊 Cara Kerja Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    RAILWAY SERVER                            │
│                                                              │
│  1. User Register/Login                                      │
│     ↓                                                        │
│  2. Save to users.json (local file)                         │
│     ↓                                                        │
│  3. GitHubBackupService.backup()                            │
│     ↓                                                        │
│  4. Git commit + push to GitHub                             │
│     ↓                                                        │
│  ✅ Data backed up!                                          │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  RAILWAY REDEPLOY (filesystem reset)                        │
│     ↓                                                        │
│  5. Server restart                                           │
│     ↓                                                        │
│  6. GitHubBackupService.restore()                           │
│     ↓                                                        │
│  7. Git pull from GitHub                                     │
│     ↓                                                        │
│  ✅ Data restored!                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Keamanan

### ✅ Best Practices:

1. **Repository HARUS PRIVATE**
   - User data sensitif (password hash)
   - Jangan pernah public!

2. **Token Security**
   - Jangan commit token ke git
   - Jangan share token ke orang lain
   - Rotate token setiap 6-12 bulan

3. **Environment Variables**
   - Simpan di Railway Variables (aman)
   - Jangan hardcode di source code
   - Jangan commit `.env` file ke git

4. **Backup Monitoring**
   - Cek GitHub repository secara berkala
   - Monitor Railway logs untuk backup errors
   - Set up GitHub notifications untuk push events

---

## 📈 Monitoring & Maintenance

### Cek Status Backup:

```bash
# SSH ke Railway (jika ada akses)
# Atau cek logs di Railway dashboard

# Look for these messages:
✅ GitHub Backup Service initialized successfully
✅ Successfully pushed to GitHub
✅ Restored users.json (XXX bytes)
```

### Backup Frequency:

- **Automatic**: Setiap ada user register/login/update
- **Retry Logic**: 3x retry dengan delay (5s, 10s, 20s)
- **Queue System**: Multiple requests di-batch jadi 1 backup

### GitHub Repository Structure:

```
stellar-games-data/
├── .git/
├── .gitignore
└── users.json          # User data (auto-updated)
```

---

## 🆘 Support

Jika masih ada masalah:

1. **Cek Railway Logs**:
   - Railway Dashboard → Your Project → Deployments → View Logs
   - Cari error messages dengan keyword: `GitHub`, `backup`, `push`, `pull`

2. **Cek GitHub Repository**:
   - Apakah `users.json` ada?
   - Kapan last commit?
   - Apakah ada error di commit history?

3. **Test Manual Backup**:
   ```bash
   # Di local development
   npm run migrate-github
   ```

4. **Verify Environment Variables**:
   - Railway Dashboard → Variables
   - Pastikan semua variable ada dan benar

---

## ✅ Checklist Setup

- [ ] Private GitHub repository dibuat
- [ ] GitHub Personal Access Token generated (scope: `repo`)
- [ ] Environment variables ditambahkan di Railway:
  - [ ] `GITHUB_TOKEN`
  - [ ] `GITHUB_REPO_URL`
  - [ ] `GITHUB_BRANCH`
  - [ ] `GITHUB_USERNAME`
  - [ ] `GITHUB_EMAIL`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_EXPIRES_IN`
  - [ ] `CORS_ORIGIN`
- [ ] Railway redeploy selesai
- [ ] Test registration berhasil
- [ ] `users.json` muncul di GitHub repository
- [ ] Test login setelah redeploy berhasil

---

## 🎉 Selesai!

Setelah setup selesai:
- ✅ User data **AMAN** dari Railway redeploy
- ✅ Backup **OTOMATIS** setiap ada perubahan
- ✅ Restore **OTOMATIS** saat server restart
- ✅ User bisa login kapan saja tanpa masalah

**Selamat! Sistem backup Anda sudah aktif! 🚀**
