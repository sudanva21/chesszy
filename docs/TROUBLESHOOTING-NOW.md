# 🚨 IMMEDIATE FIXES

## Problem 1: Favicon Error ❌

**Delete the empty favicon.ico file manually:**

1. Navigate to: `app/favicon.ico`
2. Delete this file
3. Keep `app/icon.tsx` (this is the correct one)

**Or use File Explorer:**
- Right-click `app/favicon.ico` → Delete

---

## Problem 2: Profile Page 500 Error ❌

This happens because you're not signed in or database isn't set up.

### Fix A: Sign In First

1. Go to homepage: http://localhost:3000
2. Click **"Sign In / Sign Up"**
3. Create an account
4. Then try accessing profile

### Fix B: Check Database Setup

**You MUST run the schema first!** Did you run this SQL in Supabase?

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_history DISABLE ROW LEVEL SECURITY;
```

---

## Step-by-Step Fix RIGHT NOW:

### 1. Delete Favicon (Manual)
- Open `game-project/app` folder
- Delete `favicon.ico` file
- Keep `icon.tsx`

### 2. Restart Dev Server
```bash
# Press Ctrl+C to stop
npm run dev
```

### 3. Clear Browser Cache
- Press `Ctrl+Shift+R` (hard refresh)
- Or use Incognito mode

### 4. Test Flow
1. Go to http://localhost:3000
2. Click "Sign In / Sign Up"
3. Create account with:
   - Email: test@test.com
   - Password: password123
   - Username: TestUser
4. After signup, you should be redirected
5. Now try clicking Profile

---

## If Still Getting Errors:

### Check Console for Specific Error

Look for errors that say:
- `relation "profiles" does not exist` → Run schema SQL
- `406 Not Acceptable` → Run RLS disable SQL
- `401 Unauthorized` → Check .env.local
- `500 Internal Server Error` → Check you're signed in

---

## Nuclear Reset (If Nothing Works):

### 1. Delete Node Modules & Reinstall
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### 2. Reset Supabase (CAREFUL!)
```sql
-- This deletes ALL data
DROP TABLE IF EXISTS match_history CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run schema-complete.sql again
```

### 3. Check Environment Variables
```env
# .env.local must have:
NEXT_PUBLIC_SUPABASE_URL=https://qrgumafinbwogafytnys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key_here
```

---

## Quick Diagnostic:

**Run this in Supabase SQL Editor:**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return:
-- profiles
-- games
-- match_history
```

**If tables don't exist:**
1. Open `supabase/schema-complete.sql`
2. Copy ALL contents
3. Paste in SQL Editor
4. Run it

---

## Expected Behavior After Fixes:

✅ No favicon errors
✅ Profile page loads (when signed in)
✅ Can create account
✅ Can play games
✅ Leaderboard works

---

## Current Status Check:

Before proceeding, answer these:
- [ ] Did you run the schema SQL in Supabase?
- [ ] Do the tables (profiles, games, match_history) exist?
- [ ] Is your .env.local correct?
- [ ] Are you signed in when trying to access profile?

**If any answer is NO, fix that first!**

---

## The Real Issue:

The **500 error on /profile** means:
1. Server-side error in profile page
2. Usually because database query fails
3. Because tables don't exist OR
4. RLS blocks the query OR
5. User is not signed in

**Most likely: You haven't run the schema SQL yet!**

Go to Supabase → SQL Editor → Run the complete schema from `schema-complete.sql`

Then restart your dev server and try again.
