'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Users, Bot, Trophy, UserCircle, LogOut, LogIn } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { getCurrentUser, signOut, getUserProfile } from '@/lib/auth'

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
    router.push(`/game/${code}?bot=true&difficulty=${botDifficulty}`)
  }

  const joinGame = () => {
    if (gameCode.trim()) {
      router.push(`/game/${gameCode.toUpperCase()}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={checkUser}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Crown className="w-10 h-10 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">3D Chess</h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 transition-all"
                >
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-medium">Leaderboard</span>
                </button>

                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 transition-all"
                >
                  <UserCircle className="w-6 h-6 text-blue-400" />
                  <div className="text-left">
                    <div className="text-white font-medium">{profile?.username}</div>
                    <div className="text-amber-400 text-sm">{profile?.points} pts</div>
                  </div>
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg px-4 py-2 border border-red-500/50 transition-all"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-lg px-6 py-3 transition-all"
              >
                <LogIn className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Multiplayer */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Multiplayer
            </h2>
            <p className="text-blue-200 text-center mb-4 text-sm">
              Play online with friends {user && '(+20 pts on win, -10 on loss)'}
            </p>
            <div className="space-y-3">
              <button
                onClick={createGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Create Game
              </button>
              <input
                type="text"
                placeholder="Enter code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono"
                maxLength={6}
              />
              <button
                onClick={joinGame}
                disabled={!gameCode.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                Join Game
              </button>
            </div>
          </div>

          {/* Bot Game */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Play vs AI
            </h2>
            <p className="text-blue-200 text-center mb-4 text-sm">
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
                      className={`py-2 rounded-lg font-medium transition-all ${
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
              <button
                onClick={createBotGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Start Bot Game
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          {user && profile && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
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
