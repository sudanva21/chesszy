'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Users, Bot, Trophy, UserCircle, LogOut, LogIn } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { getCurrentUser, signOut, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Profile {
  username: string
  points: number
  games_won: number
  games_lost: number
}

export default function Home() {
  const router = useRouter()
  const [gameCode, setGameCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [botColor, setBotColor] = useState<'white' | 'black'>('white')
  const [joinError, setJoinError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      const { data } = await getUserProfile(currentUser.id)
      setProfile(data)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
  }

  const createGame = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/game/${code}?host=true`)
  }

  const createBotGame = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/game/${code}?bot=true&difficulty=${botDifficulty}&color=${botColor}`)
  }

  const joinGame = async () => {
    if (!gameCode.trim()) return

    setIsJoining(true)
    setJoinError('')

    try {
      // Check if game exists
      const { data, error } = await supabase
        .from('games')
        .select('id, status, white_player_id, black_player_id')
        .eq('game_code', gameCode.toUpperCase())
        .maybeSingle() // Use maybeSingle instead of single to avoid error when not found

      // Log for debugging
      console.log('Join game query result:', { data, error, gameCode: gameCode.toUpperCase() })

      if (error) {
        console.error('Database error:', error)
        setJoinError('Database error. Please try again.')
        setIsJoining(false)
        return
      }

      if (!data) {
        setJoinError('Game not found! Please check the code.')
        setIsJoining(false)
        return
      }

      // Check if game is already finished
      if (data.status === 'finished') {
        setJoinError('This game has already finished!')
        setIsJoining(false)
        return
      }

      // Check if game is full (both players already joined)
      if (data.white_player_id && data.black_player_id) {
        // If user is one of the players, allow rejoin
        if (user && (data.white_player_id === user.id || data.black_player_id === user.id)) {
          console.log('Rejoining own game')
          router.push(`/game/${gameCode.toUpperCase()}`)
          return
        }
        
        setJoinError('This game is already full!')
        setIsJoining(false)
        return
      }

      // Check if user is trying to join their own game as a second player
      if (user && data.white_player_id === user.id && !data.black_player_id) {
        setJoinError('You cannot join your own game!')
        setIsJoining(false)
        return
      }

      // All checks passed, join the game
      console.log('Joining game:', gameCode.toUpperCase())
      router.push(`/game/${gameCode.toUpperCase()}`)
    } catch (err) {
      console.error('Error joining game:', err)
      setJoinError('Failed to join game. Please try again.')
      setIsJoining(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(gameCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={checkUser}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">3D Chess</h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 transition-all touch-manipulation active:scale-95"
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <span className="text-white font-medium text-sm sm:text-base">Leaderboard</span>
                </button>

                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 transition-all touch-manipulation active:scale-95"
                >
                  <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  <div className="text-left">
                    <div className="text-white font-medium text-sm sm:text-base">{profile?.username}</div>
                    <div className="text-amber-400 text-xs sm:text-sm">{profile?.points} pts</div>
                  </div>
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 sm:gap-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg px-3 py-2 border border-red-500/50 transition-all touch-manipulation active:scale-95"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <span className="text-red-400 font-medium text-sm sm:text-base">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-lg px-4 sm:px-6 py-2 sm:py-3 transition-all touch-manipulation active:scale-95"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-semibold text-sm sm:text-base">Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {/* Multiplayer */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
              Multiplayer
            </h2>
            <p className="text-blue-200 text-center mb-4 text-xs sm:text-sm">
              Play online with friends {user && '(+20 pts on win, -10 on loss)'}
            </p>
            <div className="space-y-3">
              <button
                onClick={createGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl transition-all transform active:scale-95 shadow-lg touch-manipulation"
              >
                Create Game
              </button>
              <input
                type="text"
                placeholder="Enter code"
                value={gameCode}
                onChange={(e) => {
                  setGameCode(e.target.value.toUpperCase())
                  setJoinError('') // Clear error when typing
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && gameCode.trim() && !isJoining) {
                    joinGame()
                  }
                }}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-sm sm:text-base touch-manipulation"
                maxLength={6}
              />
              {joinError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2 text-red-400 text-sm text-center">
                  {joinError}
                </div>
              )}
              <button
                onClick={joinGame}
                disabled={!gameCode.trim() || isJoining}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl transition-all transform active:scale-95 shadow-lg disabled:transform-none touch-manipulation"
              >
                {isJoining ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>

          {/* Bot Game */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
              Play vs AI
            </h2>
            <p className="text-blue-200 text-center mb-4 text-xs sm:text-sm">
              Practice with computer (No points)
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2 text-center">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setBotDifficulty(diff)}
                      className={`py-2 text-xs sm:text-sm rounded-lg font-medium transition-all touch-manipulation active:scale-95 ${
                        botDifficulty === diff
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-blue-200 hover:bg-white/20'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2 text-center">
                  Your Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBotColor('white')}
                    className={`py-2 text-xs sm:text-sm rounded-lg font-medium transition-all touch-manipulation active:scale-95 ${
                      botColor === 'white'
                        ? 'bg-white text-slate-900'
                        : 'bg-white/10 text-blue-200 hover:bg-white/20'
                    }`}
                  >
                    ⚪ White
                  </button>
                  <button
                    onClick={() => setBotColor('black')}
                    className={`py-2 text-xs sm:text-sm rounded-lg font-medium transition-all touch-manipulation active:scale-95 ${
                      botColor === 'black'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white/10 text-blue-200 hover:bg-white/20'
                    }`}
                  >
                    ⚫ Black
                  </button>
                </div>
              </div>
              <button
                onClick={createBotGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl transition-all transform active:scale-95 shadow-lg touch-manipulation"
              >
                Start Bot Game
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          {user && profile && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
                Your Stats
              </h2>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-blue-200 text-sm mb-1">Rating Points</div>
                  <div className="text-3xl font-bold text-amber-400">{profile.points}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500/20 rounded-lg p-3">
                    <div className="text-green-200 text-sm">Wins</div>
                    <div className="text-2xl font-bold text-green-400">{profile.games_won}</div>
                  </div>
                  <div className="bg-red-500/20 rounded-lg p-3">
                    <div className="text-red-200 text-sm">Losses</div>
                    <div className="text-2xl font-bold text-red-400">{profile.games_lost}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">♟️</div>
              <p className="text-white font-medium">Full Chess Rules</p>
              <p className="text-blue-200 text-sm mt-1">Professional chess engine</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🎮</div>
              <p className="text-white font-medium">3D Graphics</p>
              <p className="text-blue-200 text-sm mt-1">Stunning visual experience</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-white font-medium">Ranked System</p>
              <p className="text-blue-200 text-sm mt-1">Earn points and climb ranks</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
