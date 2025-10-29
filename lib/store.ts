import { create } from 'zustand'
import { Chess } from 'chess.js'

interface GameStore {
  chess: Chess
  selectedSquare: string | null
  validMoves: string[]
  playerColor: 'white' | 'black' | null
  gameCode: string | null
  isHost: boolean
  opponentConnected: boolean
  
  setSelectedSquare: (square: string | null) => void
  setValidMoves: (moves: string[]) => void
  setPlayerColor: (color: 'white' | 'black' | null) => void
  setGameCode: (code: string | null) => void
  setIsHost: (isHost: boolean) => void
  setOpponentConnected: (connected: boolean) => void
  makeMove: (from: string, to: string) => boolean
  resetGame: () => void
  loadFen: (fen: string) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  chess: new Chess(),
  selectedSquare: null,
  validMoves: [],
  playerColor: null,
  gameCode: null,
  isHost: false,
  opponentConnected: false,

  setSelectedSquare: (square) => set({ selectedSquare: square }),
  
  setValidMoves: (moves) => set({ validMoves: moves }),
  
  setPlayerColor: (color) => set({ playerColor: color }),
  
  setGameCode: (code) => set({ gameCode: code }),
  
  setIsHost: (isHost) => set({ isHost }),
  
  setOpponentConnected: (connected) => set({ opponentConnected: connected }),
  
  makeMove: (from, to) => {
    const { chess } = get()
    try {
      const move = chess.move({ from, to, promotion: 'q' })
      if (move) {
        set({ chess: new Chess(chess.fen()) })
        return true
      }
      return false
    } catch {
      return false
    }
  },
  
  resetGame: () => set({ 
    chess: new Chess(),
    selectedSquare: null,
    validMoves: [],
  }),
  
  loadFen: (fen) => {
    const newChess = new Chess()
    newChess.load(fen)
    set({ chess: newChess })
  },
}))
