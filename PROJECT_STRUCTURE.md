# 📁 Project Structure - Stellar Games

**Clean and organized project structure for easy navigation.**

---

## 🗂️ **Root Directory**

```
stellar_games/
├── 📁 backend_node/          # Backend (Node.js + Express)
├── 📁 frontend/              # Frontend (React + Vite)
├── 📁 docs/                  # Documentation
├── 📁 scripts/               # Utility scripts
├── 📄 .gitignore            # Git ignore rules
├── 📄 docker-compose.yml    # Docker development
├── 📄 docker-compose.prod.yml # Docker production
├── 📄 vercel.json           # Vercel configuration
├── 📄 README.md             # Main documentation
└── 📄 PROJECT_STRUCTURE.md  # This file
```

---

## 📁 **Backend (`backend_node/`)**

```
backend_node/
├── 📁 src/
│   ├── 📁 application/      # Use cases
│   ├── 📁 domain/           # Business logic
│   ├── 📁 infrastructure/   # External services
│   ├── 📁 interfaces/       # HTTP routes
│   ├── 📁 config/           # Configuration
│   └── 📁 shared/           # Shared utilities
├── 📄 package.json          # Dependencies
├── 📄 Dockerfile            # Docker dev
├── 📄 Dockerfile.prod       # Docker production
├── 📄 railway.toml          # Railway config
├── 📄 .env.example          # Environment template
└── 📄 ARCHITECTURE.md       # Architecture docs
```

**Key Files:**
- `src/index.js` - Entry point
- `src/server.js` - Express server
- `src/config/database.js` - Database config

---

## 📁 **Frontend (`frontend/`)**

```
frontend/
├── 📁 src/
│   ├── 📁 games/            # 12 game components
│   ├── 📁 components/       # UI components
│   ├── 📁 services/         # API services
│   ├── 📁 hooks/            # Custom hooks
│   ├── 📁 data/             # Static data
│   ├── 📁 utils/            # Utilities
│   └── 📄 App.jsx           # Main app
├── 📁 public/               # Static assets
├── 📄 package.json          # Dependencies
├── 📄 vite.config.js        # Vite config
├── 📄 .env.example          # Environment template
└── 📄 index.html            # HTML template
```

**Key Files:**
- `src/App.jsx` - Main application
- `src/index.css` - Global styles
- `src/services/api.js` - API client

---

## 📁 **Documentation (`docs/`)**

```
docs/
├── 📁 deployment/           # Deployment guides
│   ├── 📄 DEPLOY_RAILWAY_VERCEL.md
│   ├── 📄 QUICK_DEPLOY_RAILWAY.md
│   ├── 📄 DEPLOYMENT_CHECKLIST.md
│   ├── 📄 DEPLOYMENT_READY_SUMMARY.md
│   ├── 📄 PRE_DEPLOYMENT_AUDIT.md
│   └── 📄 README.md
├── 📄 COMPLETE_IMPLEMENTATION_GUIDE.md
├── 📄 DOCKER_GUIDE.md
├── 📄 MULTIPLAYER_IMPLEMENTATION.md
├── 📄 GAME_OPTIMIZATION_STATUS.md
├── 📄 PERFORMANCE_OPTIMIZATION.md
├── 📄 RESPONSIVE_IMPROVEMENTS.md
└── 📄 USER_SYSTEM_GUIDE.md
```

**Categories:**
- **Deployment:** All deployment-related docs
- **Technical:** Performance, optimization, architecture
- **Guides:** Implementation and setup guides

---

## 📁 **Scripts (`scripts/`)**

```
scripts/
├── 📄 start-docker.bat      # Start Docker (Windows)
├── 📄 stop-docker.bat       # Stop Docker (Windows)
├── 📄 test_complete_system.js
├── 📄 test_realtime_verification.js
└── 📄 README.md
```

**Purpose:**
- Docker automation scripts
- System testing scripts
- Development utilities

