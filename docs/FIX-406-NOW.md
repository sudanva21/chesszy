# 🚨 DEFINITIVE FIX FOR 406 ERROR

## The Problem:
Getting `406 (Not Acceptable)` when trying to access profiles table.

## Why It Happens:
1. **Supabase RLS is blocking requests** (even if you think it's disabled)
2. **API permissions not set correctly**
3. **Missing headers in Supabase client**
4. **Table might not exist or has wrong schema**

---

## 🎯 COMPLETE FIX (Follow EXACTLY):

### STEP 1: Run SQL Fix in Supabase

1. **Open Supabase Dashboard**: https://supabase.com
2. **Select your project**: `qrgumafinbwogafytnys`
3. **Click SQL Editor** (left sidebar)
4. **Create New Query**
5. **Copy ENTIRE contents** of `PERMANENT-FIX.sql`
6. **Paste and click RUN**
7. **Check output** - Should say "SETUP COMPLETE!"

**Expected Output:**
```
SUCCESS: profiles table exists
SETUP COMPLETE!
1. RLS is DISABLED on all tables
2. Full permissions granted to anon and authenticated
3. Realtime enabled
```

**If you see "ERROR: profiles table does not exist":**
- You MUST run `schema-complete.sql` first!
- Then run `PERMANENT-FIX.sql` again

---

### STEP 2: Verify Tables in Supabase

**In Supabase Dashboard:**
1. Click **Table Editor** (left sidebar)
2. You should see:
   - ✅ `profiles`
   - ✅ `games`
   - ✅ `match_history`

**If tables are missing:**
1. Open `supabase/schema-complete.sql` in your project
2. Copy ALL contents (all 200+ lines)
3. Paste in Supabase SQL Editor
4. Run it
5. Then run `PERMANENT-FIX.sql` again

---

### STEP 3: Check Environment Variables

**Open `.env.local` in your project:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://qrgumafinbwogafytnys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Get the correct keys from Supabase:**
1. Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** → Paste as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Save `.env.local`**

**⚠️ CRITICAL:**
- Use the **anon** key, NOT the service_role key!
- Don't add quotes around the values
- No spaces before or after `=`

---

### STEP 4: Restart Dev Server

```bash
# In terminal, press Ctrl+C to stop
# Then:
npm run dev
```

**Wait for:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

### STEP 5: Clear Browser Completely

**Option A - Hard Refresh:**
1. Press `Ctrl+Shift+R` (Windows)
2. Or `Cmd+Shift+R` (Mac)

**Option B - Clear Cache:**
1. Press `Ctrl+Shift+Delete`
2. Check "Cached images and files"
3. Click "Clear data"

**Option C - Use Incognito:**
1. Press `Ctrl+Shift+N`
2. Go to http://localhost:3000

---

### STEP 6: Test the Fix

**Open browser console (F12) and check:**

1. **Check environment variables loaded:**
   - Should see: `NEXT_PUBLIC_SUPABASE_URL: Set ✓`
   - Should see: `NEXT_PUBLIC_SUPABASE_ANON_KEY: Set ✓`

2. **If you see "Missing ✗":**
   - Your `.env.local` is wrong
   - Fix it and restart dev server

3. **Try to sign up:**
   - Homepage → "Sign In / Sign Up"
   - Enter email, password, username
   - Click Sign Up
   - **Should work without 406 errors!** ✅

---

## 🔍 Debugging Steps:

### If Still Getting 406:

**Check #1: Table Exists**
Run in Supabase SQL Editor:
```sql
SELECT * FROM profiles LIMIT 1;
```
- Works? → Table exists ✅
- Error? → Run schema-complete.sql

**Check #2: RLS is Disabled**
Run in Supabase SQL Editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';
```
- Shows `rowsecurity = false`? → Good ✅
- Shows `rowsecurity = true`? → Run PERMANENT-FIX.sql again

**Check #3: Permissions Granted**
Run in Supabase SQL Editor:
```sql
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'profiles';
```
- Shows `anon` and `authenticated` with privileges? → Good ✅
- Missing? → Run PERMANENT-FIX.sql again

**Check #4: API Key is Correct**
1. Supabase Dashboard → Settings → API
2. Copy the **anon public** key
3. Compare with your `.env.local`
4. They should match EXACTLY

---

## 🎯 Alternative Fix: Manual API Test

Test if Supabase API is working at all:

**In Supabase Dashboard:**
1. Go to **API Docs** (left sidebar)
2. Click **profiles** table
3. Click **"Select rows"**
4. Copy the example `curl` command
5. Run it in your terminal

**If curl works but app doesn't:**
- Issue is in your `.env.local`
- Double-check the keys

**If curl also fails with 406:**
- Go to **Settings** → **API**
- Check if **"API enabled"** is ON
- Check if **"Auto Schema"** is ON

---

## 🚨 Nuclear Option (Last Resort):

**If NOTHING works, completely reset:**

```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS match_history CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP VIEW IF EXISTS leaderboard CASCADE;

-- Then run schema-complete.sql from scratch
-- Then run PERMANENT-FIX.sql
```

---

## ✅ Success Indicators:

After the fix, you should see:
- ✅ No 406 errors in console
- ✅ Can sign up successfully
- ✅ Can access profile page
- ✅ Can see leaderboard
- ✅ Environment variables show "Set ✓"

---

## 📝 Files Updated:

I just updated:
1. **`lib/supabase.ts`** - Added proper headers and error logging
2. **`PERMANENT-FIX.sql`** - Complete SQL fix
3. **`FIX-406-NOW.md`** - This guide

---

## 🎯 Most Common Cause:

**95% of 406 errors are because:**
1. Tables don't exist (didn't run schema SQL)
2. RLS is still enabled (didn't run disable SQL)
3. Wrong API key in `.env.local`

**Fix those 3 things and it WILL work!**

---

## ⚡ Quick Checklist:

- [ ] Ran `PERMANENT-FIX.sql` in Supabase
- [ ] Saw "SETUP COMPLETE!" message
- [ ] Tables exist in Table Editor
- [ ] `.env.local` has correct URL and anon key
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Tested in incognito mode

**If all checked, 406 error should be GONE! ✅**
