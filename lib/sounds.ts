'use client'

// Sound effects using Web Audio API and built-in sounds
class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  // Play a tone with specific frequency and duration
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type
    gainNode.gain.value = volume

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Play multiple tones (chord)
  private playChord(frequencies: number[], duration: number, volume: number = 0.2) {
    frequencies.forEach(freq => this.playTone(freq, duration, 'sine', volume))
  }

  // Move piece sound - subtle click
  playMove() {
    if (!this.enabled || !this.audioContext) return
    
    // Two quick tones for a "click" sound
    this.playTone(800, 0.05, 'square', 0.15)
    setTimeout(() => this.playTone(600, 0.05, 'square', 0.1), 20)
  }

  // Capture piece sound - slightly different
  playCapture() {
    if (!this.enabled || !this.audioContext) return
    
    // Descending tones for capture
    this.playTone(900, 0.08, 'square', 0.2)
    setTimeout(() => this.playTone(700, 0.08, 'square', 0.15), 40)
    setTimeout(() => this.playTone(500, 0.1, 'square', 0.1), 80)
  }

  // Check sound - urgent warning
  playCheck() {
    if (!this.enabled || !this.audioContext) return
    
    // Rising alarm tones
    this.playTone(600, 0.1, 'triangle', 0.3)
    setTimeout(() => this.playTone(800, 0.1, 'triangle', 0.3), 100)
    setTimeout(() => this.playTone(1000, 0.15, 'triangle', 0.35), 200)
  }

  // Checkmate sound - dramatic
  playCheckmate() {
    if (!this.enabled || !this.audioContext) return
    
    // Dramatic descending chord
    this.playChord([800, 1000, 1200], 0.3, 0.25)
    setTimeout(() => this.playChord([600, 750, 900], 0.3, 0.2), 200)
    setTimeout(() => this.playChord([400, 500, 600], 0.5, 0.15), 400)
  }

  // Victory sound - celebratory
  playVictory() {
    if (!this.enabled || !this.audioContext) return
    
    // Happy ascending melody
    const melody = [523, 587, 659, 784, 880] // C, D, E, G, A
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.25), i * 120)
    })
    
    // Final chord
    setTimeout(() => {
      this.playChord([880, 1047, 1319], 0.6, 0.3) // A, C, E (A major)
    }, 600)
  }

  // Defeat sound - sad
  playDefeat() {
    if (!this.enabled || !this.audioContext) return
    
    // Descending sad melody
    const melody = [659, 587, 523, 494, 440] // E, D, C, B, A
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.2), i * 150)
    })
  }

  // Draw sound - neutral
  playDraw() {
    if (!this.enabled || !this.audioContext) return
    
    // Neutral repeating tone
    this.playTone(600, 0.15, 'sine', 0.2)
    setTimeout(() => this.playTone(600, 0.15, 'sine', 0.2), 200)
    setTimeout(() => this.playTone(600, 0.3, 'sine', 0.15), 400)
  }

  // Game start sound - welcoming
  playGameStart() {
    if (!this.enabled || !this.audioContext) return
    
    // Quick upward scale
    this.playTone(440, 0.1, 'sine', 0.2)
    setTimeout(() => this.playTone(554, 0.1, 'sine', 0.2), 100)
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.25), 200)
  }

  // Bot thinking sound - subtle
  playBotThinking() {
    if (!this.enabled || !this.audioContext) return
    
    // Soft oscillating tone
    this.playTone(400, 0.1, 'sine', 0.1)
    setTimeout(() => this.playTone(500, 0.1, 'sine', 0.1), 150)
  }
}

// Create singleton instance
const soundManager = new SoundManager()

export default soundManager

// Export convenience functions
export const playMove = () => soundManager.playMove()
export const playCapture = () => soundManager.playCapture()
export const playCheck = () => soundManager.playCheck()
export const playCheckmate = () => soundManager.playCheckmate()
export const playVictory = () => soundManager.playVictory()
export const playDefeat = () => soundManager.playDefeat()
export const playDraw = () => soundManager.playDraw()
export const playGameStart = () => soundManager.playGameStart()
export const playBotThinking = () => soundManager.playBotThinking()
export const setSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled)
