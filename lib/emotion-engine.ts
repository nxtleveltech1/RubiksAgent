import { RubiksCubeHandle } from "@/components/rubiks-cube"

export type EmotionType = "neutral" | "happy" | "thinking" | "excited" | "confused" | "listening" | "surprised" | "calm"

export type MovementPattern = {
  type: "rotate" | "twist" | "sequence"
  axis?: "x" | "y" | "z"
  angle?: number
  layer?: number
  direction?: number
  sequence?: MovementPattern[]
  duration?: number
}

export const EMOTION_PATTERNS: Record<EmotionType, MovementPattern[]> = {
  neutral: [
    { type: "rotate", axis: "y", angle: 0.1 }
  ],
  
  happy: [
    { type: "rotate", axis: "y", angle: 0.5 },
    { type: "rotate", axis: "x", angle: 0.3 },
    { type: "rotate", axis: "y", angle: -0.5 },
  ],
  
  thinking: [
    { type: "rotate", axis: "x", angle: 0.6 },
    { type: "rotate", axis: "y", angle: 0.4 },
  ],
  
  excited: [
    { type: "rotate", axis: "y", angle: 1.2 },
    { type: "rotate", axis: "x", angle: 0.8 },
    { type: "rotate", axis: "z", angle: 0.6 },
  ],
  
  confused: [
    { type: "rotate", axis: "z", angle: 0.5 },
    { type: "rotate", axis: "z", angle: -1.0 },
    { type: "rotate", axis: "z", angle: 0.5 },
  ],
  
  listening: [
    { type: "rotate", axis: "x", angle: 0.25 },
    { type: "rotate", axis: "y", angle: 0.15 },
  ],
  
  surprised: [
    { type: "rotate", axis: "x", angle: -0.7 },
    { type: "rotate", axis: "y", angle: 0.9 },
  ],
  
  calm: [
    { type: "rotate", axis: "y", angle: 0.3 },
    { type: "rotate", axis: "x", angle: 0.2 },
  ],
}

export class EmotionEngine {
  private cubeRef: React.RefObject<RubiksCubeHandle>
  private isAnimating: boolean = false
  private currentEmotion: EmotionType = "neutral"
  private animationQueue: EmotionType[] = []

  constructor(cubeRef: React.RefObject<RubiksCubeHandle>) {
    this.cubeRef = cubeRef
    console.log("[v0] EmotionEngine initialized", { hasCubeRef: !!cubeRef.current })
  }

  async setEmotion(emotion: EmotionType, immediate: boolean = false) {
    console.log("[v0] EmotionEngine.setEmotion called", { emotion, immediate, hasCubeRef: !!this.cubeRef.current })
    
    if (immediate) {
      this.animationQueue = []
      this.currentEmotion = emotion
      await this.executeEmotion(emotion)
    } else {
      this.animationQueue.push(emotion)
      console.log("[v0] Added to queue", { queueLength: this.animationQueue.length, isAnimating: this.isAnimating })
      this.processQueue()
    }
  }

  private async processQueue() {
    if (this.isAnimating) {
      console.log("[v0] Already processing queue, skipping")
      return
    }
    
    console.log("[v0] Processing queue", { queueLength: this.animationQueue.length })
    this.isAnimating = true
    
    try {
      while (this.animationQueue.length > 0) {
        const emotion = this.animationQueue.shift()
        if (emotion) {
          this.currentEmotion = emotion
          await Promise.race([
            this.executeEmotion(emotion),
            new Promise(resolve => setTimeout(resolve, 3000)) // 3s max per emotion
          ])
        }
      }
    } catch (error) {
      console.error("[v0] Error processing queue:", error)
    } finally {
      this.isAnimating = false
      console.log("[v0] Queue processing complete")
    }
  }

  private async executeEmotion(emotion: EmotionType) {
    console.log("[v0] Executing emotion", { emotion, hasCubeRef: !!this.cubeRef.current })
    
    if (!this.cubeRef.current) {
      console.log("[v0] ERROR: cubeRef.current is null!")
      return
    }

    const patterns = EMOTION_PATTERNS[emotion]
    console.log("[v0] Executing patterns", { emotion, patternCount: patterns.length })

    for (const pattern of patterns) {
      await this.executePattern(pattern)
    }

    console.log("[v0] Finished executing emotion", { emotion })
  }

  private async executePattern(pattern: MovementPattern) {
    console.log("[v0] Executing pattern", { type: pattern.type, axis: pattern.axis, angle: pattern.angle })
    
    if (!this.cubeRef.current) {
      console.log("[v0] ERROR: cubeRef.current is null in executePattern!")
      return
    }

    switch (pattern.type) {
      case "rotate":
        if (pattern.axis && pattern.angle !== undefined) {
          console.log("[v0] Calling rotateCube", { axis: pattern.axis, angle: pattern.angle })
          await this.cubeRef.current.rotateCube(pattern.axis, pattern.angle)
          console.log("[v0] rotateCube completed")
        }
        break

      case "twist":
        if (pattern.axis && pattern.layer !== undefined && pattern.direction !== undefined) {
          console.log("[v0] Calling twist", { axis: pattern.axis, layer: pattern.layer, direction: pattern.direction })
          await this.cubeRef.current.twist(pattern.axis, pattern.layer, pattern.direction)
          console.log("[v0] twist completed")
        }
        break

      case "sequence":
        if (pattern.sequence) {
          for (const subPattern of pattern.sequence) {
            await this.executePattern(subPattern)
          }
        }
        break
    }
  }

  getCurrentEmotion(): EmotionType {
    return this.currentEmotion
  }

  isCurrentlyAnimating(): boolean {
    return this.isAnimating
  }

  analyzeTranscript(text: string, role: "user" | "assistant"): EmotionType {
    const lowerText = text.toLowerCase()

    const excitedKeywords = ["amazing", "awesome", "great", "fantastic", "wonderful", "excellent", "wow"]
    const confusedKeywords = ["confused", "don't understand", "what", "huh", "unclear", "not sure"]
    const happyKeywords = ["happy", "glad", "pleased", "thank", "thanks", "good", "nice"]
    const thinkingKeywords = ["hmm", "let me think", "considering", "analyzing", "processing"]

    if (role === "assistant") {
      if (excitedKeywords.some(keyword => lowerText.includes(keyword))) {
        return "excited"
      }
      if (happyKeywords.some(keyword => lowerText.includes(keyword))) {
        return "happy"
      }
      if (thinkingKeywords.some(keyword => lowerText.includes(keyword))) {
        return "thinking"
      }
      return "calm"
    } else {
      if (confusedKeywords.some(keyword => lowerText.includes(keyword))) {
        return "confused"
      }
      if (excitedKeywords.some(keyword => lowerText.includes(keyword))) {
        return "surprised"
      }
      return "listening"
    }
  }
}
