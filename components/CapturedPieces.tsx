'use client'

interface CapturedPiecesProps {
  captured: { type: string; color: string }[]
  label: string
}

const pieceSymbols: { [key: string]: string } = {
  'p': '♟',
  'n': '♞',
  'b': '♝',
  'r': '♜',
  'q': '♛',
  'k': '♚',
}

const pieceValues: { [key: string]: number } = {
  'p': 1,
  'n': 3,
  'b': 3,
  'r': 5,
  'q': 9,
}

export default function CapturedPieces({ captured, label }: CapturedPiecesProps) {
  // Calculate material advantage
  const totalValue = captured.reduce((sum, piece) => sum + (pieceValues[piece.type] || 0), 0)

  return (
    <div className="bg-white/5 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-blue-200 font-medium">{label}</span>
        {totalValue > 0 && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
            +{totalValue}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 min-h-[32px]">
        {captured.length === 0 ? (
          <span className="text-xs text-gray-500 italic">No pieces captured</span>
        ) : (
          captured.map((piece, index) => (
            <div
              key={index}
              className={`text-2xl ${
                piece.color === 'white' 
                  ? 'text-gray-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]' 
                  : 'text-gray-700 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'
              }`}
              style={{
                filter: piece.color === 'white' 
                  ? 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' 
                  : 'drop-shadow(0 0 2px rgba(0,0,0,0.8))'
              }}
            >
              {pieceSymbols[piece.type]}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
