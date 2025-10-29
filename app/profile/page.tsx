'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserCircle, Edit, Trophy, Target, TrendingUp, Upload, Camera } from 'lucide-react'
import { getCurrentUser, getUserProfile, updateProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface MatchHistoryEntry {
  id: string
  opponent_name: string
  result: string
  points_change: number
  was_bot_game: boolean
  bot_difficulty: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([])
  const [editing, setEditing] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }

      setUser(currentUser)
      const { data: profileData } = await getUserProfile(currentUser.id)
      setProfile(profileData)
      setNewUsername(profileData?.username || '')
      setAvatarUrl(profileData?.avatar_url || null)

      // Load match history
      const { data: historyData } = await supabase
        .from('match_history')
        .select('*')
        .eq('player_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setMatchHistory(historyData || [])
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time profile updates
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new)
          setAvatarUrl(payload.new.avatar_url)
        }
      )
      .subscribe()

    // Subscribe to match history updates
    const historyChannel = supabase
      .channel(`match_history:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_history',
          filter: `player_id=eq.${user.id}`,
        },
        () => {
          loadProfile() // Reload when new match added
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(historyChannel)
    }
  }, [user?.id])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = fileName // Just the filename, bucket handles the path

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with avatar URL
      await updateProfile(user.id, { avatar_url: data.publicUrl })
      setAvatarUrl(data.publicUrl)
      setProfile({ ...profile, avatar_url: data.publicUrl })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateUsername = async () => {
    if (!user || !newUsername.trim()) return

    try {
      await updateProfile(user.id, { username: newUsername.trim() })
      setProfile({ ...profile, username: newUsername.trim() })
      setEditing(false)
    } catch (error) {
      console.error('Error updating username:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  const winRate = profile.games_played > 0
    ? ((profile.games_won / profile.games_played) * 100).toFixed(1)
    : 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col items-center text-center">
                {/* Avatar with upload */}
                <div className="relative group mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center border-4 border-white/20">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', avatarUrl)
                          e.currentTarget.style.display = 'none'
                        }}
                        onLoad={() => console.log('Image loaded successfully:', avatarUrl)}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <UserCircle className="w-20 h-20 text-white" />
                    )}
                  </div>
                  
                  {/* Upload button overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {uploading ? (
                      <div className="text-white text-sm">Uploading...</div>
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                {editing ? (
                  <div className="w-full space-y-3">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Username"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateUsername}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          setNewUsername(profile.username)
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {profile.username}
                    </h2>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1 text-blue-300 hover:text-blue-200 text-sm mb-4"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Username
                    </button>
                  </>
                )}

                <div className="w-full mt-4 space-y-3">
                  <div className="bg-amber-500/20 rounded-lg p-4">
                    <div className="text-amber-200 text-sm mb-1">Rating</div>
                    <div className="text-4xl font-bold text-amber-400">
                      {profile.points}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-blue-200 text-xs mb-1">Games</div>
                      <div className="text-2xl font-bold text-white">
                        {profile.games_played}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-blue-200 text-xs mb-1">Win Rate</div>
                      <div className="text-2xl font-bold text-white">{winRate}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-500/20 rounded-lg p-3">
                      <div className="text-green-200 text-xs">Wins</div>
                      <div className="text-xl font-bold text-green-400">
                        {profile.games_won}
                      </div>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-3">
                      <div className="text-red-200 text-xs">Losses</div>
                      <div className="text-xl font-bold text-red-400">
                        {profile.games_lost}
                      </div>
                    </div>
                    <div className="bg-gray-500/20 rounded-lg p-3">
                      <div className="text-gray-200 text-xs">Draws</div>
                      <div className="text-xl font-bold text-gray-400">
                        {profile.games_drawn}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match History */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  Match History
                </h3>
              </div>

              <div className="divide-y divide-white/10">
                {matchHistory.length === 0 ? (
                  <div className="p-12 text-center text-blue-200">
                    No games played yet. Start playing to build your history!
                  </div>
                ) : (
                  matchHistory.map((match) => (
                    <div key={match.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold ${
                                match.result === 'win'
                                  ? 'bg-green-500/20 text-green-400'
                                  : match.result === 'loss'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {match.result.toUpperCase()}
                            </span>
                            {match.was_bot_game && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                vs Bot ({match.bot_difficulty})
                              </span>
                            )}
                          </div>
                          <div className="text-white font-medium mt-1">
                            {match.was_bot_game
                              ? `Computer (${match.bot_difficulty})`
                              : match.opponent_name || 'Anonymous'}
                          </div>
                          <div className="text-blue-200 text-sm">
                            {new Date(match.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              match.points_change > 0
                                ? 'text-green-400'
                                : match.points_change < 0
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                          >
                            {match.points_change > 0 ? '+' : ''}
                            {match.points_change}
                          </div>
                          <div className="text-xs text-blue-200">points</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
