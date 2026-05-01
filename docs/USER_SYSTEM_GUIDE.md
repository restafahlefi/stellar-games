# 👤 User System Guide - Per-User Data Management

## Overview
Stellar Games menggunakan **per-user data storage** untuk achievements dan daily challenges. Setiap user (Guest atau Registered) memiliki data mereka sendiri yang tersimpan secara terpisah.

---

## 🎯 **How It Works**

### **1. User Identity System**

#### **Guest Users** 👻
```javascript
// Format: Guest_XXXXXX (6 digit random)
Guest_123456
Guest_789012
Guest_456789
```

**Characteristics:**
- ✅ Unique ID generated per session
- ✅ Own achievements and challenges
- ✅ Data saved in localStorage per-guest
- ✅ Can return to same guest by remembering the ID

#### **Registered Users** 🎮
```javascript
// Format: Any username (max 15 characters)
JohnDoe
ProGamer123
SnakeMaster
```

**Characteristics:**
- ✅ Custom username
- ✅ Own achievements and challenges
- ✅ Data saved in localStorage per-username
- ✅ Can return anytime with same username

---

### **2. Data Storage Structure**

#### **Per-User Storage** (localStorage)
```javascript
// Each user has their own data namespace
stellar_persistent_Guest_123456 = {
  achievements: { ... },
  dailyChallenges: { ... },
  gameStats: { ... },
  profile: { ... }
}

stellar_persistent_JohnDoe = {
  achievements: { ... },
  dailyChallenges: { ... },
  gameStats: { ... },
  profile: { ... }
}
```

**Benefits:**
- ✅ **Isolated Data** - Each user has separate data
- ✅ **No Conflicts** - Multiple users can use same device
- ✅ **Persistent** - Data saved even after logout
- ✅ **Returnable** - Can return to same user anytime

---

## 🔄 **User Switching Behavior**

### **Scenario 1: Guest → Logout → New Guest**

```
1. Login as Guest_123456
   ✅ Fresh achievements (0/30)
   ✅ Fresh daily challenges (0/12)
   
2. Play games, unlock achievements
   ✅ Guest_123456 has 5 achievements
   ✅ Guest_123456 has 2 daily challenges completed
   
3. Click "✕" (Logout)
   ✅ Session cleared
   ✅ Back to "Identify Yourself" modal
   
4. Click "Continue as Guest" (New Guest)
   ✅ New Guest_789012 created
   ✅ Fresh achievements (0/30) ← NEW USER
   ✅ Fresh daily challenges (0/12) ← NEW USER
   
5. Guest_123456 data still exists in localStorage
   ✅ Can return by entering "Guest_123456" as username
```

**Result:**
- ✅ **Each guest is independent**
- ✅ **No data carried over to new guest**
- ✅ **Old guest data preserved**

---

### **Scenario 2: Guest → Logout → Register Name**

```
1. Login as Guest_123456
   ✅ Guest_123456 has 5 achievements
   ✅ Guest_123456 has 2 daily challenges completed
   
2. Click "✕" (Logout)
   ✅ Session cleared
   ✅ Back to "Identify Yourself" modal
   
3. Enter username "JohnDoe" → Start Playing
   ✅ New user "JohnDoe" created
   ✅ Fresh achievements (0/30) ← NEW USER
   ✅ Fresh daily challenges (0/12) ← NEW USER
   
4. Guest_123456 data still exists separately
   ✅ Can return to Guest_123456 by entering that name
```

**Result:**
- ✅ **Registered user starts fresh**
- ✅ **Guest data not transferred**
- ✅ **Both users exist independently**

---

### **Scenario 3: Registered → Logout → Same Name**

```
1. Login as "JohnDoe"
   ✅ JohnDoe has 10 achievements
   ✅ JohnDoe has 5 daily challenges completed
   
2. Click "✕" (Logout)
   ✅ Session cleared
   ✅ Back to "Identify Yourself" modal
   
3. Enter username "JohnDoe" again → Start Playing
   ✅ Welcome back JohnDoe!
   ✅ Achievements restored (10/30) ← SAME USER
   ✅ Daily challenges restored (5/12) ← SAME USER
```

**Result:**
- ✅ **Data persists for same username**
- ✅ **Can return anytime**
- ✅ **Progress preserved**

---

### **Scenario 4: Multiple Users on Same Device**

```
Device has 3 users:
- Guest_123456 (5 achievements)
- JohnDoe (10 achievements)
- ProGamer (15 achievements)

User can switch between them:
1. Enter "Guest_123456" → See 5 achievements
2. Logout → Enter "JohnDoe" → See 10 achievements
3. Logout → Enter "ProGamer" → See 15 achievements
```

**Result:**
- ✅ **All users coexist**
- ✅ **Each has own data**
- ✅ **No data mixing**

---

## 📊 **Data Isolation**

### **What is Per-User:**
- ✅ **Achievements** - Each user has own unlocked achievements
- ✅ **Daily Challenges** - Each user has own progress
- ✅ **Game Stats** - Each user has own best scores
- ✅ **Profile** - Each user has own XP, level, coins
- ✅ **Rewards** - Each user has own unclaimed rewards

### **What is Global:**
- ✅ **Leaderboard** - All users compete together
- ✅ **Global Stats** - Total players, games played
- ✅ **Top Server** - Best scores across all users

---

## 🎮 **User Experience**

### **For New Users:**
```
1. Open website
2. See "Identify Yourself" modal
3. Options:
   a) Enter username → Start fresh
   b) Continue as Guest → Start fresh
4. Play games, unlock achievements
5. Data saved automatically
```

