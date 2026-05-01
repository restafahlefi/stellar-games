# 🐳 Docker Guide - Stellar Games

Panduan lengkap untuk menjalankan Stellar Games menggunakan Docker Desktop.

---

## 📋 Prerequisites

### 1. Install Docker Desktop

**Windows:**
- Download dari: https://www.docker.com/products/docker-desktop/
- Install Docker Desktop
- Restart komputer jika diminta
- Buka Docker Desktop dan tunggu sampai running

**Verifikasi Instalasi:**
```bash
docker --version
docker-compose --version
```

Harus muncul versi Docker dan Docker Compose.

---

## 🚀 Quick Start

### Option 1: Menggunakan Docker Desktop GUI

1. **Buka Docker Desktop**
   - Pastikan Docker Desktop sudah running (icon di system tray)

2. **Buka Terminal di Folder Project**
   ```bash
   cd D:\games\stellar_games
   ```

3. **Build dan Start Containers**
   ```bash
   docker-compose up --build
   ```

4. **Tunggu Proses Build**
   - Frontend: Building React app...
   - Backend: Installing Node.js dependencies...
   - Proses ini memakan waktu 2-5 menit pertama kali

5. **Akses Aplikasi**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

### Option 2: Menggunakan Docker Desktop Dashboard

1. **Buka Docker Desktop**

2. **Klik Tab "Containers"**

3. **Klik tombol "+" atau "Create"**

4. **Pilih "From Docker Compose"**

5. **Browse ke file `docker-compose.yml`**

6. **Klik "Start"**

---

## 📦 Docker Commands

### Build & Start

```bash
# Build dan start semua services
docker-compose up --build

# Start di background (detached mode)
docker-compose up -d

# Build tanpa cache (fresh build)
docker-compose build --no-cache

# Start service tertentu saja
docker-compose up frontend
docker-compose up backend-node
```

### Stop & Remove

```bash
# Stop semua containers
docker-compose stop

# Stop dan remove containers
docker-compose down

# Stop, remove containers, dan hapus volumes
docker-compose down -v

# Stop, remove containers, networks, dan images
docker-compose down --rmi all
```

### View Logs

```bash
# Lihat logs semua services
docker-compose logs

# Lihat logs service tertentu
docker-compose logs frontend
docker-compose logs backend-node

# Follow logs (real-time)
docker-compose logs -f

# Lihat 100 baris terakhir
docker-compose logs --tail=100
```

### Container Management

```bash
# Lihat status containers
docker-compose ps

# Restart service tertentu
docker-compose restart frontend
docker-compose restart backend-node

# Rebuild service tertentu
docker-compose up -d --build frontend

# Masuk ke container (shell)
docker-compose exec frontend sh
docker-compose exec backend-node sh
```

---

## 🔍 Monitoring di Docker Desktop

### 1. Containers Tab
- Lihat semua running containers
- Status: Running, Stopped, Exited
- CPU & Memory usage
- Port mappings

### 2. Images Tab
- Lihat semua Docker images
- Size images
- Delete unused images

### 3. Volumes Tab
- Lihat data volumes
- node_modules volumes
- Delete unused volumes

### 4. Logs
- Klik container name
- Tab "Logs" untuk melihat output
- Real-time logs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│                  (stellar_games_network)                │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │   Frontend       │      │  Backend Node    │       │
│  │   Container      │─────▶│   Container      │       │
│  │                  │      │                  │       │
│  │  React + Vite    │      │  Express + DDD   │       │
│  │  Port: 5173      │      │  Port: 5000      │       │
│  └──────────────────┘      └──────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │                           │
         │                           │
         ▼                           ▼
   localhost:5173            localhost:5000
```

---

## 📊 Services Overview

### Frontend Container
- **Name:** `vayra_frontend`
- **Port:** 5173
- **Technology:** React 18 + Vite
- **Hot Reload:** ✅ Enabled
- **Volume:** `./frontend:/app`

### Backend Node Container
- **Name:** `vayra_backend_node`
- **Port:** 5000
- **Technology:** Node.js + Express (DDD)
- **Hot Reload:** ✅ Enabled (with nodemon)
- **Volume:** `./backend_node:/app`
- **Health Check:** ✅ Enabled

### Backend Python Container (Optional)
- **Name:** `vayra_backend_python`
- **Port:** 8000
- **Technology:** FastAPI
- **Status:** Commented out (future use)

---

## 🔧 Troubleshooting

### Problem: Port Already in Use

**Error:**
```
Error: bind: address already in use
```

**Solution:**
```bash
# Windows - Kill process on port
netstat -ano | findstr :5173
taskkill /PID <PID> /F

netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Atau ubah port di docker-compose.yml
ports:
  - "5174:5173"  # Frontend
  - "5001:5000"  # Backend
