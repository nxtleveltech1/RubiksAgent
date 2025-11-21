export type AnimationState = "idle" | "listening" | "thinking" | "responding"
export type EmotionType = "neutral" | "happy" | "excited" | "sad" | "calm" | "confused"

export interface MotionCommand {
  target: "global" | "H1" | "H2" | "H3" | "V1" | "V2" | "V3"
  axis: "x" | "y" | "z"
  speed: number // degrees per second
  amplitude: number // degrees
  oscillate?: boolean // if true, rocks back and forth
}

export interface AnimationParams {
  globalRotationSpeed: { x: number; y: number; z: number }
  globalRockingAmplitude: { x: number; y: number; z: number }
  layerOffsets: {
    H1: number; H2: number; H3: number
    V1: number; V2: number; V3: number
  }
  scale: number // For pulsing effect
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export class AudioReactiveEngine {
  private state: AnimationState = "idle"
  private emotion: EmotionType = "neutral"
  private rawEnergy: number = 0
  private smoothedEnergy: number = 0
  private energyDerivative: number = 0
  private lastEnergy: number = 0
  private emphasis: number = 0 // 0-1, decays over time
  
  private currentParams: AnimationParams
  private targetParams: AnimationParams
  
  // Accumulators for continuous rotation
  private layerAngles = {
    H1: 0, H2: 0, H3: 0,
    V1: 0, V2: 0, V3: 0
  }

  constructor() {
    this.currentParams = this.getIdleParams()
    this.targetParams = this.getIdleParams()
  }

  // Call this every frame with delta time
  update(deltaTime: number): AnimationParams {
    
    // 1. Envelope Follower (Attack/Release)
    const attack = 0.9 // Fast attack
    const release = 2.0 // Slower release
    const target = this.rawEnergy
    
    if (target > this.smoothedEnergy) {
      this.smoothedEnergy = lerp(this.smoothedEnergy, target, attack * deltaTime * 10)
    } else {
      this.smoothedEnergy = lerp(this.smoothedEnergy, target, release * deltaTime)
    }

    // 2. Emphasis/Transient Detection
    const derivative = (this.smoothedEnergy - this.lastEnergy) / deltaTime
    this.lastEnergy = this.smoothedEnergy
    
    // If sudden rise in energy, trigger emphasis
    if (derivative > 2.0 && this.emphasis < 0.5) {
      this.emphasis = 1.0
    }
    
    // Decay emphasis
    this.emphasis = lerp(this.emphasis, 0, 5 * deltaTime)

    // 3. Update Target Params based on new energy state
    this.updateTargetParams()

    // 4. Smooth transition toward target params
    const smoothing = 8 * deltaTime // Faster response

    // Global rotation speeds
    this.currentParams.globalRotationSpeed.x = lerp(this.currentParams.globalRotationSpeed.x, this.targetParams.globalRotationSpeed.x, smoothing)
    this.currentParams.globalRotationSpeed.y = lerp(this.currentParams.globalRotationSpeed.y, this.targetParams.globalRotationSpeed.y, smoothing)
    this.currentParams.globalRotationSpeed.z = lerp(this.currentParams.globalRotationSpeed.z, this.targetParams.globalRotationSpeed.z, smoothing)

    // Global rocking amplitudes
    this.currentParams.globalRockingAmplitude.x = lerp(this.currentParams.globalRockingAmplitude.x, this.targetParams.globalRockingAmplitude.x, smoothing)
    this.currentParams.globalRockingAmplitude.y = lerp(this.currentParams.globalRockingAmplitude.y, this.targetParams.globalRockingAmplitude.y, smoothing)
    this.currentParams.globalRockingAmplitude.z = lerp(this.currentParams.globalRockingAmplitude.z, this.targetParams.globalRockingAmplitude.z, smoothing)
    
    // Scale (Pulse)
    this.currentParams.scale = lerp(this.currentParams.scale, this.targetParams.scale, smoothing * 2) // Pulse is fast

    // 5. Update Continuous Layer Angles
    // We add speed * delta to get the new angle
    const layers = ["H1", "H2", "H3", "V1", "V2", "V3"] as const
    // The "offset" in currentParams will be the actual angle to render
    
    // We need to map the "speed" from target params to actual rotation accumulation
    // Let's define base speeds in the get...Params methods
    
    // Actually, let's keep it simple:
    // targetParams.layerOffsets will hold the SPEED/AMPLITUDE of oscillation
    // We accumulate that into this.layerAngles
    
    // If we want "rhythm", we modulate the speed by energy
    
    if (this.state === "responding" || this.state === "listening") {
       // Modulate speed by energy + emphasis
       const energyFactor = 0.2 + (this.smoothedEnergy * 0.8) + (this.emphasis * 0.5)
       
       this.layerAngles.H1 += this.targetParams.layerOffsets.H1 * deltaTime * energyFactor
       this.layerAngles.H2 += this.targetParams.layerOffsets.H2 * deltaTime * energyFactor
       this.layerAngles.H3 += this.targetParams.layerOffsets.H3 * deltaTime * energyFactor
       this.layerAngles.V1 += this.targetParams.layerOffsets.V1 * deltaTime * energyFactor
       this.layerAngles.V2 += this.targetParams.layerOffsets.V2 * deltaTime * energyFactor
       this.layerAngles.V3 += this.targetParams.layerOffsets.V3 * deltaTime * energyFactor
    } else {
       // Idle drift
       this.layerAngles.H1 += this.targetParams.layerOffsets.H1 * deltaTime
       this.layerAngles.H2 += this.targetParams.layerOffsets.H2 * deltaTime
       this.layerAngles.H3 += this.targetParams.layerOffsets.H3 * deltaTime
       this.layerAngles.V1 += this.targetParams.layerOffsets.V1 * deltaTime
       this.layerAngles.V2 += this.targetParams.layerOffsets.V2 * deltaTime
       this.layerAngles.V3 += this.targetParams.layerOffsets.V3 * deltaTime
    }

    // Copy accumulated angles to currentParams to be rendered
    this.currentParams.layerOffsets = { ...this.layerAngles }

    return this.currentParams
  }

  setState(newState: AnimationState) {
    console.log("[v0] AudioReactiveEngine: setState", { from: this.state, to: newState })
    this.state = newState
    this.updateTargetParams()
  }

  setEmotion(newEmotion: EmotionType) {
    console.log("[v0] AudioReactiveEngine: setEmotion", { from: this.emotion, to: newEmotion })
    this.emotion = newEmotion
    this.updateTargetParams()
  }

  setAudioEnergy(energy: number) {
    this.rawEnergy = Math.max(0, Math.min(1, energy))
  }

  private updateTargetParams() {
    switch (this.state) {
      case "idle":
        this.targetParams = this.getIdleParams()
        break
      case "listening":
        this.targetParams = this.getListeningParams()
        break
      case "thinking":
        this.targetParams = this.getThinkingParams()
        break
      case "responding":
        this.targetParams = this.getRespondingParams()
        break
    }
  }

  private getIdleParams(): AnimationParams {
    return {
      globalRotationSpeed: { x: 2, y: 5, z: 1 },
      globalRockingAmplitude: { x: 2, y: 0, z: 1 },
      layerOffsets: {
        H1: 0.2, H2: -0.1, H3: 0.1,
        V1: 0, V2: 0.1, V3: 0
      },
      scale: 1.0
    }
  }

  private getListeningParams(): AnimationParams {
    const energy = this.smoothedEnergy
    return {
      globalRotationSpeed: { x: 0, y: lerp(5, 20, energy), z: 0 },
      globalRockingAmplitude: { x: lerp(3, 10, energy), y: 0, z: lerp(2, 5, energy) },
      layerOffsets: {
        H1: 0, H2: 1 + energy * 5, H3: 0,
        V1: 0, V2: -1 - energy * 3, V3: 0
      },
      scale: 1.0 + (energy * 0.05)
    }
  }

  private getThinkingParams(): AnimationParams {
    return {
      globalRotationSpeed: { x: 10, y: 60, z: 5 },
      globalRockingAmplitude: { x: 10, y: 0, z: 5 },
      layerOffsets: {
        H1: 5, H2: -5, H3: 5,
        V1: 2, V2: -2, V3: 2
      },
      scale: 1.0
    }
  }

  private getRespondingParams(): AnimationParams {
    const energy = this.smoothedEnergy
    const emphasis = this.emphasis

    let baseSpeed = 30
    let baseAmplitude = 10
    
    // Boost on emphasis
    if (emphasis > 0.5) {
        baseSpeed *= 1.5
        baseAmplitude *= 1.5
    }

    return {
      globalRotationSpeed: {
        x: lerp(5, 15, energy) + (emphasis * 10),
        y: lerp(baseSpeed * 0.5, baseSpeed, energy),
        z: lerp(2, 8, energy) + (emphasis * 5),
      },
      globalRockingAmplitude: {
        x: lerp(baseAmplitude * 0.3, baseAmplitude, energy),
        y: 0,
        z: lerp(baseAmplitude * 0.2, baseAmplitude * 0.7, energy),
      },
      layerOffsets: {
        H1: lerp(2, 10, energy) + (emphasis * 10),
        H2: lerp(-2, -8, energy) - (emphasis * 8),
        H3: lerp(1, 5, energy),
        V1: lerp(1, 6, energy),
        V2: lerp(-1, -5, energy) - (emphasis * 5),
        V3: lerp(1, 4, energy)
      },
      scale: 1.0 + (energy * 0.1) + (emphasis * 0.05)
    }
  }
}
