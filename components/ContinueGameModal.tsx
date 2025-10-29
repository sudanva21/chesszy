'use client'

import { Bot, PlayCircle, RotateCcw } from 'lucide-react'

interface ContinueGameModalProps {
  isOpen: boolean
  botName: string
  onContinue: () => void
  onNewGame: () => void
}

export default function ContinueGameModal({ 
  isOpen, 
  botName, 
  onContinue, 
  onNewGame 
}: ContinueGameModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome Back!
          </h2>
          <p className="text-blue-200 text-sm sm:text-base">
            You have an unfinished game with <span className="font-bold text-purple-400">{botName}</span>
          </p>
        </div>

        {/* Message */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-white text-center text-sm sm:text-base">
            Would you like to continue your previous game or start a new one?
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl transition-all transform active:scale-95 touch-manipulation shadow-lg flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Continue Previous Game</span>
          </button>
          
          <button
            onClick={onNewGame}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl transition-all transform active:scale-95 touch-manipulation shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Start New Game</span>
          </button>
        </div>

        {/* Info */}
        <p className="text-center text-xs sm:text-sm text-blue-300 mt-4">
          Your previous game progress is automatically saved
        </p>
      </div>
    </div>
  )
}
