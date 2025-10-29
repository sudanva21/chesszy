# 🚀 FRESH SUPABASE PROJECT SETUP

Complete guide to set up your chess game with a brand new Supabase project.

---

## 📋 Step-by-Step Setup (5 Minutes)

### **STEP 1: Create New Supabase Project**

1. Go to https://supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name**: `Chess Game` (or whatever you like)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. ⏱️ Wait 2-3 minutes for project to initialize

---

### **STEP 2: Run the Complete Setup SQL**

1. Once project is ready, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open file: `FRESH-START-COMPLETE.sql` from your project folder
4. **Copy ALL contents** (entire file - 300+ lines)
5. **Paste** into Supabase SQL Editor
6. Click **"RUN"** (or press Ctrl+Enter)
7. ✅ Wait for success message: **"🎉 SETUP COMPLETE!"**

**Expected Output:**
```
🎉 SETUP COMPLETE!
Tables created: 3/3
RLS disabled: 0 (0 = all disabled ✓)
Indexes created: ✓
Triggers created: ✓
Permissions granted: ✓
Realtime enabled: ✓
✅ SUCCESS! Your database is ready!
```

**If you see errors:**
- Make sure you copied the ENTIRE SQL file
- Run it again (it's safe to run multiple times)

---

### **STEP 3: Get Your API Keys**

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

### **STEP 4: Update Your .env.local**

1. Open your project folder
2. Find `.env.local` file (or create it if missing)
3. Replace with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Paste your actual values** from Step 3
5. **Save the file**

---

### **STEP 5: Verify Setup (Optional but Recommended)**

In Supabase SQL Editor, run this quick test:

```sql
-- Test 1: Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return: profiles, games, match_history

-- Test 2: Check RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
-- All should show rowsecurity = false

-- Test 3: Test query works
SELECT COUNT(*) FROM profiles;
-- Should return: 0 (no errors)
```

✅ All working? Perfect!

---

### **STEP 6: Start Your App**

```bash
# In your project terminal
npm run dev
```

Wait for:
```
✓ Ready in 2-3s
○ Local: http://localhost:3000
```

---

### **STEP 7: Test Everything Works**

1. Open http://localhost:3000 in browser
2. Open browser console (F12)
3. Should see:
   ```
   NEXT_PUBLIC_SUPABASE_URL: Set ✓
   NEXT_PUBLIC_SUPABASE_ANON_KEY: Set ✓
   ```
4. **NO 406 errors!** ✅

---

## 🎮 Test the Features

### **Test 1: Sign Up**
1. Click "Sign In / Sign Up"
2. Enter:
   - Email: `test@test.com`
   - Password: `password123`
   - Username: `TestPlayer`
3. Click "Sign Up"
4. ✅ Should succeed without errors!

### **Test 2: Profile**
1. Click your profile icon (top right)
2. ✅ Should load and show:
   - Username: TestPlayer
   - Points: 500
   - Games: 0

### **Test 3: Bot Game**
1. Homepage → "Play vs AI"
2. Select "Easy"
3. Click "Start Bot Game"
4. Make a move
5. ✅ Bot should respond!

### **Test 4: Multiplayer**
1. Homepage → "Create Game"
2. Copy game code
3. ✅ Waiting for opponent screen

### **Test 5: Leaderboard**
1. Click "Leaderboard"
2. ✅ Should show empty or your profile

---

## ✅ What the SQL Setup Does

The `FRESH-START-COMPLETE.sql` creates:

1. **Tables:**
   - ✅ `profiles` - User data, points, stats
   - ✅ `games` - Chess games, FEN positions, status
   - ✅ `match_history` - Game results, points changes

2. **Indexes:**
   - ✅ Optimized queries for usernames, points, game codes

3. **Views:**
   - ✅ `leaderboard` - Sorted player rankings with win rates

4. **Triggers:**
   - ✅ Auto-create profile on user signup
   - ✅ Auto-update `updated_at` timestamps

5. **Permissions:**
   - ✅ RLS completely disabled (no 406 errors!)
   - ✅ Full access for anon and authenticated users

6. **Realtime:**
   - ✅ Enabled for all tables (live game updates)

7. **Helper Functions:**
   - ✅ Update player stats after games
   - ✅ Calculate points changes

---

## 🔍 Troubleshooting

### "Tables already exist" error
- Your project isn't fresh, tables exist already
- Either delete them first, or use existing setup

### Still getting 406 errors
1. Check `.env.local` has correct keys
2. Restart dev server: `npm run dev`
3. Clear browser cache: Ctrl+Shift+R
4. Verify in Supabase Settings → API:
   - "Exposed schemas" includes `public`

### Environment variables not loading
- Make sure `.env.local` is in root folder
- Restart dev server after editing
- Check for typos in variable names

### Can't sign up
- Check browser console for errors
- Verify Supabase email settings (Settings → Authentication)
- For testing, disable email confirmation:
  - Settings → Authentication → Email Auth
  - Turn OFF "Confirm email"

---

## 🎯 Expected File Structure

```
game-project/
├── .env.local                    ← Your API keys (update this!)
├── .env.example                  ← Template
├── FRESH-START-COMPLETE.sql      ← Run this in Supabase!
├── SETUP-NEW-PROJECT.md          ← This guide
├── app/
├── components/
├── lib/
└── supabase/
```

---

## 📊 Database Schema Summary

**profiles:**
- id (UUID, primary key)
- username (unique)
- points (default 500)
- games_played, games_won, games_lost, games_drawn
- timestamps

**games:**
- id (UUID)
- game_code (unique)
- fen (chess position)
- current_turn (white/black)
- white_player_id, black_player_id
- is_bot_game, bot_difficulty
- status (waiting/playing/finished)
- winner, points changes
- timestamps

**match_history:**
- id (UUID)
- game_id, player_id, opponent_id
- result (win/loss/draw)
- points_change
- was_bot_game, bot_difficulty
- timestamp

---

## ✨ Features Enabled

After setup, you'll have:
- ✅ User authentication (signup, signin, signout)
- ✅ User profiles with points and stats
- ✅ Bot games (Easy, Medium, Hard)
- ✅ Multiplayer games with game codes
- ✅ Real-time game synchronization
- ✅ Match history tracking
- ✅ Leaderboard with rankings
- ✅ Points system (+20 win, -10 loss)
- ✅ Beautiful 3D chess board
- ✅ Enhanced piece designs
- ✅ Check highlighting (red king)
- ✅ Captured pieces display
- ✅ Game over modals
- ✅ Retry and difficulty selection

---

## 🎉 You're Done!

Your chess game is now fully set up with a fresh Supabase backend!

**Enjoy playing chess! ♟️**

---

## 🆘 Need Help?

If anything doesn't work:
1. Check browser console for specific errors
2. Verify all steps completed
3. Make sure .env.local has correct keys
4. Restart dev server
5. Clear browser cache

**Most common issue:** Forgot to update `.env.local` with new API keys!
