'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/lib/store'

interface ChessBoard2DProps {
  onMove: (from: string, to: string) => void
  flipped?: boolean
}

export default function ChessBoard2D({ onMove, flipped = false }: ChessBoard2DProps) {
  const { chess } = useGameStore()
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)

  useEffect(() => {
    const history = chess.history({ verbose: true })
    if (history.length > 0) {
      const last = history[history.length - 1]
      setLastMove({ from: last.from, to: last.to })
    }
  }, [chess.fen()])

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  // Flip board if playing as black
  const displayFiles = flipped ? [...files].reverse() : files
  const displayRanks = flipped ? [...ranks].reverse() : ranks

  const getPieceSymbol = (piece: any) => {
    const symbols: { [key: string]: string } = {
      'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
      'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
    }
    if (!piece) return ''
    const symbol = piece.color === 'w' 
      ? symbols[piece.type.toUpperCase()] 
      : symbols[piece.type.toLowerCase()]
    return symbol
  }

  const handleSquareClick = (square: string) => {
    const piece = chess.get(square as any)
    
    if (selectedSquare) {
      // Try to move
      if (legalMoves.includes(square)) {
        onMove(selectedSquare, square)
        setSelectedSquare(null)
        setLegalMoves([])
      } else if (piece && piece.color === chess.turn()) {
        // Select different piece
        setSelectedSquare(square)
        const moves = chess.moves({ square: square as any, verbose: true })
        setLegalMoves(moves.map(m => m.to))
      } else {
        setSelectedSquare(null)
        setLegalMoves([])
      }
    } else {
      // Select piece
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square)
        const moves = chess.moves({ square: square as any, verbose: true })
        setLegalMoves(moves.map(m => m.to))
      }
    }
  }

  const isLightSquare = (file: string, rank: string) => {
    const fileIndex = files.indexOf(file)
    const rankIndex = ranks.indexOf(rank)
    return (fileIndex + rankIndex) % 2 === 0
  }

  const isSelected = (square: string) => selectedSquare === square
  const isLegalMove = (square: string) => legalMoves.includes(square)
  const isLastMoveSquare = (square: string) => 
    lastMove && (lastMove.from === square || lastMove.to === square)

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 sm:p-4">
      <div className="relative">
        {/* Rank labels (left) */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around items-end pr-1 sm:pr-2 text-xs sm:text-sm font-bold text-blue-300">
          {displayRanks.map(rank => (
            <div key={rank} className="h-[10%]">{rank}</div>
          ))}
        </div>

        {/* File labels (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around items-start pt-1 sm:pt-2 text-xs sm:text-sm font-bold text-blue-300">
          {displayFiles.map(file => (
            <div key={file} className="w-[12.5%] text-center">{file}</div>
          ))}
        </div>

        {/* Chess board */}
        <div 
          className="grid grid-cols-8 gap-0 border-4 border-amber-600 shadow-2xl ml-4 sm:ml-6 mb-4 sm:mb-6"
          style={{ 
            width: 'min(85vw, 85vh, 500px)', 
            height: 'min(85vw, 85vh, 500px)',
            maxWidth: '500px',
            maxHeight: '500px'
          }}
        >
          {displayRanks.map((rank) =>
            displayFiles.map((file) => {
              const square = `${file}${rank}`
              const piece = chess.get(square as any)
              const isLight = isLightSquare(file, rank)
              const selected = isSelected(square)
              const legal = isLegalMove(square)
              const isLastMove = isLastMoveSquare(square)

              return (
                <button
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`
                    relative aspect-square flex items-center justify-center
                    text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                    transition-all duration-200 transform
                    hover:scale-105 active:scale-95
                    ${isLight 
                      ? 'bg-gradient-to-br from-amber-100 to-amber-200' 
                      : 'bg-gradient-to-br from-amber-700 to-amber-800'}
                    ${selected ? 'ring-4 ring-green-400 ring-inset shadow-lg shadow-green-400/50' : ''}
                    ${isLastMove ? 'ring-4 ring-yellow-400 ring-inset' : ''}
                    ${legal ? 'cursor-pointer' : ''}
                  `}
                >
                  {/* Legal move indicator */}
                  {legal && !piece && (
                    <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full opacity-60" />
                  )}
                  {legal && piece && (
                    <div className="absolute inset-0 bg-green-500 opacity-20 rounded-full" />
                  )}

                  {/* Chess piece */}
                  <span 
                    className={`
                      relative z-10 select-none
                      ${piece?.color === 'w' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]'}
                      ${selected ? 'animate-pulse' : ''}
                    `}
                    style={{
                      textShadow: piece?.color === 'w' 
                        ? '0 0 8px rgba(255,255,255,0.8), 0 0 12px rgba(255,255,255,0.5)'
                        : '0 0 8px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.5)'
                    }}
                  >
                    {getPieceSymbol(piece)}
                  </span>

                  {/* Check indicator */}
                  {piece?.type === 'k' && chess.inCheck() && piece.color === chess.turn() && (
                    <div className="absolute inset-0 bg-red-500 opacity-40 animate-pulse" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Turn indicator */}
      <div className="mt-2 sm:mt-4 text-center">
        <div className={`
          inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base
          ${chess.turn() === 'w' 
            ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 border-2 border-slate-300' 
            : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border-2 border-slate-700'}
        `}>
          {chess.turn() === 'w' ? '⚪ White' : '⚫ Black'} to Move
        </div>
      </div>
    </div>
  )
}
