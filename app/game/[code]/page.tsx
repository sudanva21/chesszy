'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/lib/store'
import { getBotMove, BotDifficulty, calculatePointsChange } from '@/lib/bot'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { getBotPersonality } from '@/lib/bot-names'
import soundManager from '@/lib/sounds'
import { Copy, Check, Users, Bot as BotIcon, Crown, ArrowLeft, Trophy, Box, Grid3x3 } from 'lucide-react'

const ChessBoard3D = dynamic(() => import('@/components/ChessBoard3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl">
      <div className="text-white text-xl">Loading 3D Board...</div>
    </div>
  ),
})

const ChessBoard2D = dynamic(() => import('@/components/ChessBoard2D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
      <div className="text-slate-900 text-xl">Loading 2D Board...</div>
    </div>
  ),
})

const GameOverModal = dynamic(() => import('@/components/GameOverModal'), {
  ssr: false,
})

const CapturedPieces = dynamic(() => import('@/components/CapturedPieces'), {
  ssr: false,
})

const ContinueGameModal = dynamic(() => import('@/components/ContinueGameModal'), {
  ssr: false,
})

interface GameState {
  id: string
  game_code: string
  fen: string
  current_turn: string
  white_player_id: string | null
  black_player_id: string | null
  is_bot_game: boolean
  bot_difficulty: string | null
  status: string
  winner: string | null
  white_points_change: number
  black_points_change: number
}

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const gameCode = params.code as string
  const isHost = searchParams.get('host') === 'true'
  const isBotGame = searchParams.get('bot') === 'true'
  const botDifficulty = (searchParams.get('difficulty') || 'medium') as BotDifficulty
  const selectedColor = (searchParams.get('color') || 'white') as 'white' | 'black'
  
  const { 
    chess, 
    playerColor, 
    setPlayerColor, 
    setGameCode, 
    setIsHost,
    opponentConnected,
    setOpponentConnected,
    loadFen,
    makeMove: makeStoreMove,
    resetGame,
  } = useGameStore()
  
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [botThinking, setBotThinking] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)
  const [gameResult, setGameResult] = useState<'win' | 'loss' | 'draw'>('draw')
  const [whiteCaptured, setWhiteCaptured] = useState<{ type: string; color: string }[]>([])
  const [blackCaptured, setBlackCaptured] = useState<{ type: string; color: string }[]>([])
  const [previousFen, setPreviousFen] = useState<string>(chess.fen())
  const [boardView, setBoardView] = useState<'2d' | '3d'>('3d')
  const [showContinueModal, setShowContinueModal] = useState(false)
  const [savedGameExists, setSavedGameExists] = useState(false)
  
  // Get bot personality
  const botPersonality = isBotGame ? getBotPersonality(botDifficulty) : null

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  // Save bot game to localStorage
  const saveBotGame = () => {
    if (!isBotGame || chess.isGameOver()) return
    
    const gameData = {
      fen: chess.fen(),
      difficulty: botDifficulty,
      playerColor: selectedColor,
      boardView,
      timestamp: Date.now()
    }
    
    localStorage.setItem('savedBotGame', JSON.stringify(gameData))
  }

  // Load bot game from localStorage
  const loadSavedBotGame = () => {
    const saved = localStorage.getItem('savedBotGame')
    if (!saved) return null
    
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  }

  // Clear saved bot game
  const clearSavedBotGame = () => {
    localStorage.removeItem('savedBotGame')
  }

  // Check for saved game on mount
  useEffect(() => {
    if (isBotGame) {
      const saved = loadSavedBotGame()
      if (saved && saved.difficulty === botDifficulty && saved.playerColor === selectedColor) {
        setSavedGameExists(true)
        setShowContinueModal(true)
      } else {
        // Start fresh game
        resetGame()
        setPlayerColor(selectedColor)
        setOpponentConnected(true)
      }
    }
  }, [])

  // Handle continue game
  const handleContinueGame = () => {
    const saved = loadSavedBotGame()
    if (saved) {
      loadFen(saved.fen)
      setPlayerColor(saved.playerColor)
      setBoardView(saved.boardView || '3d')
      setOpponentConnected(true)
    }
    setShowContinueModal(false)
  }

  // Handle new game
  const handleNewGame = () => {
    clearSavedBotGame()
    resetGame()
    setPlayerColor(selectedColor)
    setOpponentConnected(true)
    setShowContinueModal(false)
  }

  useEffect(() => {
    setGameCode(gameCode)
    setIsHost(isHost)
    
    if (isBotGame) {
      // Bot game setup handled by separate useEffect checking for saved games
      // Don't reset here, let the saved game check happen first
    } else {
      // Wait for user to be loaded before setting up multiplayer
      if (!user) {
        console.log('Waiting for user to load...')
        return
      }

      // Multiplayer game setup - reset board for fresh game
      resetGame()
      if (isHost) {
        // Randomly assign colors for multiplayer
        const hostColor = Math.random() < 0.5 ? 'white' : 'black'
        setPlayerColor(hostColor)
        createMultiplayerGame(hostColor)
      } else {
        // Color will be set after joining based on what's available
        joinMultiplayerGame()
      }

      // Subscribe to game changes
      const channel = supabase
        .channel(`game:${gameCode}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'games',
            filter: `game_code=eq.${gameCode}`,
          },
          (payload) => {
            const newState = payload.new as GameState
            setGameState(newState)
            
            if (newState.fen) {
              loadFen(newState.fen)
            }
            
            const hasOpponent = isHost 
              ? !!newState.black_player_id 
              : !!newState.white_player_id
            setOpponentConnected(hasOpponent)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [gameCode, isHost, isBotGame, user])

  // Bot move logic
  useEffect(() => {
    if (isBotGame && !botThinking) {
      const currentTurn = chess.turn() === 'w' ? 'white' : 'black'
      
      // Bot plays opposite color, make move when it's bot's turn
      const botColor = selectedColor === 'white' ? 'black' : 'white'
      if (currentTurn === botColor && !chess.isGameOver()) {
        setBotThinking(true)
        soundManager.playBotThinking() // Bot thinking sound
        
        // Add small delay so user can see the bot "thinking"
        setTimeout(() => {
          const botMoveStr = getBotMove(chess.fen(), botDifficulty)
          
          if (botMoveStr) {
            const from = botMoveStr.substring(0, 2)
            const to = botMoveStr.substring(2, 4)
            
            // Check if capture before move
            const isCapture = chess.get(to as any) !== null
            
            makeStoreMove(from, to)
            
            // Play appropriate sound
            if (isCapture) {
              soundManager.playCapture()
            } else {
              soundManager.playMove()
            }
            
            // Check for check or checkmate
            if (chess.isCheckmate()) {
              soundManager.playCheckmate()
            } else if (chess.isCheck()) {
              soundManager.playCheck()
            }
          }
          
          setBotThinking(false)
        }, 500)
      }
    }
  }, [chess.fen(), isBotGame, botThinking, selectedColor])

  // Auto-save bot game after each move
  useEffect(() => {
    if (isBotGame && !showContinueModal) {
      saveBotGame()
    }
  }, [chess.fen(), isBotGame, showContinueModal])

  const createMultiplayerGame = async (hostColor: 'white' | 'black') => {
    if (!user) return

    // Initial chess position
    const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    console.log('Creating multiplayer game with code:', gameCode, 'Host color:', hostColor)

    const { data, error } = await supabase
      .from('games')
      .insert({
        game_code: gameCode,
        fen: initialFen,
        current_turn: 'white',
        white_player_id: hostColor === 'white' ? user.id : null,
        black_player_id: hostColor === 'black' ? user.id : null,
        is_bot_game: false,
        status: 'waiting',
      })
      .select()
      .single()

    if (data) {
      console.log('Game created successfully:', data)
      setGameState(data)
    }
    if (error) {
      console.error('Error creating game:', error)
      // Show error to user if game creation fails
      alert(`Failed to create game: ${error.message}`)
    }
  }

  const joinMultiplayerGame = async () => {
    if (!user) {
      console.log('Cannot join: No user logged in')
      alert('Please log in to join the game.')
      router.push('/')
      return
    }

    console.log('=== JOIN GAME DEBUG ===')
    console.log('User ID:', user.id)
    console.log('Game code:', gameCode)
    console.log('Attempting to join game...')

    try {
      // Query for game with the code - use select('*') to get all fields
      const { data: existing, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('game_code', gameCode)
        .maybeSingle()

      console.log('Query result:', { existing, fetchError })

      if (fetchError) {
        console.error('Database error:', fetchError)
        alert(`Database error: ${fetchError.message}`)
        return
      }

      if (!existing) {
        console.error('Game not found in database')
        console.log('This means no game with code:', gameCode, 'exists')
        alert(`Game not found! Please check the code: ${gameCode}`)
        return
      }

      console.log('✓ Game found:', existing)

      // Check if user is already in this game
      if (existing.white_player_id === user.id || existing.black_player_id === user.id) {
        console.log('User is already in this game')
        const userColor = existing.white_player_id === user.id ? 'white' : 'black'
        setPlayerColor(userColor)
        setGameState(existing)
        loadFen(existing.fen)
        setOpponentConnected(
          userColor === 'white' ? !!existing.black_player_id : !!existing.white_player_id
        )
        return
      }

      // Determine which color to join as (opposite of host)
      const isWhiteTaken = existing.white_player_id !== null
      const isBlackTaken = existing.black_player_id !== null
      
      console.log('White taken:', isWhiteTaken, 'Black taken:', isBlackTaken)
      
      let joinAsColor: 'white' | 'black'
      if (!isWhiteTaken) {
        joinAsColor = 'white'
      } else if (!isBlackTaken) {
        joinAsColor = 'black'
      } else {
        console.error('Game is full - both colors taken')
        alert('Game is full! Both players have joined.')
        return
      }

      console.log(`✓ Joining as ${joinAsColor} player...`)
      setPlayerColor(joinAsColor)
      
      const updateData = joinAsColor === 'white' 
        ? { white_player_id: user.id, status: 'playing' }
        : { black_player_id: user.id, status: 'playing' }

      console.log('Updating game with:', updateData)

      const { data, error } = await supabase
        .from('games')
        .update(updateData)
        .eq('game_code', gameCode)
        .select()
        .single()

      if (error) {
        console.error('Error updating game:', error)
        alert(`Failed to join game: ${error.message}`)
        return
      }

      if (data) {
        console.log('✓ Successfully joined game:', data)
        setGameState(data)
        loadFen(data.fen)
        setOpponentConnected(true)
      }

      console.log('=== JOIN SUCCESS ===')
    } catch (error) {
      console.error('Unexpected error joining game:', error)
      alert(`An error occurred: ${error}`)
    }
  }

  const handleMove = async (from: string, to: string) => {
    const currentTurn = chess.turn() === 'w' ? 'white' : 'black'
    
    // Check if it's player's turn
    if (!isBotGame && playerColor !== currentTurn) {
      return
    }

    // In bot games, only allow player to move on their turn
    if (isBotGame && currentTurn !== selectedColor) {
      return
    }

    // Check if capture before move
    const isCapture = chess.get(to as any) !== null

    if (makeStoreMove(from, to)) {
      const newFen = chess.fen()
      const newTurn = chess.turn() === 'w' ? 'white' : 'black'
      
      // Play move/capture sound
      if (isCapture) {
        soundManager.playCapture()
      } else {
        soundManager.playMove()
      }
      
      let winner = null
      let status: 'playing' | 'finished' = 'playing'
      let whitePointsChange = 0
      let blackPointsChange = 0
      
      if (chess.isCheckmate()) {
        winner = currentTurn
        status = 'finished'
        soundManager.playCheckmate() // Checkmate sound
        
        if (!isBotGame && user) {
          // Calculate points for multiplayer
          if (currentTurn === 'white') {
            whitePointsChange = calculatePointsChange('win')
            blackPointsChange = calculatePointsChange('loss')
          } else {
            blackPointsChange = calculatePointsChange('win')
            whitePointsChange = calculatePointsChange('loss')
          }
        }
      } else if (chess.isDraw() || chess.isStalemate()) {
        winner = 'draw'
        status = 'finished'
        soundManager.playDraw() // Draw sound
      } else if (chess.isCheck()) {
        soundManager.playCheck() // Check sound
      }

      // Update database only for multiplayer games
      if (!isBotGame) {
        await supabase
          .from('games')
          .update({
            fen: newFen,
            current_turn: newTurn,
            winner,
            status,
            white_points_change: whitePointsChange,
            black_points_change: blackPointsChange,
          })
          .eq('game_code', gameCode)

        // Save to match history if game finished
        if (status === 'finished' && user && gameState) {
          await saveMatchHistory(winner, whitePointsChange, blackPointsChange)
        }
      } else if (status === 'finished' && user) {
        // Save bot game to history
        await saveBotGameHistory(winner)
      }
    }
  }

  const saveMatchHistory = async (winner: string | null, whitePoints: number, blackPoints: number) => {
    if (!user || !gameState) return

    const isWhite = playerColor === 'white'
    const result = winner === 'draw' ? 'draw' : (winner === playerColor ? 'win' : 'loss')
    const pointsChange = isWhite ? whitePoints : blackPoints
    const opponentId = isWhite ? gameState.black_player_id : gameState.white_player_id

    // Get opponent profile for name
    let opponentName = 'Anonymous'
    if (opponentId) {
      const { data: opponentProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', opponentId)
        .single()
      
      if (opponentProfile) {
        opponentName = opponentProfile.username
      }
    }

    // Save match history
    await supabase
      .from('match_history')
      .insert({
        game_id: gameState.id,
        player_id: user.id,
        opponent_id: opponentId,
        opponent_name: opponentName,
        result,
        points_change: pointsChange,
        was_bot_game: false,
      })

    // Update player stats (points, wins, losses, etc.)
    await supabase.rpc('update_player_stats', {
      p_player_id: user.id,
      p_result: result,
      p_points_change: pointsChange
    })

    // Update opponent stats
    if (opponentId) {
      const opponentResult = result === 'win' ? 'loss' : (result === 'loss' ? 'win' : 'draw')
      const opponentPoints = isWhite ? blackPoints : whitePoints
      await supabase.rpc('update_player_stats', {
        p_player_id: opponentId,
        p_result: opponentResult,
        p_points_change: opponentPoints
      })
    }
  }

  // Save bot game to match history
  const saveBotGameHistory = async (winner: string | null) => {
    if (!user || !botPersonality) return

    const result = winner === 'draw' ? 'draw' : (winner === 'white' ? 'win' : 'loss')

    await supabase
      .from('match_history')
      .insert({
        game_id: null, // No game ID for bot games
        player_id: user.id,
        opponent_id: null, // No opponent ID for bots
        opponent_name: botPersonality.name, // Use bot's name
        result,
        points_change: 0, // No points for bot games
        was_bot_game: true,
        bot_difficulty: botDifficulty,
      })
  }

  // Calculate captured pieces
  useEffect(() => {
    const allPieces = {
      'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1
    }
    
    const currentPieces = { w: {...allPieces}, b: {...allPieces} }
    
    const board = chess.board()
    board.forEach(row => {
      row.forEach(square => {
        if (square) {
          currentPieces[square.color][square.type]--
        }
      })
    })
    
    // White captured black's pieces
    const whiteCap: { type: string; color: string }[] = []
    Object.entries(currentPieces.b).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        whiteCap.push({ type, color: 'black' })
      }
    })
    
    // Black captured white's pieces
    const blackCap: { type: string; color: string }[] = []
    Object.entries(currentPieces.w).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        blackCap.push({ type, color: 'white' })
      }
    })
    
    setWhiteCaptured(whiteCap)
    setBlackCaptured(blackCap)
  }, [chess.fen()])

  // Check for game over
  useEffect(() => {
    if (chess.isGameOver()) {
      // Clear saved bot game when game is over
      if (isBotGame) {
        clearSavedBotGame()
      }
      
      setTimeout(() => {
        let result: 'win' | 'loss' | 'draw' = 'draw'
        
        if (chess.isCheckmate()) {
          const winner = chess.turn() === 'w' ? 'black' : 'white'
          result = isBotGame 
            ? (winner === selectedColor ? 'win' : 'loss')
            : (winner === playerColor ? 'win' : 'loss')
        } else {
          result = 'draw'
        }
        
        // Play game over sound
        if (result === 'win') {
          soundManager.playVictory()
        } else if (result === 'loss') {
          soundManager.playDefeat()
        } else {
          soundManager.playDraw()
        }
        
        setGameResult(result)
        setShowGameOver(true)
      }, 1000)
    }
  }, [chess.fen()])

  const handleRetry = () => {
    setShowGameOver(false)
    if (isBotGame) {
      // Clear saved game and restart
      clearSavedBotGame()
      router.push(`/game/${Math.random().toString(36).substring(2, 8).toUpperCase()}?bot=true&difficulty=${botDifficulty}&color=${selectedColor}`)
    } else {
      // Go home for multiplayer
      router.push('/')
    }
  }

  const handleChangeDifficulty = () => {
    setShowGameOver(false)
    router.push('/')
  }

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/game/${gameCode}` : ''

  const currentTurn = chess.turn() === 'w' ? 'white' : 'black'
  const isMyTurn = isBotGame ? currentTurn === selectedColor : playerColor === currentTurn

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4">
      <ContinueGameModal
        isOpen={showContinueModal}
        botName={botPersonality?.name || 'Bot'}
        onContinue={handleContinueGame}
        onNewGame={handleNewGame}
      />
      
      <GameOverModal
        isOpen={showGameOver}
        result={gameResult}
        isBotGame={isBotGame}
        botDifficulty={botDifficulty}
        botName={botPersonality?.name}
        onRetry={handleRetry}
        onChangeDifficulty={handleChangeDifficulty}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors touch-manipulation active:scale-95 self-start"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {isBotGame ? (
              <div className="bg-purple-500/20 backdrop-blur-md rounded-lg px-3 sm:px-4 py-2 border border-purple-400/30 flex-1 sm:flex-initial">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xl sm:text-2xl">{botPersonality?.avatar}</span>
                  <div>
                    <div className="text-white font-bold text-sm sm:text-base">{botPersonality?.name}</div>
                    <div className="text-purple-300 text-xs">{botPersonality?.title}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 sm:px-4 py-2 border border-white/20 flex-1 sm:flex-initial">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${opponentConnected ? 'text-green-400' : 'text-yellow-400'}`} />
                  <span className="text-white font-medium text-sm sm:text-base">
                    {opponentConnected ? 'Opponent Connected' : 'Waiting for Opponent...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2 order-1">
            {/* Board View Toggle */}
            <div className="flex justify-center gap-2 mb-3 sm:mb-4">
              <button
                onClick={() => setBoardView('3d')}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                  transition-all transform active:scale-95 touch-manipulation
                  ${boardView === '3d'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20'}
                `}
              >
                <Box className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>3D Board</span>
              </button>
              <button
                onClick={() => setBoardView('2d')}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                  transition-all transform active:scale-95 touch-manipulation
                  ${boardView === '2d'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20'}
                `}
              >
                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>2D Board</span>
              </button>
            </div>

            {/* Chess Board */}
            <div className={`
              backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/10 
              h-[400px] sm:h-[500px] lg:h-[600px]
              ${boardView === '3d' ? 'bg-white/5' : 'bg-gradient-to-br from-amber-50/10 to-amber-100/10'}
            `}>
              {boardView === '3d' ? (
                <ChessBoard3D 
                  onMove={handleMove}
                  flipped={isBotGame ? selectedColor === 'black' : playerColor === 'black'}
                />
              ) : (
                <ChessBoard2D 
                  onMove={handleMove} 
                  flipped={isBotGame ? selectedColor === 'black' : playerColor === 'black'}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 sm:space-y-4 order-2">
            {/* Captured Pieces */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">Captured Pieces</h3>
              <div className="space-y-3">
                <CapturedPieces 
                  captured={isBotGame ? whiteCaptured : (playerColor === 'white' ? whiteCaptured : blackCaptured)} 
                  label="You Captured" 
                />
                <CapturedPieces 
                  captured={isBotGame ? blackCaptured : (playerColor === 'white' ? blackCaptured : whiteCaptured)} 
                  label={isBotGame ? `${botPersonality?.name} Captured` : "Opponent Captured"} 
                />
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                Game Info
              </h2>
              
              <div className="space-y-3">
                {!isBotGame && (
                  <div>
                    <div className="text-blue-200 text-xs sm:text-sm mb-1">Game Code</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-white font-mono text-sm sm:text-base lg:text-lg">
                        {gameCode}
                      </code>
                      <button
                        onClick={copyGameCode}
                        className="bg-blue-500 hover:bg-blue-600 p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation active:scale-95"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        ) : (
                          <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-blue-200 text-xs sm:text-sm mb-1">Your Color</div>
                  <div className="bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                    <span className="text-white font-semibold capitalize text-sm sm:text-base">
                      {isBotGame ? selectedColor : playerColor}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-blue-200 text-xs sm:text-sm mb-1">Current Turn</div>
                  <div className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
                    isMyTurn 
                      ? 'bg-green-500/20 border border-green-500/50' 
                      : 'bg-white/10'
                  }`}>
                    <span className={`font-semibold capitalize text-sm sm:text-base ${
                      isMyTurn ? 'text-green-400' : 'text-white'
                    }`}>
                      {currentTurn}
                      {isMyTurn && ' (Your Turn)'}
                      {botThinking && ' (Bot thinking...)'}
                    </span>
                  </div>
                </div>

                {isBotGame && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="text-purple-200 text-sm mb-1 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Practice Mode
                    </div>
                    <div className="text-purple-100 text-xs">
                      No points earned or lost in bot games
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share */}
            {!isBotGame && isHost && !opponentConnected && (
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 border border-blue-400/30">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">Invite Friend</h3>
                <p className="text-blue-200 text-xs sm:text-sm mb-3 sm:mb-4">
                  Share this code or link with your friend to start playing
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Join my chess game! Code: ${gameCode} or visit: ${shareLink}`)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all touch-manipulation active:scale-95"
                >
                  {copied ? 'Copied!' : 'Copy Invite Message'}
                </button>
              </div>
            )}

            {/* Game Status */}
            {chess.isGameOver() && (
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 border border-amber-400/30">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Game Over!</h3>
                <p className="text-amber-200 text-sm sm:text-base">
                  {chess.isDraw() || chess.isStalemate()
                    ? "It's a draw!" 
                    : chess.isCheckmate()
                    ? `${currentTurn === 'white' ? 'Black' : 'White'} wins by checkmate!`
                    : 'Game finished'}
                </p>
                {!isBotGame && (
                  <div className="mt-3 text-sm text-amber-100">
                    Points will be updated automatically
                  </div>
                )}
              </div>
            )}

            {/* Game Status Indicators */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">Game Status</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                {chess.isCheck() && (
                  <div className="bg-red-500/20 border border-red-500/50 px-3 py-2 rounded text-red-400 font-semibold">
                    Check!
                  </div>
                )}
                {chess.isCheckmate() && (
                  <div className="bg-red-500/20 border border-red-500/50 px-3 py-2 rounded text-red-400 font-semibold">
                    Checkmate!
                  </div>
                )}
                {chess.isDraw() && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 px-3 py-2 rounded text-yellow-400 font-semibold">
                    Draw!
                  </div>
                )}
                {chess.isStalemate() && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 px-3 py-2 rounded text-yellow-400 font-semibold">
                    Stalemate!
                  </div>
                )}
                {!chess.isGameOver() && !chess.isCheck() && (
                  <div className="text-blue-200">
                    Game in progress...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
