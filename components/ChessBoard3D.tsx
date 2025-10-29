'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { Square } from 'chess.js'
import { useGameStore } from '@/lib/store'
import ChessPiece from './ChessPiece'

interface SquareProps {
  position: [number, number, number]
  color: string
  square: string
  onClick: (square: string) => void
  isSelected: boolean
  isValidMove: boolean
}

function Square({ position, color, square, onClick, isSelected, isValidMove }: SquareProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  const getColor = () => {
    if (isSelected) return '#4ade80'
    if (isValidMove) return '#fbbf24'
    if (hovered) return color === 'light' ? '#e0e0e0' : '#606060'
    return color === 'light' ? '#f0d9b5' : '#b58863'
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick(square)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial 
        color={getColor()} 
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  )
}

interface ChessBoard3DProps {
  onMove: (from: string, to: string) => void
  flipped?: boolean
}

export default function ChessBoard3D({ onMove, flipped = false }: ChessBoard3DProps) {
  const { chess, selectedSquare, validMoves, setSelectedSquare, setValidMoves, playerColor } = useGameStore()
  
  const handleSquareClick = (square: string) => {
    const currentTurn = chess.turn() === 'w' ? 'white' : 'black'
    
    // Prevent moves if it's not player's turn
    if (playerColor && playerColor !== currentTurn) {
      return
    }

    if (selectedSquare) {
      if (validMoves.includes(square)) {
        onMove(selectedSquare, square)
        setSelectedSquare(null)
        setValidMoves([])
      } else {
        const moves = chess.moves({ square: square as Square, verbose: true })
        if (moves.length > 0) {
          setSelectedSquare(square)
          setValidMoves(moves.map((m: any) => m.to))
        } else {
          setSelectedSquare(null)
          setValidMoves([])
        }
      }
    } else {
      const moves = chess.moves({ square: square as Square, verbose: true })
      if (moves.length > 0) {
        setSelectedSquare(square)
        setValidMoves(moves.map((m: any) => m.to))
      }
    }
  }

  const renderBoard = () => {
    const squares = []
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isLight = (rank + file) % 2 === 0
        const square = `${files[file]}${ranks[rank]}`
        // Normal coordinates - rotation will handle orientation
        const x = file - 3.5
        const z = rank - 3.5
        
        squares.push(
          <Square
            key={square}
            position={[x, 0, z]}
            color={isLight ? 'light' : 'dark'}
            square={square}
            onClick={handleSquareClick}
            isSelected={selectedSquare === square}
            isValidMove={validMoves.includes(square)}
          />
        )
      }
    }
    return squares
  }

  const renderPieces = () => {
    const pieces = []
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
    
    // Check if a king is in check
    const isInCheck = chess.isCheck()
    const currentTurn = chess.turn()

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = `${files[file]}${ranks[rank]}`
        const piece = chess.get(square as Square)
        
        if (piece) {
          // Normal coordinates - rotation will handle orientation
          const x = file - 3.5
          const z = rank - 3.5
          
          // Check if this king is in check
          const isKingInCheck = piece.type === 'k' && isInCheck && piece.color === currentTurn
          
          pieces.push(
            <ChessPiece
              key={square}
              type={piece.type}
              color={piece.color === 'w' ? 'white' : 'black'}
              position={[x, 0.1, z]}
              isInCheck={isKingInCheck}
            />
          )
        }
      }
    }
    return pieces
  }

  return (
    <Canvas shadows className="w-full h-full">
      <PerspectiveCamera 
        makeDefault 
        position={[0, 8, 8]} 
        fov={50} 
      />
      <OrbitControls 
        enablePan={false}
        minDistance={6}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.2}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      
      <Environment preset="city" />
      
      {/* Rotate entire board 180° when playing as black */}
      <group rotation={[0, flipped ? Math.PI : 0, 0]}>
        {renderBoard()}
        {renderPieces()}
      </group>
      
      {/* Board frame - also rotate with board */}
      <mesh position={[0, -0.2, 0]} rotation={[0, flipped ? Math.PI : 0, 0]}>
        <boxGeometry args={[9, 0.3, 9]} />
        <meshStandardMaterial color="#2c1810" metalness={0.5} roughness={0.5} />
      </mesh>
    </Canvas>
  )
}
