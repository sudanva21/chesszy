// Bot personalities with cool names and descriptions

export interface BotPersonality {
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  title: string
  avatar: string
  description: string
  greeting: string
  winQuote: string
  loseQuote: string
}

export const BOT_PERSONALITIES: Record<string, BotPersonality> = {
  easy: {
    name: 'Rookie Rook',
    difficulty: 'easy',
    title: 'The Beginner',
    avatar: '♜',
    description: 'Just learning the basics, makes occasional mistakes',
    greeting: 'Hey! Ready for your first game?',
    winQuote: 'Wow, you got me! Great game!',
    loseQuote: 'Oops, I made some lucky moves there!',
  },
  medium: {
    name: 'Knight Nova',
    difficulty: 'medium',
    title: 'The Strategist',
    avatar: '♞',
    description: 'Thinks ahead and plays solid chess',
    greeting: 'Let\'s have a good strategic battle!',
    winQuote: 'Well played! You\'re getting better!',
    loseQuote: 'My calculations paid off this time!',
  },
  hard: {
    name: 'Grandmaster Zeus',
    difficulty: 'hard',
    title: 'The Champion',
    avatar: '♚',
    description: 'Calculates deeply and rarely makes mistakes',
    greeting: 'Prepare yourself for a real challenge!',
    winQuote: 'Incredible! You have mastered the game!',
    loseQuote: 'As expected. Better luck next time!',
  },
}

// Alternative bot names for variety
export const ALTERNATIVE_BOT_NAMES: Record<string, string[]> = {
  easy: [
    'Pawn Pioneer',
    'Castle Cadet',
    'Bishop Buddy',
    'Newbie Knight',
  ],
  medium: [
    'Strategic Storm',
    'Tactical Titan',
    'Chess Commander',
    'Board Master',
  ],
  hard: [
    'Magnus Mind',
    'Checkmate King',
    'Chess Overlord',
    'Immortal Tactician',
  ],
}

// Get bot personality by difficulty
export function getBotPersonality(difficulty: 'easy' | 'medium' | 'hard'): BotPersonality {
  return BOT_PERSONALITIES[difficulty]
}

// Get bot display name
export function getBotName(difficulty: 'easy' | 'medium' | 'hard'): string {
  return BOT_PERSONALITIES[difficulty].name
}

// Get bot avatar emoji
export function getBotAvatar(difficulty: 'easy' | 'medium' | 'hard'): string {
  return BOT_PERSONALITIES[difficulty].avatar
}

// Get bot title
export function getBotTitle(difficulty: 'easy' | 'medium' | 'hard'): string {
  return BOT_PERSONALITIES[difficulty].title
}

// Get random alternative name for variety
export function getRandomBotName(difficulty: 'easy' | 'medium' | 'hard'): string {
  const names = ALTERNATIVE_BOT_NAMES[difficulty]
  return names[Math.floor(Math.random() * names.length)]
}