```

### Problem: Container Keeps Restarting

**Check Logs:**
```bash
docker-compose logs backend-node
docker-compose logs frontend
```

**Common Issues:**
- Missing dependencies → Rebuild: `docker-compose build --no-cache`
- Syntax error in code → Check logs
- Port conflict → Change ports

### Problem: Cannot Connect to Backend

**Check:**
1. Backend container running?
   ```bash
   docker-compose ps
   ```

2. Health check passing?
   ```bash
   curl http://localhost:5000/health
   ```

3. Network issue?
   ```bash
   docker network ls
   docker network inspect stellar_games_network
   ```

### Problem: Slow Build Time

**Solutions:**
```bash
# Use build cache
docker-compose build

# Clean up unused images
docker system prune -a

# Increase Docker Desktop resources
# Settings → Resources → Increase CPU/Memory
```

### Problem: Changes Not Reflecting

**Solutions:**
```bash
# Restart containers
docker-compose restart

# Rebuild specific service
docker-compose up -d --build frontend

# Clear volumes and rebuild
docker-compose down -v
docker-compose up --build
```

---

## 🎯 Best Practices

### Development

1. **Use Docker Desktop Dashboard**
   - Easy monitoring
   - Quick access to logs
   - Visual container management

2. **Keep Containers Running**
   ```bash
   docker-compose up -d
   ```

3. **Watch Logs in Separate Terminal**
   ```bash
   docker-compose logs -f
   ```

4. **Rebuild After Dependency Changes**
   ```bash
   # After npm install or package.json changes
   docker-compose up -d --build
   ```

### Production

1. **Use Production Dockerfile**
   - Multi-stage builds
   - Optimized images
   - No dev dependencies

2. **Set Environment Variables**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Use Docker Secrets**
   - For sensitive data
   - API keys, passwords

---

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Stellar Games
```

### Backend Node (.env)
```env
NODE_ENV=development
PORT=5000
```

**Note:** Environment variables sudah di-set di `docker-compose.yml`

---

## 🚀 Deployment

### Build Production Images

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Push to registry
docker tag vayra_frontend:latest your-registry/vayra_frontend:latest
docker push your-registry/vayra_frontend:latest
```

### Deploy to Cloud

**Docker Hub:**
```bash
docker login
docker-compose push
```

**AWS ECS / Azure Container Instances / Google Cloud Run:**
- Use production docker-compose
- Configure cloud-specific settings

---

## 📊 Resource Usage

### Recommended Docker Desktop Settings

**Minimum:**
- CPU: 2 cores
- Memory: 4 GB
- Disk: 20 GB

**Recommended:**
- CPU: 4 cores
- Memory: 8 GB
- Disk: 50 GB

**Settings Location:**
Docker Desktop → Settings → Resources

---

## 🎮 Testing the Application

### 1. Start Containers
```bash
docker-compose up -d
```

### 2. Wait for Services
```bash
# Check status
docker-compose ps

# Wait for healthy status
docker-compose logs backend-node | grep "running"
```

### 3. Test Backend
```bash
# Health check
curl http://localhost:5000/health

# Get games
curl http://localhost:5000/api/v1/games
```

### 4. Test Frontend
- Open browser: http://localhost:5173
- Should see Stellar Games homepage
- Try playing a game

### 5. Check Logs
```bash
# Backend logs
docker-compose logs backend-node

# Frontend logs
docker-compose logs frontend
```

---

## 🔄 Update Workflow

### When Code Changes

1. **Frontend/Backend Code Changes**
   - Hot reload automatically
   - No rebuild needed

2. **Dependency Changes (package.json)**
   ```bash
   docker-compose up -d --build
   ```

3. **Dockerfile Changes**
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **docker-compose.yml Changes**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## 📚 Additional Resources

### Docker Desktop
- Dashboard: Visual container management
- Settings: Configure resources
- Extensions: Add functionality

### Useful Commands
```bash
# Clean up everything
docker system prune -a --volumes

# View disk usage
docker system df

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## ✅ Checklist

### Before Starting
- [ ] Docker Desktop installed
- [ ] Docker Desktop running
- [ ] Terminal in project folder
- [ ] Ports 5173 and 5000 available

### First Time Setup
- [ ] Run `docker-compose up --build`
- [ ] Wait for build to complete
- [ ] Check http://localhost:5173
- [ ] Check http://localhost:5000/health

### Daily Development
- [ ] Start Docker Desktop
- [ ] Run `docker-compose up -d`
- [ ] Code and test
- [ ] Check logs if issues
- [ ] Stop with `docker-compose down`

---

## 🆘 Getting Help

### Check Logs
```bash
docker-compose logs
```

### Check Container Status
```bash
docker-compose ps
docker inspect <container_name>
```

### Restart Everything
```bash
docker-compose down
docker-compose up --build
```

### Clean Start
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

**Happy Coding! 🎮**

*For more information, check the main README.md*
