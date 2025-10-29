# Quick Setup Guide 🚀

Follow these steps to get your 3D Chess game running in minutes!

## Step 1: Set Up Supabase (5 minutes)

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose an organization or create one
4. Set your project details:
   - **Name**: 3D Chess Multiplayer
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"** and wait 2-3 minutes

### Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy all the SQL code and paste it into the Supabase SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see "Success. No rows returned" ✅

## Step 2: Configure Environment Variables

1. In your project folder, create a file called `.env.local`
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase URL and key from Step 1.

## Step 3: Run the Development Server

Open your terminal in the project folder and run:

```bash
npm run dev
```

Wait a few seconds, then open your browser to:

```
http://localhost:3000
```

You should see the beautiful chess homepage! 🎮

## Step 4: Test Multiplayer

### On Your Computer:

1. Open two browser windows side by side
2. **Window 1**: Click "Create New Game" → Copy the game code
3. **Window 2**: Click "Join Game" → Paste the code
4. Play chess between the two windows!

### With a Friend:

1. **You**: Click "Create New Game"
2. Share the game code via WhatsApp/SMS
3. **Friend**: Opens your deployed URL, clicks "Join Game", enters code
4. Play together in real-time! 🎉

## Step 5: Deploy to Vercel (10 minutes)

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: 3D Chess Multiplayer"
git remote add origin https://github.com/yourusername/chess-game.git
git push -u origin main
```

### Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your chess game repository
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase key
6. Click **"Deploy"**
7. Wait 2-3 minutes ⏳
8. Your game is live! 🚀

You'll get a URL like: `https://your-chess-game.vercel.app`

## Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env.local` file has the correct values
- Make sure you copied the URL and key correctly (no extra spaces)
- Restart the dev server: Stop it (`Ctrl+C`) and run `npm run dev` again

### "3D board not showing"
- Make sure your browser supports WebGL (Chrome, Firefox, Edge, Safari all work)
- Try a different browser
- Check browser console for errors (`F12` → Console tab)

### "Opponent not connecting"
- Make sure both players are using the same deployment URL
- Check that the game code is entered correctly (case-sensitive)
- Verify Supabase realtime is enabled (it should be by default)

### "Dependencies error"
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Now that your game is running:

- 🎨 Customize the board colors in `ChessBoard3D.tsx`
- 🎭 Design custom piece styles in `ChessPiece.tsx`
- 🌈 Change the UI theme in `globals.css`
- 📊 Add move history tracking
- ⏱️ Implement a chess clock
- 🏆 Track wins/losses in Supabase
- 💬 Add a chat feature

Enjoy your 3D chess game! ♟️✨
