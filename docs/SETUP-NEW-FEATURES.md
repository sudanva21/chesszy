# 🚀 Setup Guide for New Features

## Quick Overview

Your chess game now has **8 major new features**:
1. ✅ Fixed piece positioning
2. ✅ AI Bot opponent (Easy/Medium/Hard)
3. ✅ User authentication
4. ✅ Points system (+20 win, -10 loss)
5. ✅ User profiles with editable usernames
6. ✅ Match history tracking
7. ✅ Global leaderboard
8. ✅ Enhanced homepage

---

## 🗄️ Step 1: Update Supabase Database (CRITICAL)

### You MUST run the new SQL schema!

1. **Open Supabase Dashboard** → Your project → SQL Editor

2. **Copy the entire contents** of this file:
   ```
   supabase/schema-complete.sql
   ```

3. **Paste into SQL Editor** and click **Run**

4. **What this creates:**
   - `profiles` table (user data, points, stats)
   - `games` table (updated with bot support)
   - `match_history` table (game records)
   - `leaderboard` view (rankings)
   - Triggers for auto-updating stats
   - Row Level Security policies

5. **Verify it worked:**
   - Check Tables section - you should see:
     - ✅ profiles
     - ✅ games  
     - ✅ match_history
   - Check Views section:
     - ✅ leaderboard

---

## 🔐 Step 2: Enable Email Authentication

### In Supabase Dashboard:

1. Go to **Authentication** → **Providers**

2. Find **Email** provider

3. Make sure it's **Enabled** (toggle should be ON)

4. **Optional but recommended:**
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation email
   - Customize password reset email

5. **Test it works:**
   - Your app will show sign in/sign up buttons
   - Try creating a test account
   - Check your email for confirmation

---

## 🎮 Step 3: Test All Features

### Test Checklist:

#### Authentication:
- [ ] Click "Sign In / Sign Up" button
- [ ] Create account with email/password/username
- [ ] Check email for confirmation
- [ ] Sign in with credentials
- [ ] See your username and 500 points in header
- [ ] Sign out works

#### Bot Games:
- [ ] Click "Play vs AI" button
- [ ] Select difficulty (Easy/Medium/Hard)
- [ ] Start bot game
- [ ] Play a few moves
- [ ] Bot responds automatically
- [ ] No points change after game

#### Multiplayer (Ranked):
- [ ] Sign in on two browsers/devices
- [ ] Create game on first device
- [ ] Copy game code
- [ ] Join game on second device
- [ ] Play game to completion
- [ ] Winner gets +20 points
- [ ] Loser gets -10 points
- [ ] Both see updated points immediately

#### Profile:
- [ ] Click on your profile button (header)
- [ ] See your stats (points, wins, losses)
- [ ] View match history
- [ ] Click "Edit Username"
- [ ] Change username
- [ ] See new username everywhere

#### Leaderboard:
- [ ] Click "Leaderboard" button
- [ ] See list of players sorted by points
- [ ] Top 3 players have special icons
- [ ] Your rank is shown
- [ ] Stats are accurate

---

## 🐛 Troubleshooting

### Issue: "Cannot read properties of undefined"
**Solution:** Run the SQL schema! The database tables don't exist yet.

### Issue: "Email not confirmed"
**Solution:** 
1. Check Supabase → Authentication → Users
2. Find your test user
3. Manually confirm email, or
4. Click confirmation link in email

### Issue: Bot doesn't move
**Solution:** 
1. Check browser console for errors
2. Make sure you're playing as white (bot is black)
3. Bot moves automatically after your move

### Issue: Points not updating
**Solution:**
1. Check SQL schema was run completely
2. Verify triggers were created
3. Check Supabase logs for errors
4. Must be signed in for points to work

### Issue: Profile shows wrong stats
**Solution:**
1. Refresh the page
2. Check database directly in Supabase
3. Verify match_history table has records

### Issue: Leaderboard is empty
**Solution:**
1. Play some multiplayer games first
2. Check leaderboard view exists
3. Refresh the page
4. At least one player needs games_played > 0

---

## 📋 Verification Checklist

After setup, verify these work:

### Database:
- [ ] Can create new user account
- [ ] Profile created automatically (500 points)
- [ ] Games saved to database
- [ ] Match history records created
- [ ] Leaderboard shows players

### Features:
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Bot games work (all difficulties)
- [ ] Multiplayer games work
- [ ] Points update correctly
- [ ] Match history saves
- [ ] Leaderboard displays
- [ ] Profile editable
- [ ] Username changes work

### UI:
- [ ] Homepage shows auth buttons
- [ ] Logged-in users see profile
- [ ] Stats display correctly
- [ ] Leaderboard link works
- [ ] Profile page loads
- [ ] Match history displays
- [ ] Pieces visible and positioned well

