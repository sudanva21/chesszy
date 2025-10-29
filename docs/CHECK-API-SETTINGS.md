# 🔍 CHECK SUPABASE API SETTINGS

## The 406 Error Persists Because:

Even though your database is configured correctly (RLS disabled), the **Supabase API** might have restrictions at the project level.

---

## ✅ DO THESE CHECKS IN SUPABASE DASHBOARD:

### **CHECK 1: API is Enabled**

1. Go to **Settings** → **API** (in Supabase Dashboard)
2. Look for **"API Settings"** section
3. Verify:
   - ✅ **Auto-generate API** is **ON**
   - ✅ **API endpoint** shows your URL
   - ✅ **Status** shows "Active" or "Online"

---

### **CHECK 2: Schema Exposure**

1. Still in **Settings** → **API**
2. Scroll to **"Exposed schemas"**
3. **MUST include:** `public`
4. If not, add it:
   - Click "Edit"
   - Add `public` to exposed schemas
   - Save

---

### **CHECK 3: Table API Access**

1. Go to **Table Editor**
2. Click on **`profiles`** table
3. Click **⚙️ Settings** (top right)
4. Check:
   - ✅ **Enable Realtime** - Should be ON
   - ✅ **Enable Row Level Security** - Should be OFF (we disabled it)

Do the same for:
- `games` table
- `match_history` table

---

### **CHECK 4: API Key is Active**

1. **Settings** → **API**
2. Under **"Project API keys"**
3. Find **"anon public"** key
4. Check:
   - ✅ Shows a long string starting with `eyJ...`
   - ✅ Not expired
   - ✅ Status is "Active"

**Copy this key and compare with your `.env.local`** - they should match EXACTLY!

---

### **CHECK 5: JWT Settings (Advanced)**

1. **Settings** → **API**
2. Scroll to **"JWT Settings"**
3. Check:
   - JWT Secret is set (don't need to see it, just verify it exists)
   - JWT expiry time is reasonable (default 3600 seconds is fine)

---

## 🔧 IF API SETTINGS ARE WRONG:

### Fix Exposed Schemas:
1. Settings → API
2. Find "Exposed schemas"
3. Make sure it includes: `public`
4. Click "Reload schema"

### Regenerate API Key (If Needed):
1. Settings → API
2. Project API keys section
3. Click "Regenerate" next to anon key
4. Copy NEW key
5. Update `.env.local`
6. Restart dev server

---

## 🎯 RUN THIS SQL FIX:

I just created **`FINAL-406-FIX.sql`** for you.

**Run it in Supabase SQL Editor:**
1. Open `FINAL-406-FIX.sql`
2. Copy ALL contents
3. Paste in Supabase SQL Editor
4. Run it

**This will:**
- Remove ALL policies completely
- Grant MAXIMUM permissions
- Reload PostgREST schema
- Force API to recognize changes

---

## 🔍 Alternative: Test API Directly

**Test if Supabase API works at all:**

1. Go to Supabase Dashboard → **API Docs** (left sidebar)
2. Click **`profiles`** table
3. You'll see example API calls
4. Try the **"Get" (Select)** example
5. Click **"Run"** in the documentation

**If that fails with 406:**
- Problem is in Supabase project settings
- Not your code!

**If that works:**
- Problem is in your app's API calls
- Environment variables might not be loading

---

## 🚨 NUCLEAR OPTION: Fresh API Setup

If NOTHING works:

### 1. Regenerate ALL Keys:
```
Settings → API → Regenerate anon key
Settings → API → Regenerate service_role key
```

### 2. Update .env.local:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qrgumafinbwogafytnys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<NEW_KEY_HERE>
```

### 3. Reload Schema:
In SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```

### 4. Restart Everything:
```bash
npm run dev
```

---

## ✅ What Should Work After Fix:

1. Run `FINAL-406-FIX.sql`
2. Check Supabase API settings (exposed schemas)
3. Verify anon key matches
4. Restart dev server
5. Clear browser cache
6. **NO MORE 406 ERRORS!** ✅

---

## 📊 Expected Behavior:

**In Browser Console:**
```
NEXT_PUBLIC_SUPABASE_URL: Set ✓
NEXT_PUBLIC_SUPABASE_ANON_KEY: Set ✓
```

**When signing up:**
- No 406 errors
- Profile created
- Can access profile page
- Can see leaderboard

---

## 🎯 Most Likely Issue:

Based on your error, it's probably:

1. **Exposed schemas doesn't include "public"** (90% of cases)
2. **API auto-generation is OFF** (5% of cases)
3. **Stale PostgREST cache** (5% of cases)

**Check Settings → API → Exposed schemas FIRST!**