### **For Returning Users:**
```
1. Open website
2. See "Identify Yourself" modal
3. Enter previous username (e.g., "JohnDoe")
4. Data restored automatically
5. Continue where you left off
```

### **For Switching Users:**
```
1. Click "✕" on username button
2. See "Identify Yourself" modal
3. Enter different username
4. Switch to that user's data
5. Previous user data preserved
```

---

## 🔧 **Technical Implementation**

### **Storage Keys:**
```javascript
// Per-user storage
localStorage.setItem('stellar_persistent_JohnDoe', JSON.stringify({
  achievements: { ... },
  dailyChallenges: { ... },
  gameStats: { ... },
  profile: { ... }
}));

// Session storage (current user)
sessionStorage.setItem('stellar_playerName', 'JohnDoe');
```

### **User Initialization:**
```javascript
// When user logs in
achievementService.setCurrentPlayer(playerName);
rewardSystem.setCurrentPlayer(playerName);

// This loads their specific data from localStorage
const achievements = localStorage.getItem(`stellar_persistent_${playerName}`);
```

### **User Logout:**
```javascript
// When user clicks "✕"
sessionStorage.removeItem('stellar_playerName');
setPlayerName('');
setShowNameModal(true);

// Data remains in localStorage
// Can be restored by entering same username
```

---

## 📝 **Important Notes**

### **✅ DO:**
- Each user gets fresh start
- Data is isolated per username
- Can return to previous user anytime
- Multiple users can share same device

### **❌ DON'T:**
- Guest data is NOT transferred to registered user
- Achievements are NOT shared between users
- Daily challenges are NOT global
- Can't merge two users' data

---

## 🎯 **Use Cases**

### **1. Family Sharing**
```
Dad: "JohnDoe" (20 achievements)
Mom: "JaneDoe" (15 achievements)
Kid: "Guest_123456" (5 achievements)

Each has own progress, no conflicts
```

### **2. Guest Testing**
```
1. Try as Guest_123456
2. Like the game
3. Logout → Register as "ProGamer"
4. Start fresh with registered name
5. Guest_123456 data still exists if want to return
```

### **3. Multiple Accounts**
```
User has 2 accounts:
- "CasualPlayer" (for casual play)
- "ProGamer" (for serious play)

Can switch between them anytime
```

---

## 🔍 **Debugging**

### **Check Current User:**
```javascript
// In browser console
console.log(sessionStorage.getItem('stellar_playerName'));
// Output: "JohnDoe"
```

### **Check User Data:**
```javascript
// In browser console
const playerName = sessionStorage.getItem('stellar_playerName');
const data = localStorage.getItem(`stellar_persistent_${playerName}`);
console.log(JSON.parse(data));
```

### **List All Users:**
```javascript
// In browser console
Object.keys(localStorage)
  .filter(key => key.startsWith('stellar_persistent_'))
  .map(key => key.replace('stellar_persistent_', ''));
// Output: ["Guest_123456", "JohnDoe", "ProGamer"]
```

### **Clear Specific User:**
```javascript
// In browser console
localStorage.removeItem('stellar_persistent_JohnDoe');
// JohnDoe's data deleted
```

### **Clear All Users:**
```javascript
// In browser console
Object.keys(localStorage)
  .filter(key => key.startsWith('stellar_persistent_'))
  .forEach(key => localStorage.removeItem(key));
// All user data deleted
```

---

## 🎨 **UI Indicators**

### **Username Button:**
```
[🟢 JohnDoe ✕]
 ↑    ↑      ↑
 |    |      └─ Logout button
 |    └─ Current username
 └─ Online status (green = online, red = offline)
```

### **Modal States:**
```
1. First Visit:
   "Identify Yourself"
   [Enter username...]
   [🚀 Start Playing]
   [👻 Continue as Guest]

2. After Logout:
   "Identify Yourself"
   [Enter username...]
   [🚀 Start Playing] ← Can enter previous username
   [👻 Continue as Guest] ← Creates new guest
```

---

## 📊 **Data Persistence**

### **What Persists:**
- ✅ Achievements (per-user)
- ✅ Daily challenges (per-user)
- ✅ Game stats (per-user)
- ✅ Profile (XP, level, coins) (per-user)
- ✅ Unclaimed rewards (per-user)

### **What Resets:**
- ✅ Session (on logout)
- ✅ Current user context (on logout)
- ✅ Heartbeat (on logout)

### **What Never Resets:**
- ✅ localStorage data (unless manually cleared)
- ✅ User data (unless user clears browser data)

---

## 🚀 **Best Practices**

### **For Users:**
1. Remember your username to return to your data
2. Guest IDs are random, write them down if want to return
3. Registered names are easier to remember
4. Each user is independent, no data sharing

### **For Developers:**
1. Always call `setCurrentPlayer()` on login
2. Check `currentPlayer` before accessing data
3. Use per-user storage keys
4. Don't mix global and per-user data

---

## ✅ **Summary**

**Current Behavior:**
- ✅ Each user (Guest or Registered) has **own data**
- ✅ Logout **clears session** but **preserves data**
- ✅ New guest gets **fresh start**
- ✅ Same username **restores data**
- ✅ Multiple users can **coexist** on same device

**Benefits:**
- ✅ **Privacy** - Each user has isolated data
- ✅ **Flexibility** - Can switch between users
- ✅ **Persistence** - Data saved permanently
- ✅ **Multi-user** - Family/friends can share device

---

**Last Updated**: 2026-05-02
**Version**: 1.0.0
**Status**: ✅ Per-User System Active
