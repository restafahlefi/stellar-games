# 🎮 Stellar Games Backend

Backend API untuk Stellar Games - Platform arcade gaming dengan sistem autentikasi dan leaderboard.

## 🏗️ Arsitektur

Backend ini menggunakan **Domain-Driven Design (DDD)** dengan struktur:

```
src/
├── application/        # Use Cases (Business Logic)
├── domain/            # Domain Entities & Services
├── infrastructure/    # External Services & Persistence
│   ├── backup/       # GitHub Backup Service ⭐ NEW
│   ├── persistence/  # Data Repositories
│   ├── schedulers/   # Cron Jobs
│   └── socket/       # WebSocket Server
└── interfaces/        # HTTP Routes & Controllers
```

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### Production (Railway)

Lihat [GITHUB_BACKUP_SETUP.md](../GITHUB_BACKUP_SETUP.md) untuk setup lengkap.

## 🔐 GitHub Backup System ⭐ NEW

**PENTING**: Railway menggunakan ephemeral filesystem. Semua file (termasuk `users.json`) akan **HILANG** setiap redeploy.

**Solusi**: GitHub Backup otomatis backup user data ke private GitHub repository.

### Setup GitHub Backup:

1. **Buat Private GitHub Repository**
   ```bash
   # Buka: https://github.com/new
   # Repository name: stellar-games-data
   # Visibility: PRIVATE
   ```

2. **Generate GitHub Token**
   ```bash
   # Buka: https://github.com/settings/tokens/new
   # Scope: repo (Full control of private repositories)
   ```

3. **Set Environment Variables di Railway**
   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_REPO_URL=https://github.com/username/stellar-games-data.git
   GITHUB_BRANCH=main
   GITHUB_USERNAME=your-username
   GITHUB_EMAIL=your-email@example.com
   JWT_SECRET=random-secret-string
   JWT_EXPIRES_IN=30d
   CORS_ORIGIN=https://stellargame.up.railway.app
   ```

4. **Deploy & Test**
   - Railway akan auto-redeploy
   - Register user baru
   - Cek GitHub repo - `users.json` harus muncul
   - Trigger redeploy - login harus tetap berhasil

**Dokumentasi Lengkap**: [GITHUB_BACKUP_SETUP.md](../GITHUB_BACKUP_SETUP.md)

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)

# Production
npm start                # Start production server

# Utilities
npm run check-users      # Check registered users
npm run setup-github     # Interactive GitHub setup wizard ⭐ NEW
npm run migrate-github   # Migrate existing users to GitHub ⭐ NEW
```

## 🔧 Environment Variables

### Required (Production)

```bash
# GitHub Backup (REQUIRED for Railway) ⭐ NEW
GITHUB_TOKEN=           # GitHub Personal Access Token
GITHUB_REPO_URL=        # https://github.com/user/repo.git
GITHUB_BRANCH=main      # Git branch name
GITHUB_USERNAME=        # GitHub username
GITHUB_EMAIL=           # GitHub email

# JWT Authentication
JWT_SECRET=             # Random secret string
JWT_EXPIRES_IN=30d      # Token expiration

# Server
PORT=5000               # Server port
NODE_ENV=production     # Environment
CORS_ORIGIN=            # Frontend URL
```

### Optional (Future)