---

## 📄 **Root Files**

### **Configuration Files:**
- `.gitignore` - Git ignore rules
- `docker-compose.yml` - Docker development setup
- `docker-compose.prod.yml` - Docker production setup
- `vercel.json` - Vercel deployment config

### **Documentation Files:**
- `README.md` - Main project documentation
- `PROJECT_STRUCTURE.md` - This file

---

## 🎯 **Quick Navigation**

### **Want to Deploy?**
→ Start here: [`docs/deployment/DEPLOY_RAILWAY_VERCEL.md`](./docs/deployment/DEPLOY_RAILWAY_VERCEL.md)

### **Want to Understand Architecture?**
→ Read: [`backend_node/ARCHITECTURE.md`](./backend_node/ARCHITECTURE.md)

### **Want to Optimize Performance?**
→ Read: [`docs/PERFORMANCE_OPTIMIZATION.md`](./docs/PERFORMANCE_OPTIMIZATION.md)

### **Want to Run Tests?**
→ Check: [`scripts/README.md`](./scripts/README.md)

### **Want to Use Docker?**
→ Read: [`docs/DOCKER_GUIDE.md`](./docs/DOCKER_GUIDE.md)

---

## 📊 **File Count**

| Category | Count |
|----------|-------|
| **Games** | 12 files |
| **Components** | 50+ files |
| **Services** | 15+ files |
| **Documentation** | 20+ files |
| **Scripts** | 4 files |
| **Total** | ~100+ files |

---

## 🔍 **Finding Files**

### **By Feature:**

**Games:**
- `frontend/src/games/Snake.jsx`
- `frontend/src/games/PacMan.jsx`
- etc.

**Leaderboard:**
- `frontend/src/components/LeaderboardSection.jsx`
- `backend_node/src/application/useCases/leaderboard/`

**Achievements:**
- `frontend/src/services/achievementService.js`
- `frontend/src/components/AchievementButton.jsx`

**Multiplayer:**
- `backend_node/src/infrastructure/socket/SocketServer.js`
- `frontend/src/components/MultiplayerLobby.jsx`

---

## 📝 **Naming Conventions**

### **Files:**
- **Components:** PascalCase (e.g., `GameCard.jsx`)
- **Services:** camelCase (e.g., `gameService.js`)
- **Utilities:** camelCase (e.g., `logger.js`)
- **Docs:** UPPERCASE (e.g., `README.md`)

### **Folders:**
- **Lowercase:** `games/`, `components/`, `services/`
- **Descriptive:** Clear purpose from name

---

## 🎨 **Code Organization**

### **Frontend:**
```
Feature-based organization:
- Games → games/
- UI Components → components/
- Business Logic → services/
- Reusable Hooks → hooks/
- Static Data → data/
```

### **Backend:**
```
DDD (Domain-Driven Design):
- Use Cases → application/
- Business Logic → domain/
- External Services → infrastructure/
- HTTP Layer → interfaces/
```

---

## ✅ **Clean Structure Benefits**

1. **Easy Navigation** ✅
   - Clear folder structure
   - Logical organization
   - Quick file finding

2. **Maintainability** ✅
   - Separated concerns
   - Modular code
   - Easy to update

3. **Scalability** ✅
   - Room for growth
   - Clear patterns
   - Easy to extend

4. **Collaboration** ✅
   - Clear structure
   - Easy onboarding
   - Team-friendly

---

## 📚 **Related Documentation**

- **Main README:** [`README.md`](./README.md)
- **Deployment:** [`docs/deployment/`](./docs/deployment/)
- **Architecture:** [`backend_node/ARCHITECTURE.md`](./backend_node/ARCHITECTURE.md)
- **Scripts:** [`scripts/README.md`](./scripts/README.md)

---

**Last Updated:** 2026-05-02  
**Version:** 1.0.0  
**Status:** ✅ Clean & Organized
