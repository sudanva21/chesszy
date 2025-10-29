# 🚨 URGENT FIX - Do These 3 Steps

## Problem
- Bot not playing ❌
- Profile/Leaderboard not loading ❌  
- Database tables don't exist ❌

## Solution (15 minutes)

---

### STEP 1: Create Database Tables (MOST IMPORTANT!)

**This fixes profile and leaderboard errors:**

1. Open [supabase.com](https://supabase.com)
2. Open your project: `qrgumafinbwogafytnys`
3. Click **SQL Editor** (left sidebar)
4. Copy **ALL** the SQL from: `supabase/schema-complete.sql`
5. Paste into SQL Editor
6. Click **Run** button
7. Wait for "Success" message

✅ This creates: profiles, games, match_history, leaderboard tables

---

###STEP 2: Replace Game Page (Makes Bot Work)

**Delete and replace the file:**

1. **Delete this file:**
   ```
   app/game/[code]/page.tsx
   ```

2. **Rename this file to `page.tsx`:**
   ```
   app/game/[code]/page-updated.tsx  →  page.tsx
   ```

✅ This integrates the bot AI into your game

---

### STEP 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then run:
npm run dev
```

---

## ✅ After These Steps:

**Bot Games Will Work:**
- Select difficulty → Start game
- Bot makes moves automatically as black
- You play as white

**Profile Will Load:**
- Sign in → See profile with stats
- Edit username
- View match history

**Leaderboard Will Work:**
- Click leaderboard → See rankings
- Top players displayed
- Your rank shown

---

## 🎯 Test Everything:

### Test Bot:
1. Homepage → "Play vs AI"
2. Select "Easy"
3. Click "Start Bot Game"
4. Make a move
5. **Bot should respond within 1 second** ✅

### Test Profile:
1. Sign in (if not already)
2. Click your profile button (top right)
3. Should see your stats ✅
4. Try editing username ✅

### Test Leaderboard:
1. Click "Leaderboard" (top menu)
2. Should see player list ✅
3. No 404 errors ✅

---

## 📝 Quick Checklist:

- [ ] SQL schema run in Supabase
- [ ] Tables created (check Table Editor)
- [ ] Game page replaced with page-updated.tsx
- [ ] Dev server restarted
- [ ] Bot game works (bot moves automatically)
- [ ] Profile loads without errors
- [ ] Leaderboard displays

---

## 🐛 If Still Not Working:

### Bot Not Moving?
- Check browser console (F12)
- Make sure you're playing as white
- Bot only moves when it's black's turn
- Wait 1 second after your move

### Profile/Leaderboard Still 404?
- Verify SQL ran successfully
- Check Supabase Table Editor → see profiles table
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache

### Game Not Loading?
- Check .env.local has correct Supabase URL/key
- Restart dev server
- Try incognito mode

---

## 💡 Why This Fixes Everything:

**Problem 1: Bot Not Playing**
- Old page didn't have bot integration
- New page has useEffect that triggers bot moves
- Bot uses Minimax algorithm to calculate best move

**Problem 2: Profile/Leaderboard Not Loading**
- Tables don't exist in database
- SQL schema creates all necessary tables
- Fixes all 404 errors

**Problem 3: Game Not Working**
- Old page used wrong column names
- New page uses correct schema (white_player_id, etc.)
- Properly handles both multiplayer and bot games

---

## 🎮 How Bot Works Now:

1. You start game as white
2. You make first move
3. Game detects it's black's turn
4. Bot calculates best move using Minimax
5. Bot makes move automatically
6. Back to your turn
7. Repeat until game over

**Bot Difficulty:**
- **Easy**: Makes random moves 70% of time
- **Medium**: Thinks 2 moves ahead
- **Hard**: Thinks 3 moves ahead (very strong!)

---

## ✨ Summary:

**3 Quick Steps:**
1. Run SQL in Supabase ← **Fixes 404 errors**
2. Replace game page ← **Fixes bot**
3. Restart server ← **Applies changes**

**Total Time: 15 minutes**

Then everything will work! 🎉
