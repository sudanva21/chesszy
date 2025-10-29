'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, ArrowLeft, Medal, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface LeaderboardEntry {
  id: string
  username: string
  avatar_url: string | null
  points: number
  games_played: number
  games_won: number
  games_lost: number
  games_drawn: number
  win_rate: number
  rank: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(100)

      if (error) throw error
      setLeaders(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500'
    if (rank === 2) return 'from-gray-300 to-gray-400'
    if (rank === 3) return 'from-orange-400 to-amber-600'
    return 'from-blue-400 to-indigo-500'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return '🏅'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <Trophy className="w-10 h-10 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white">Loading...</div>
          ) : leaders.length === 0 ? (
            <div className="p-12 text-center text-blue-200">
              No players yet. Be the first to play!
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {leaders.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-4 flex items-center gap-4 hover:bg-white/5 transition-colors ${
                    index < 3 ? 'bg-white/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="w-16 text-center">
                    {player.rank <= 3 ? (
                      <span className="text-3xl">{getRankIcon(player.rank)}</span>
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        #{player.rank}
                      </span>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        {player.username}
                      </h3>
                      {player.rank <= 10 && (
                        <span className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-300">
                          Top 10
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-blue-200 mt-1">
                      <span>{player.games_played} games</span>
                      <span className="text-green-400">{player.games_won}W</span>
                      <span className="text-red-400">{player.games_lost}L</span>
                      <span className="text-gray-400">{player.games_drawn}D</span>
                      <span>{player.win_rate}% win rate</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-amber-400">
                      {player.points}
                    </div>
                    <div className="text-xs text-blue-200">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">How Points Work</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-green-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">+20</div>
              <div className="text-sm text-green-200">Win a multiplayer game</div>
            </div>
            <div className="bg-red-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400 mb-1">-10</div>
              <div className="text-sm text-red-200">Lose a multiplayer game</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 mb-1">500</div>
              <div className="text-sm text-blue-200">Starting points</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
