'use client'

import { Trophy, Home, RotateCcw, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GameOverModalProps {
  isOpen: boolean
  result: 'win' | 'loss' | 'draw'
  isBotGame: boolean
  botDifficulty?: string
  botName?: string
  onRetry: () => void
  onChangeDifficulty?: () => void
}

export default function GameOverModal({ 
  isOpen, 
  result, 
  isBotGame,
  botDifficulty,
  botName,
  onRetry,
  onChangeDifficulty 
}: GameOverModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const getTitle = () => {
    if (result === 'win') return '🎉 Victory!'
    if (result === 'loss') return '😔 Defeat'
    return '🤝 Draw'
  }

  const getMessage = () => {
    if (result === 'win') {
      return isBotGame 
        ? `Excellent! You defeated ${botName || 'the bot'}!`
        : 'Congratulations! You won the game!'
    }
    if (result === 'loss') {
      return isBotGame
        ? `${botName || 'The bot'} was too strong this time!`
        : 'Better luck next time!'
    }
    return "Well played by both sides!"
  }

  const getBgColor = () => {
    if (result === 'win') return 'from-green-500/20 to-emerald-500/20 border-green-400/30'
    if (result === 'loss') return 'from-red-500/20 to-orange-500/20 border-red-400/30'
    return 'from-blue-500/20 to-indigo-500/20 border-blue-400/30'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className={`bg-gradient-to-br ${getBgColor()} backdrop-blur-md rounded-2xl max-w-md w-full p-8 border relative animate-in zoom-in duration-300`}>
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2">
            {getTitle()}
          </h2>
          <p className="text-lg text-gray-200">
            {getMessage()}
          </p>
        </div>

        <div className="space-y-3">
          {/* Retry Button */}
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>

          {/* Change Difficulty (Bot only) */}
          {isBotGame && result === 'loss' && onChangeDifficulty && (
            <button
              onClick={onChangeDifficulty}
              className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105"
            >
              <Settings className="w-5 h-5" />
              <span>Try Different Difficulty</span>
            </button>
          )}

          {/* Home Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-white/20"
          >
            <Home className="w-5 h-5" />
            <span>Return to Home</span>
          </button>
        </div>

        {!isBotGame && (
          <div className="mt-6 text-center text-sm text-gray-300">
            {result === 'win' && '🏆 +20 points earned'}
            {result === 'loss' && '📉 -10 points lost'}
            {result === 'draw' && '➖ No points changed'}
          </div>
        )}

        {isBotGame && (
          <div className="mt-6 text-center text-sm text-purple-300">
            💡 Practice mode - No points earned or lost
          </div>
        )}
      </div>
    </div>
  )
}
