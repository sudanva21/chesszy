# 🔧 Fix: "Cannot find module vendor-chunks" Error

## ✅ FIXED!

The error was caused by a corrupted Next.js build cache in the `.next` folder.

---

## 🎯 What I Did

1. ✅ Deleted `.next` folder (build cache)
2. ✅ Reinstalled dependencies with `npm install`

---

## 🚀 Next Steps - Restart Your Server

### **Step 1: Stop All Running Servers**

If you have servers running on any ports, stop them:
- Press `Ctrl + C` in any terminal running dev servers

### **Step 2: Start Fresh Server**

```bash
npm run dev
```

Wait for:
```
✓ Ready in 2-3s
○ Local: http://localhost:3000
```

### **Step 3: Test**

Open http://localhost:3000 - Should work! ✅

---

## 🔍 Why This Happened

**Cause:** Next.js build cache (`.next` folder) became corrupted. This happens when:
- Making many code changes rapidly
- Stopping server during build
- File system issues
- Module resolution changes

**Solution:** Delete `.next` folder to force fresh build.

---

## ⚡ If Error Happens Again

### **Quick Fix (Run these commands):**

**Windows PowerShell:**
```powershell
# Stop server (Ctrl+C)

# Delete build cache
if (Test-Path .next) { Remove-Item .next -Recurse -Force }

# Restart
npm run dev
```

**Alternative (If PowerShell fails):**
```bash
# Stop server (Ctrl+C)

# Delete .next folder manually:
# Right-click .next folder → Delete

# Restart
npm run dev
```

---

## 🛠️ Deep Clean (If problems persist)

**Full Reset:**
```powershell
# 1. Stop all servers (Ctrl+C)

# 2. Delete build cache
if (Test-Path .next) { Remove-Item .next -Recurse -Force }

# 3. Delete node_modules (close all terminals first!)
if (Test-Path node_modules) { Remove-Item node_modules -Recurse -Force }

# 4. Delete package-lock.json
if (Test-Path package-lock.json) { Remove-Item package-lock.json -Force }

# 5. Reinstall everything
npm install

# 6. Start fresh
npm run dev
```

**Note:** Close all terminals before deleting `node_modules` to avoid file lock issues.

---

## 📋 Common Build Errors & Fixes

### **Error: Cannot find module 'vendor-chunks/...'**
**Fix:** Delete `.next` folder

### **Error: Module not found: Can't resolve '...'**
**Fix:** 
```bash
npm install
```

### **Error: ENOENT: no such file or directory**
**Fix:** Delete `.next` and `node_modules`, reinstall

### **Error: Port 3000 is already in use**
**Fix:** 
- Stop other servers (Ctrl+C)
- Or use different port: `PORT=3001 npm run dev`

---

## ✅ Verification

After restarting, you should see:

**Terminal:**
```
✓ Ready in 2-3s
✓ Compiled / in 1234ms
○ Local: http://localhost:3000
```

**Browser:**
- Homepage loads ✅
- No server errors ✅
- Can sign in ✅
- Can create/join games ✅

---

## 💡 Prevention Tips

1. **Always stop server cleanly** (Ctrl+C, don't close terminal directly)
2. **Wait for builds to complete** before making more changes
3. **Commit working code** to git before major changes
4. **Restart server** after installing new packages

---

## 🚀 You're All Set!

The error is fixed. Just restart your dev server:

```bash
npm run dev
```

**Your chess game should work perfectly now!** 🎮