```bash
# Admin Panel (coming soon)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=    # bcrypt hash

# Database (future)
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

## 📡 API Endpoints

### Authentication ⭐ NEW

```bash
POST   /api/v1/auth/register      # Register new user
POST   /api/v1/auth/login         # Login user
GET    /api/v1/auth/verify        # Verify JWT token
```

### Games

```bash
GET    /api/v1/games              # Get all games
POST   /api/v1/games              # Create game (admin)
GET    /api/v1/games/stats        # Global stats
```

### Leaderboard

```bash
GET    /api/v1/leaderboard        # Get leaderboard
POST   /api/v1/leaderboard/submit # Submit score
GET    /api/v1/leaderboard/reset-info  # Reset countdown
```

### Players

```bash
POST   /api/v1/players/heartbeat  # Send heartbeat (active player)
POST   /api/v1/players/disconnect # Disconnect player
```

### Admin (Future)

```bash
POST   /api/v1/admin/leaderboard/reset  # Manual reset
GET    /api/v1/admin/users              # List all users
DELETE /api/v1/admin/users/:id          # Delete user
```

## 🔒 Security Features

### Implemented ✅

- ✅ **JWT Authentication** (30-day expiry)
- ✅ **bcrypt Password Hashing** (cost factor 10)
- ✅ **CORS Protection**
- ✅ **GitHub Backup Encryption** (private repo) ⭐ NEW

### Coming Soon ⏳

- ⏳ **Rate Limiting** (login: 5/15min, register: 3/hour)
- ⏳ **Admin Authentication**
- ⏳ **Audit Logging**
- ⏳ **IP Whitelist**

## 📊 Data Persistence

### Current: File-based + GitHub Backup ⭐ NEW

```
FileAuthRepository (users.json)
    ↓
GitHubBackupService
    ↓
Private GitHub Repository
```

**Backup Triggers**:
- User registration
- User login (lastLoginAt update)
- Manual trigger

**Restore Triggers**:
- Server startup
- Railway redeploy

### Future: PostgreSQL (Optional)

Untuk scale >5000 users, bisa migrate ke PostgreSQL.

## 🔄 Leaderboard Reset

### Automatic Monthly Reset

- **Schedule**: Tanggal 1 setiap bulan, 00:00 UTC
- **Archive**: Leaderboard bulan sebelumnya di-archive
- **Notification**: Countdown real-time di frontend

### Manual Reset (Admin)

```bash
POST /api/v1/admin/leaderboard/reset
```

## 🐛 Troubleshooting

### ❌ "GitHub backup disabled"

**Solusi**: Set environment variables `GITHUB_TOKEN` dan `GITHUB_REPO_URL`

### ❌ "Authentication failed" (GitHub)

**Solusi**: 
- Generate token baru dengan scope `repo`
- Update `GITHUB_TOKEN` di Railway
- Pastikan repository PRIVATE

### ❌ Users hilang setelah redeploy

**Solusi**:
- Cek Railway logs untuk backup errors
- Verify GitHub token masih valid
- Cek `users.json` ada di GitHub repository
- Run `npm run migrate-github` untuk force backup

### ❌ "Cannot find module"

**Solusi**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance

### Current Capacity

- **Users**: Up to 5,000 (file-based)
- **Active Players**: Up to 500 concurrent
- **Response Time**: <500ms (login/register)
- **Backup Time**: <5s (async, non-blocking) ⭐ NEW

### Optimization

- In-memory caching for user data
- Async GitHub backup (non-blocking) ⭐ NEW
- Batch backup (30s window) ⭐ NEW
- Connection pooling (future)

## 🧪 Testing

```bash
# Check users
npm run check-users

# Test GitHub backup ⭐ NEW
npm run migrate-github

# Manual API testing
curl http://localhost:5000/health
curl http://localhost:5000/api/v1/games
```

## 📦 Dependencies

### Core

- `express` - Web framework
- `socket.io` - WebSocket for multiplayer
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `simple-git` - GitHub integration ⭐ NEW

### Utilities

- `cors` - CORS middleware
- `dotenv` - Environment variables
- `node-cron` - Scheduled tasks

### Dev

- `nodemon` - Auto-reload development

## 🚀 Deployment

### Railway

1. Connect GitHub repository
2. Set environment variables (lihat [GITHUB_BACKUP_SETUP.md](../GITHUB_BACKUP_SETUP.md))
3. Deploy automatically on push to `main`

### Docker (Alternative)

```bash
docker build -t stellar-games-backend .
docker run -p 5000:5000 --env-file .env stellar-games-backend
```

## 📝 License

ISC

## 👥 Team

Stellar Games Team

---

**Need Help?** Lihat [GITHUB_BACKUP_SETUP.md](../GITHUB_BACKUP_SETUP.md) untuk troubleshooting lengkap.