---

## 🎯 Quick Start for Development

```bash
# Make sure dependencies are installed
npm install

# Start dev server
npm run dev

# Open http://localhost:3000

# Create test account
# Play some games
# Check leaderboard
```

---

## 🔑 Environment Variables

Your `.env.local` should have:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**No new environment variables needed!** Everything uses the same Supabase connection.

---

## 📦 New Files Created

### Components:
- `components/AuthModal.tsx` - Sign in/Sign up modal

### Pages:
- `app/page.tsx` - Updated homepage with auth
- `app/leaderboard/page.tsx` - Global rankings
- `app/profile/page.tsx` - User profile and history

### Libraries:
- `lib/auth.ts` - Authentication functions
- `lib/bot.ts` - AI bot logic

### Database:
- `supabase/schema-complete.sql` - Complete database schema

### Documentation:
- `FEATURES-UPDATE.md` - Feature documentation
- `SETUP-NEW-FEATURES.md` - This file

---

## 🎨 UI Changes

### Homepage:
- **Before**: Simple create/join buttons
- **After**: Auth buttons, bot games, profile, stats, leaderboard link

### Header:
- **Before**: Just logo
- **After**: Logo + User info + Leaderboard + Profile + Sign out

### Game Modes:
- **Before**: Only multiplayer
- **After**: Multiplayer (ranked) + Bot games (practice)

---

## 💾 Data Flow

### User Signs Up:
1. Email/password entered
2. Supabase creates auth user
3. Trigger creates profile automatically
4. Profile gets 500 starting points
5. User redirected to homepage

### Playing Multiplayer Game:
1. User creates game
2. Game saved to database
3. Opponent joins
4. Moves synchronized in real-time
5. Game finishes
6. Points calculated (+20/-10)
7. Profiles updated
8. Match history created for both players
9. Leaderboard updates automatically

### Playing Bot Game:
1. User selects difficulty
2. Game created locally
3. User makes move
4. Bot calculates best move
5. Bot moves automatically
6. Repeat until game ends
7. No points change
8. History saved with bot flag

---

## 🔧 Advanced Configuration

### Adjust Points:
Edit `lib/bot.ts`:
```typescript
export function calculatePointsChange(result: 'win' | 'loss' | 'draw'): number {
  switch (result) {
    case 'win':
      return 20  // Change this
    case 'loss':
      return -10 // Change this
    case 'draw':
      return 0   // Change this
  }
}
```

### Adjust Bot Difficulty:
Edit `lib/bot.ts` - Change search depth:
- Easy: depth 1
- Medium: depth 2
- Hard: depth 3

Increase depth = smarter bot (but slower)

### Adjust Starting Points:
Edit SQL schema, find:
```sql
CREATE TABLE IF NOT EXISTS profiles (
  ...
  points INTEGER DEFAULT 500, -- Change this
  ...
);
```

---

## 🎯 Testing Scenarios

### Test Authentication:
1. Sign up → Check email → Confirm → Sign in
2. Sign out → Sign in again
3. Try wrong password (should fail)
4. Create multiple accounts

### Test Bot Games:
1. Play vs Easy bot → Should be beatable
2. Play vs Medium bot → Moderate challenge
3. Play vs Hard bot → Difficult
4. Try all piece movements
5. Test checkmate
6. Test stalemate

### Test Multiplayer:
1. Two browsers, same network
2. Create game on browser 1
3. Join on browser 2
4. Play complete game
5. Check both players' points updated
6. Check both players' history updated

### Test Rankings:
1. Create 3+ accounts
2. Play games between them
3. Check leaderboard order
4. Verify top 3 get special icons
5. Check win rates calculated correctly

---

## 📞 Support

If something doesn't work:

1. **Check browser console** (F12 → Console)
2. **Check Supabase logs** (Dashboard → Logs)
3. **Verify SQL schema** ran completely
4. **Check environment variables** are correct
5. **Try in incognito mode** (clear cache issues)

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] SQL schema executed successfully
- [ ] Email auth enabled in Supabase
- [ ] Test account created and confirmed
- [ ] Can sign in/sign out
- [ ] Bot games work (all 3 difficulties)
- [ ] Multiplayer game played successfully
- [ ] Points updated after multiplayer game
- [ ] Profile displays correct stats
- [ ] Match history shows games
- [ ] Leaderboard displays rankings
- [ ] Username editable in profile
- [ ] No console errors

---

## 🎉 You're Done!

Your chess game now has:
- ✅ Full authentication
- ✅ AI opponent
- ✅ Points system
- ✅ User profiles
- ✅ Match history
- ✅ Global leaderboard

**Start playing and climbing the ranks!** 🏆
