# Railway Volume Setup - Persistent User Data

## Problem
User registration data is stored in `backend_node/data/users.json`, but Railway uses **ephemeral filesystem**. This means:
- ❌ File is created when user registers
- ❌ File is DELETED when Railway redeploys
- ❌ Users cannot login after redeploy (invalid username/password)

## Solution: Railway Volume (Persistent Storage)

Railway Volumes provide persistent storage that survives redeploys.

---

## Setup Instructions

### Step 1: Create Volume in Railway Dashboard

1. Go to Railway Dashboard: https://railway.app/
2. Select your project: `stellar-games`
3. Click on your service (backend)
4. Go to **"Variables"** tab
5. Scroll down to **"Volumes"** section
6. Click **"+ New Volume"**
7. Configure:
   - **Mount Path:** `/app/backend_node/data`
   - **Name:** `user-data` (or any name)
8. Click **"Add"**

### Step 2: Verify Volume is Mounted

After adding volume, Railway will redeploy automatically.

Check logs for:
```
✅ Loaded X users from file
```

Or if first time:
```
📝 No existing users file, starting fresh
```

### Step 3: Test Registration

1. Register a new user
2. Check Railway logs:
   ```
   ✅ User registered: username
   ```
3. Trigger a redeploy (push new code or manual redeploy)
4. Try to login with same username/password
5. ✅ Should work! (data persisted)

---

## Alternative: Environment Variable for Data Path

If you want to customize the data path, you can add environment variable:

**Railway Dashboard → Variables:**
```
DATA_PATH=/app/backend_node/data
```

Then update `FileAuthRepository.js`:
```javascript
constructor() {
  const dataPath = process.env.DATA_PATH || path.join(__dirname, '../../../data');
  this.filePath = path.join(dataPath, 'users.json');
  this.users = new Map();
  this.initialized = false;
}
```

---

## Verification

### Check if Volume is Working:

1. **Register a user:**
   ```
   Username: testuser
   Password: testpass123
   ```

2. **Check Railway logs:**
   ```bash
   # Should see:
   ✅ User registered: testuser
   ```

3. **Trigger redeploy:**
   - Push new code, or
   - Click "Redeploy" in Railway dashboard

4. **Try to login:**
   ```
   Username: testuser
   Password: testpass123
   ```

5. **Expected result:**
   - ✅ Login successful (if volume working)
   - ❌ Invalid username/password (if volume not working)

---

## Troubleshooting

### Issue: Users still lost after redeploy

**Possible causes:**
1. Volume not mounted correctly
2. Mount path incorrect
3. Permissions issue

**Solution:**
1. Check Railway logs for errors
2. Verify mount path: `/app/backend_node/data`
3. Check volume status in Railway dashboard

### Issue: Cannot write to volume

**Possible causes:**
1. Permissions issue
2. Volume full

**Solution:**
1. Check Railway logs for write errors
2. Check volume size in dashboard
3. Increase volume size if needed

---

## Future: Migrate to Database

For production, consider migrating to PostgreSQL or MongoDB:

**Benefits:**
- ✅ Better performance
- ✅ More reliable
- ✅ Easier to scale
- ✅ Better query capabilities
- ✅ Automatic backups

**Railway provides free PostgreSQL:**
1. Add PostgreSQL service in Railway
2. Get connection string from variables
3. Update backend to use database instead of file

---

## Current Status

- ✅ Backend code supports file-based storage
- ✅ Auto-creates `data` directory
- ✅ Auto-creates `users.json` file
- ⚠️ **NEEDS RAILWAY VOLUME** for persistence
- ⏳ **TODO:** Setup volume in Railway dashboard

---

## Quick Fix (Temporary)

If you can't setup volume right now, users will need to:
1. Register again after each redeploy
2. This is NOT ideal for production
3. Setup volume ASAP for better UX
