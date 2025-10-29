# ⚡ QUICK START - New Supabase Project

## 3-Minute Setup Checklist

### ☑️ 1. Create Supabase Project
- Go to https://supabase.com
- Click "New Project"
- Wait for initialization (2-3 min)

### ☑️ 2. Run SQL Setup
- Supabase → SQL Editor
- Copy **ALL** of `FRESH-START-COMPLETE.sql`
- Paste and **RUN**
- Look for: **"🎉 SETUP COMPLETE!"**

### ☑️ 3. Get API Keys
- Supabase → Settings → API
- Copy:
  - Project URL
  - anon public key

### ☑️ 4. Update .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key...
```

### ☑️ 5. Start App
```bash
npm run dev
```

### ☑️ 6. Test
- Open http://localhost:3000
- Sign up
- Play vs AI
- No 406 errors! ✅

---

## 🎯 What You Get

✅ Complete database setup  
✅ User authentication  
✅ Bot games (3 difficulties)  
✅ Multiplayer with real-time sync  
✅ Points & leaderboard  
✅ Match history  
✅ NO 406 errors!  

---

## 📁 Key Files

- **FRESH-START-COMPLETE.sql** ← Run this in Supabase
- **SETUP-NEW-PROJECT.md** ← Detailed guide
- **.env.local** ← Put your API keys here

---

## ⚠️ Common Mistakes

❌ Forgot to update `.env.local`  
❌ Didn't restart dev server  
❌ Copied wrong API key (use anon, not service_role)  
❌ Didn't run ENTIRE SQL file  

---

## 🆘 Troubleshooting

**Still 406 errors?**
1. Check `.env.local` has correct keys
2. Restart: `npm run dev`
3. Clear browser: Ctrl+Shift+R

**Can't sign up?**
- Supabase → Settings → Authentication
- Disable "Confirm email" for testing

---

**That's it! Your chess game is ready! ♟️**
