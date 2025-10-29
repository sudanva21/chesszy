# 📝 Changelog

All notable changes to 3D Chess Multiplayer will be documented in this file.

---

## [2.0.0] - 2025-10-29

### ✨ Added

**Undo Move Feature for Bot Games:**
- Players can now undo moves when playing against bots
- Undoes both player's move and bot's response
- Beautiful purple gradient button with RotateCcw icon
- Disabled during bot's thinking time
- Only available in bot games (not multiplayer for fairness)
- Sound feedback when undoing
- Helps beginners learn and practice strategies

**Opponent Username Display:**
- Shows actual opponent username in multiplayer games
- Real-time fetching from profiles database
- Displays "Connected" status in green
- Works for both host and joiner
- Auto-fetches on join, rejoin, and real-time updates
- Better social experience and personalization

### 🔧 Changed

- Updated game store to track move history
- Enhanced multiplayer UI with opponent information
- Improved bot game experience with undo capability
- Better user feedback in multiplayer sessions

### 📦 Technical

- Added `moveHistory` array to Zustand store
- Added `undoMove()` function to store
- Added `fetchOpponentUsername()` function
- Added `handleUndo()` function for undo logic
- Modified `makeMove()` to save positions before moves
- Updated real-time subscription to fetch usernames
- Imported RotateCcw icon from lucide-react

---

## [1.0.0] - 2025-10-XX

### ✨ Initial Release

**Core Features:**
- 3D chess board with Three.js
- 2D board view option
- Toggle between 2D and 3D views
- Bot opponent with 3 difficulty levels (Easy, Medium, Hard)
- Smart bot personalities with unique names
- Multiplayer game system
- Real-time multiplayer via Supabase
- User authentication (signup/login)
- User profiles with avatar support
- Match history tracking
- Leaderboard system
- Points and rating system
- Game result tracking (wins, losses, draws)
- Captured pieces display
- Board orientation (flip for black pieces)
- Sound effects for moves, captures, check, checkmate
- Mobile responsive design
- Beautiful gradient UI
- Game code sharing for multiplayer
- Save and continue bot games
- Profile statistics
- Avatar upload to Supabase Storage

**Technical Stack:**
- Next.js 14
- React 18
- TypeScript
- Three.js for 3D rendering
- Chess.js for game logic
- Supabase for backend
- Zustand for state management
- Tailwind CSS for styling
- Lucide React for icons

---

## [Unreleased]

### 🔮 Future Ideas

- Move history panel
- Navigate through past moves
- Export games as PGN
- Move analysis
- Hint system for beginners
- More bot personalities
- Custom themes
- Tournament mode
- Time controls
- Chess960 (Fischer Random)
- Analysis board
- Opening book
- Tactics trainer

---

## Version Format

Format: `[MAJOR.MINOR.PATCH]`

- **MAJOR**: Breaking changes or major feature releases
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

---

## Links

- **Full v2.0 Details:** [VERSION-2.0-RELEASE.md](docs/VERSION-2.0-RELEASE.md)
- **Documentation:** [docs/](docs/)
- **Bug Reports:** Check console and match history fixes

---

**Current Version: 2.0.0** 🎉

*Last Updated: October 29, 2025*
