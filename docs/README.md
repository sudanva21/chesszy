# 3D Chess Multiplayer 👑

A stunning **3D chess game** with real-time multiplayer functionality. Play chess online with friends using a simple game code system.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Three.js](https://img.shields.io/badge/Three.js-Latest-orange)

## ✨ Features

- **🎮 3D Graphics** - Beautiful 3D chess board and pieces using React Three Fiber
- **👥 Real-time Multiplayer** - Play with friends online using Supabase real-time
- **🔗 Easy Sharing** - Share game codes via WhatsApp or any messaging app
- **♟️ Complete Chess Rules** - Powered by chess.js for accurate game logic
- **📱 Responsive Design** - Works on desktop and mobile devices
- **🚀 Vercel Ready** - Optimized for seamless Vercel deployment

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 + React + TypeScript
- **3D Rendering:** React Three Fiber + Three.js + Drei
- **Game Logic:** chess.js (professional chess engine)
- **Backend:** Supabase (PostgreSQL + Real-time)
- **Styling:** TailwindCSS + Custom Components
- **State Management:** Zustand
- **Deployment:** Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd game-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **Project Settings** → **API**
3. Copy your **Project URL** and **anon/public key**
4. Run the SQL schema:
   - Go to **SQL Editor** in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql`
   - Run the SQL query

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Play

### Creating a Game

1. Click **"Create New Game"** on the homepage
2. You'll be assigned **White** pieces
3. Share the **game code** with your friend
4. Wait for them to join

### Joining a Game

1. Click **"Join Game"** on the homepage
2. Enter the **game code** shared by your friend
3. You'll be assigned **Black** pieces
4. Start playing!

### Game Rules

- Standard chess rules apply
- Click a piece to see valid moves (highlighted in yellow)
- Click a highlighted square to move
- You can only move on your turn
- Game ends on checkmate or draw

## 🚀 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## 🏗️ Project Structure

```
game-project/
├── app/
│   ├── game/[code]/     # Game page (dynamic route)
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles
├── components/
│   ├── ChessBoard3D.tsx # 3D chess board component
│   └── ChessPiece.tsx   # 3D chess piece component
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── store.ts         # Zustand state management
│   └── utils.ts         # Utility functions
├── supabase/
│   └── schema.sql       # Database schema
└── public/              # Static assets
```

## 🎨 Features Explained

### 3D Board Rendering

The chess board uses **React Three Fiber** to render a beautiful 3D scene with:
- Realistic lighting and shadows
- Smooth camera controls (orbit, zoom)
- Interactive pieces with hover effects
- Professional chess piece designs

### Real-time Synchronization

Using **Supabase Realtime**, the game:
- Updates instantly when opponent makes a move
- Shows when opponent connects/disconnects
- Syncs game state across all devices
- No page refresh needed

### Chess Logic

Powered by **chess.js**, ensuring:
- Valid move validation
- Check/checkmate detection
- Castling, en passant, promotion
- Draw conditions (stalemate, insufficient material, etc.)

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding Features

The codebase is structured for easy extension:

- **New piece designs**: Edit `ChessPiece.tsx`
- **Board themes**: Modify colors in `ChessBoard3D.tsx`
- **UI changes**: Update TailwindCSS classes
- **Game modes**: Extend `store.ts` and add new logic

## 🐛 Troubleshooting

### Dependencies Not Installing

```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues

- Verify environment variables are set correctly
- Check if Supabase project is active
- Ensure RLS policies are enabled

### 3D Board Not Rendering

- Check browser WebGL support
- Try a different browser (Chrome/Firefox recommended)
- Clear browser cache

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Three.js, and Supabase**
