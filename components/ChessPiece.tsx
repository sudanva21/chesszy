'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ChessPieceProps {
  type: string
  color: 'white' | 'black'
  position: [number, number, number]
  isInCheck?: boolean
}

export default function ChessPiece({ type, color, position, isInCheck = false }: ChessPieceProps) {
  const meshRef = useRef<THREE.Group>(null)
  
  // Red color for king in check, otherwise normal colors
  const pieceColor = (type === 'k' && isInCheck) 
    ? '#ff0000' 
    : color === 'white' ? '#f5f5f5' : '#1a1a1a'
  
  // Add metallic gold for white pieces, silver for black
  const metalness = color === 'white' ? 0.5 : 0.4
  const roughness = 0.5

  const renderPiece = () => {
    switch (type) {
      case 'p': // Pawn (Taller)
        return (
          <group>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.2, 0.4, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow>
              <sphereGeometry args={[0.17, 20, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
          </group>
        )
      
      case 'r': // Rook (Taller)
        return (
          <group>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.25, 0.5, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
              <boxGeometry args={[0.4, 0.2, 0.4]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            {/* Battlements */}
            <mesh position={[0.15, 0.75, 0.15]} castShadow>
              <boxGeometry args={[0.08, 0.15, 0.08]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[-0.15, 0.75, 0.15]} castShadow>
              <boxGeometry args={[0.08, 0.15, 0.08]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0.15, 0.75, -0.15]} castShadow>
              <boxGeometry args={[0.08, 0.15, 0.08]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[-0.15, 0.75, -0.15]} castShadow>
              <boxGeometry args={[0.08, 0.15, 0.08]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
          </group>
        )
      
      case 'n': // Knight (Taller)
        return (
          <group>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.25, 0.4, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0.1, 0.5, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
              <coneGeometry args={[0.22, 0.5, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0.15, 0.75, 0.05]} castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
          </group>
        )
      
      case 'b': // Bishop (Taller)
        return (
          <group>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.25, 0.5, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[0.18, 20, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.85, 0]} castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            {/* Bishop slit */}
            <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 4, 0, 0]} castShadow>
              <boxGeometry args={[0.03, 0.15, 0.03]} />
              <meshStandardMaterial color={color === 'white' ? '#000' : '#fff'} />
            </mesh>
          </group>
        )
      
      case 'q': // Queen (Taller, More Elegant)
        return (
          <group>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.28, 0.6, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.7, 0]} castShadow>
              <sphereGeometry args={[0.22, 20, 20]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            {/* Crown points */}
            <mesh position={[0, 1.0, 0]} castShadow>
              <coneGeometry args={[0.08, 0.2, 8]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0.15, 0.95, 0]} castShadow>
              <coneGeometry args={[0.06, 0.15, 8]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[-0.15, 0.95, 0]} castShadow>
              <coneGeometry args={[0.06, 0.15, 8]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.95, 0.15]} castShadow>
              <coneGeometry args={[0.06, 0.15, 8]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.95, -0.15]} castShadow>
              <coneGeometry args={[0.06, 0.15, 8]} />
              <meshStandardMaterial color={pieceColor} metalness={metalness} roughness={roughness} />
            </mesh>
          </group>
        )
      
      case 'k': // King (Taller, Glowing in Check)
        return (
          <group>
            {isInCheck && (
              <pointLight color="#ff0000" intensity={2} distance={2} />
            )}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.3, 0.6, 20]} />
              <meshStandardMaterial 
                color={pieceColor} 
                metalness={metalness} 
                roughness={roughness}
                emissive={isInCheck ? '#ff0000' : '#000000'}
                emissiveIntensity={isInCheck ? 0.5 : 0}
              />
            </mesh>
            <mesh position={[0, 0.7, 0]} castShadow>
              <sphereGeometry args={[0.2, 20, 20]} />
              <meshStandardMaterial 
                color={pieceColor} 
                metalness={metalness} 
                roughness={roughness}
                emissive={isInCheck ? '#ff0000' : '#000000'}
                emissiveIntensity={isInCheck ? 0.5 : 0}
              />
            </mesh>
            {/* Cross on top */}
            <mesh position={[0, 1.0, 0]} castShadow>
              <boxGeometry args={[0.08, 0.3, 0.08]} />
              <meshStandardMaterial 
                color={pieceColor} 
                metalness={metalness} 
                roughness={roughness}
                emissive={isInCheck ? '#ff0000' : '#000000'}
                emissiveIntensity={isInCheck ? 0.5 : 0}
              />
            </mesh>
            <mesh position={[0, 1.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <boxGeometry args={[0.08, 0.28, 0.08]} />
              <meshStandardMaterial 
                color={pieceColor} 
                metalness={metalness} 
                roughness={roughness}
                emissive={isInCheck ? '#ff0000' : '#000000'}
                emissiveIntensity={isInCheck ? 0.5 : 0}
              />
            </mesh>
          </group>
        )
      
      default:
        return null
    }
  }

  return (
    <group ref={meshRef} position={position}>
      {renderPiece()}
    </group>
  )
}
