# 🎮 Stellar Games Portal

**A modern gaming portal with 12 classic games, real-time leaderboard, multiplayer support, and achievement system.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/stellar-games)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

---

## 🌟 **Features**

### **🎯 12 Classic Games**
- Snake
- PacMan
- Flappy Bird
- 2048
- Memory Match
- Tic-Tac-Toe (Multiplayer)
- Rock Paper Scissors (Multiplayer)
- Simon Says
- Typing Test
- Connect Four (Multiplayer)
- Minesweeper
- Wordle

### **🏆 Real-time Features**
- ⚡ Live leaderboard with auto-refresh (15s interval)
- 👥 Player online tracking with heartbeat system
- 🎮 Multiplayer games with Socket.IO
- 📊 Global stats and top server rankings
- ⏱️ Countdown timers with color indicators

### **🎁 Gamification**
- 🏅 Achievement system (30+ achievements)
- 🎯 Daily challenges
- 💎 Reward system with coins
- 📈 Player progression tracking
- 🎨 Beautiful anime GIF backgrounds

### **📱 Responsive Design**
- ✅ Mobile-friendly (320px+)
- ✅ Tablet optimized (768px+)
- ✅ Desktop full experience (1024px+)
- ✅ Touch controls for mobile
- ✅ Keyboard controls for desktop

---

## 🚀 **Quick Start**

### **🎯 Want to Deploy? Start Here!**

📖 **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Complete deployment overview & recommendations

---

### **🎯 Pilihan Deployment:**

#### **Option 1: Railway All-in-One (RECOMMENDED - 5 menit!)**

Backend + Frontend dalam 1 platform - **PALING SIMPLE!**

📖 **Quick Start**: [QUICK_START_RAILWAY.md](./QUICK_START_RAILWAY.md)  
📖 **Tutorial Lengkap**: [docs/deployment/DEPLOY_RAILWAY_ALLINONE.md](./docs/deployment/DEPLOY_RAILWAY_ALLINONE.md)

**Quick Steps:**
1. **Push to GitHub** → `git push`
2. **Railway** → Deploy from GitHub
3. **Set env vars** → Add CORS_ORIGIN & FRONTEND_URL
4. **Done!** Website LIVE! 🎉

**Keuntungan:**
- ✅ 1 platform (simple!)
- ✅ 1 URL (no CORS issues)
- ✅ Auto deploy on push
- ✅ Gratis ($5 credit/month)

---

#### **Option 2: Railway + Vercel (Best Performance - 15 menit)**

Backend di Railway, Frontend di Vercel - **PALING CEPAT!**

📖 **Tutorial Lengkap**: [docs/deployment/DEPLOY_RAILWAY_VERCEL.md](./docs/deployment/DEPLOY_RAILWAY_VERCEL.md)  
⚡ **Quick Reference**: [docs/deployment/QUICK_DEPLOY_RAILWAY.md](./docs/deployment/QUICK_DEPLOY_RAILWAY.md)

**Quick Steps:**
1. **Push to GitHub** → `git push`
2. **Railway** (Backend) → Deploy `backend_node` folder
3. **Vercel** (Frontend) → Deploy `frontend` folder
4. **Fix CORS** → Add Vercel URL ke Railway env vars
5. **Done!** Website LIVE! 🎉

**Keuntungan:**
- ✅ Frontend super cepat (Vercel CDN)
- ✅ Backend reliable (Railway)
- ✅ Best performance
- ✅ Gratis (both platforms)

---

### **Local Development**

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/stellar-games.git
cd stellar-games

# Start with Docker
docker-compose up -d

# Or start manually:

# Backend
cd backend_node
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Open**: http://localhost:5173

---

## 🏗️ **Tech Stack**

### **Frontend**
- ⚛️ React 19.2.5
- ⚡ Vite 8.0.10
- 🎨 Tailwind CSS 4.2.4
- 🔌 Socket.IO Client 4.8.3
- 🎊 Canvas Confetti 1.9.4

### **Backend**
- 🟢 Node.js 18+
- 🚀 Express 5.2.1
- 🔌 Socket.IO 4.8.3
- ⏰ Node-Cron 3.0.3
- 🏛️ Domain-Driven Design (DDD) Architecture

---

## 📁 **Project Structure**

```
stellar_games/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── games/           # 12 game components
│   │   ├── components/      # UI components
│   │   ├── services/        # API & Socket services
│   │   ├── hooks/           # Custom React hooks
│   │   └── data/            # Static data
│   └── public/
│       └── anime-bg.gif     # Background animation
│
├── backend_node/            # Node.js backend (DDD)
│   ├── src/
│   │   ├── application/     # Use cases
│   │   ├── domain/          # Business logic
│   │   ├── infrastructure/  # External services
│   │   └── interfaces/      # HTTP routes
│   └── package.json
│
├── docs/                    # Documentation
├── docker-compose.yml       # Docker setup
└── README.md               # This file
```

---

## 🎮 **Game Controls**

