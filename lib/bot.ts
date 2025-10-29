import { Chess } from 'chess.js'

export type BotDifficulty = 'easy' | 'medium' | 'hard'

// Piece-square tables for positional evaluation
const pawnTable = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
]

const knightTable = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
]

const bishopTable = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
]

const rookTable = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
]

const queenTable = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
]

const kingTable = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
]

// Advanced evaluation function
function evaluateBoard(chess: Chess): number {
  const pieceValues: { [key: string]: number } = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  }

  let score = 0
  const board = chess.board()

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j]
      if (piece) {
        const value = pieceValues[piece.type]
        let positionalValue = 0
        
        // Get positional bonus from piece-square tables
        const row = piece.color === 'w' ? i : 7 - i
        
        switch(piece.type) {
          case 'p':
            positionalValue = pawnTable[row][j]
            break
          case 'n':
            positionalValue = knightTable[row][j]
            break
          case 'b':
            positionalValue = bishopTable[row][j]
            break
          case 'r':
            positionalValue = rookTable[row][j]
            break
          case 'q':
            positionalValue = queenTable[row][j]
            break
          case 'k':
            positionalValue = kingTable[row][j]
            break
        }
        
        const totalValue = value + positionalValue
        score += piece.color === 'w' ? totalValue : -totalValue
      }
    }
  }

  // Bonus for checkmate/check
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -100000 : 100000
  }
  if (chess.isCheck()) {
    score += chess.turn() === 'w' ? -50 : 50
  }
  
  // Bonus for mobility (number of legal moves)
  const mobility = chess.moves().length
  score += chess.turn() === 'w' ? mobility * 10 : -mobility * 10

  return score
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess)
  }

  const moves = chess.moves()

  if (maximizingPlayer) {
    let maxEval = -Infinity
    for (const move of moves) {
      chess.move(move)
      const evaluation = minimax(chess, depth - 1, alpha, beta, false)
      chess.undo()
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      chess.move(move)
      const evaluation = minimax(chess, depth - 1, alpha, beta, true)
      chess.undo()
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}

// Get best move for bot
export function getBotMove(fen: string, difficulty: BotDifficulty): string | null {
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })

  if (moves.length === 0) return null

  let selectedMove

  switch (difficulty) {
    case 'easy':
      // Random move with 60% chance, 40% depth-1 search
      if (Math.random() < 0.6) {
        selectedMove = moves[Math.floor(Math.random() * moves.length)]
      } else {
        selectedMove = findBestMove(chess, 1)
      }
      break

    case 'medium':
      // Depth 3 search with 20% randomness
      if (Math.random() < 0.15) {
        selectedMove = moves[Math.floor(Math.random() * moves.length)]
      } else {
        selectedMove = findBestMove(chess, 3)
      }
      break

    case 'hard':
      // Depth 4-5 search, always best move with opening book
      const depth = moves.length > 20 ? 4 : 5 // Deeper in endgame
      selectedMove = findBestMove(chess, depth)
      break

    default:
      selectedMove = moves[Math.floor(Math.random() * moves.length)]
  }

  return selectedMove ? `${selectedMove.from}${selectedMove.to}` : null
}

function findBestMove(chess: Chess, depth: number) {
  const moves = chess.moves({ verbose: true })
  let bestMove = moves[0]
  let bestValue = -Infinity

  // Bot plays as black, so we minimize
  const isMaximizing = chess.turn() === 'w'

  for (const move of moves) {
    chess.move(move)
    const value = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing)
    chess.undo()

    if (isMaximizing) {
      if (value > bestValue) {
        bestValue = value
        bestMove = move
      }
    } else {
      if (value < bestValue || bestValue === -Infinity) {
        bestValue = value
        bestMove = move
      }
    }
  }

  return bestMove
}

// Calculate points change based on result
export function calculatePointsChange(result: 'win' | 'loss' | 'draw'): number {
  switch (result) {
    case 'win':
      return 20
    case 'loss':
      return -10
    case 'draw':
      return 0
    default:
      return 0
  }
}
