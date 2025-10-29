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
  moveHistory: string[] // Store FEN strings for undo
  
  setSelectedSquare: (square: string | null) => void
  setValidMoves: (moves: string[]) => void
  setPlayerColor: (color: 'white' | 'black' | null) => void
  setGameCode: (code: string | null) => void
  setIsHost: (isHost: boolean) => void
  setOpponentConnected: (connected: boolean) => void
  makeMove: (from: string, to: string) => boolean
  undoMove: () => boolean
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
  moveHistory: [],

  setSelectedSquare: (square) => set({ selectedSquare: square }),
  
  setValidMoves: (moves) => set({ validMoves: moves }),
  
  setPlayerColor: (color) => set({ playerColor: color }),
  
  setGameCode: (code) => set({ gameCode: code }),
  
  setIsHost: (isHost) => set({ isHost }),
  
  setOpponentConnected: (connected) => set({ opponentConnected: connected }),
  
  makeMove: (from, to) => {
    const { chess, moveHistory } = get()
    try {
      // Save current position before making move
      const currentFen = chess.fen()
      
      const move = chess.move({ from, to, promotion: 'q' })
      if (move) {
        // Add current position to history
        set({ 
          chess: new Chess(chess.fen()),
          moveHistory: [...moveHistory, currentFen]
        })
        return true
      }
      return false
    } catch {
      return false
    }
  },
  
  undoMove: () => {
    const { moveHistory } = get()
    if (moveHistory.length === 0) return false
    
    // Get the previous position
    const previousFen = moveHistory[moveHistory.length - 1]
    const newHistory = moveHistory.slice(0, -1)
    
    // Load previous position
    const newChess = new Chess()
    newChess.load(previousFen)
    
    set({ 
      chess: newChess,
      moveHistory: newHistory
    })
    
    return true
  },
  
  resetGame: () => set({ 
    chess: new Chess(),
    selectedSquare: null,
    validMoves: [],
    moveHistory: [],
  }),
  
  loadFen: (fen) => {
    const newChess = new Chess()
    newChess.load(fen)
    set({ chess: newChess })
  },
}))