### **Desktop**
- **Arrow Keys**: Movement (Snake, PacMan, 2048)
- **Spacebar**: Jump (Flappy Bird)
- **Mouse Click**: Select/Interact
- **Keyboard**: Type (Typing Test, Wordle)

### **Mobile**
- **Swipe**: Movement (Snake, 2048)
- **Tap**: Jump/Select (Flappy Bird, Memory Match)
- **Touch**: All interactions

---

## 📊 **Features Breakdown**

### **Real-time Leaderboard**
- Auto-refresh every 15 seconds
- Global leaderboard (all players)
- Top server (top 10 players)
- Color indicators:
  - 🟢 Green: Normal (>10s until update)
  - 🟡 Yellow: Warning (6-10s)
  - 🔴 Red: Updating soon (≤5s)
  - 🔵 Blue: Currently updating

### **Player Tracking**
- Heartbeat system (30s interval)
- Auto-disconnect on logout
- Cleanup inactive players (60s timeout)
- Real-time player count

### **Multiplayer Games**
- WebSocket-based (Socket.IO)
- Room system for matchmaking
- Real-time game state sync
- Disconnect handling

### **Achievement System**
- 30+ achievements across all games
- Persistent storage (localStorage)
- Unlock notifications
- Progress tracking

### **Daily Challenges**
- New challenges every day
- Bonus rewards for completion
- Streak tracking
- Challenge history

---

## 🔧 **Configuration**

### **Environment Variables**

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api/v1
NODE_ENV=development
```

**Backend** (`.env`):
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

---

## 📖 **Documentation**

### **Deployment Guides:**
- 📘 **[DEPLOY_RAILWAY_VERCEL.md](./docs/deployment/DEPLOY_RAILWAY_VERCEL.md)** - Complete deployment guide (15 min)
- 📗 **[QUICK_DEPLOY_RAILWAY.md](./docs/deployment/QUICK_DEPLOY_RAILWAY.md)** - Quick reference
- 📋 **[DEPLOYMENT_CHECKLIST.md](./docs/deployment/DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist

### **Technical Docs:**
- 📙 **[ARCHITECTURE.md](./backend_node/ARCHITECTURE.md)** - System architecture
- ⚡ **[PERFORMANCE_OPTIMIZATION.md](./docs/PERFORMANCE_OPTIMIZATION.md)** - Performance guide
- 🎮 **[GAME_OPTIMIZATION_STATUS.md](./docs/GAME_OPTIMIZATION_STATUS.md)** - All games status
- 📱 **[RESPONSIVE_IMPROVEMENTS.md](./docs/RESPONSIVE_IMPROVEMENTS.md)** - Layout guide
- 👤 **[USER_SYSTEM_GUIDE.md](./docs/USER_SYSTEM_GUIDE.md)** - User system docs

### **Other Guides:**
- 🐳 **[DOCKER_GUIDE.md](./docs/DOCKER_GUIDE.md)** - Docker setup
- 🔧 **[scripts/README.md](./scripts/README.md)** - Available scripts

---

## 🐛 **Troubleshooting**

### **CORS Error**
- Check `CORS_ORIGIN` in backend `.env`
- Verify URL matches exactly (including https://)

### **WebSocket Not Connecting**
- Check `FRONTEND_URL` in backend `.env`
- Verify Socket.IO proxy configuration

### **Games Not Loading**
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors
- Verify API URL in frontend `.env`

### **Backend Not Responding**
- Check backend logs
- Verify backend is running
- Test health endpoint: `/health`

---

## 🤝 **Contributing**

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the ISC License.

---

## 🙏 **Acknowledgments**

- React team for the amazing framework
- Vite for blazing fast build tool
- Socket.IO for real-time communication
- Tailwind CSS for utility-first CSS
- All open-source contributors

---

## 📞 **Support**

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/stellar-games/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/YOUR_USERNAME/stellar-games/discussions)

---

## 🎯 **Roadmap**

- [ ] Add more games (Tetris, Space Invaders, etc.)
- [ ] User authentication (JWT)
- [ ] Database integration (PostgreSQL)
- [ ] Friend system
- [ ] Chat functionality
- [ ] Tournament mode
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] SEO optimization

---

## 📊 **Stats**

- **Games**: 12
- **Achievements**: 30+
- **Lines of Code**: ~15,000+
- **Components**: 50+
- **API Endpoints**: 15+
- **Real-time Events**: 10+

---

## 🌟 **Star History**

If you like this project, please give it a ⭐ on GitHub!

---

**🎮 Built with ❤️ by Stellar Games Team**

**Live Demo**: [[stellar-games.up.railway.app](stellar-games.up.railway.app)](https://stellar-games.up.railway.app/)

---

## 📸 **Screenshots**

### Homepage
![Homepage](./docs/screenshots/homepage.png)

### Games
![Games](./docs/screenshots/games.png)

### Leaderboard
![Leaderboard](./docs/screenshots/leaderboard.png)

### Achievements
![Achievements](./docs/screenshots/achievements.png)

---

**Made with 🎮 and ☕**
