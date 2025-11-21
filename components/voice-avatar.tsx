"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Vapi from "@vapi-ai/web"
import { useFrame } from "@react-three/fiber"
import { RubiksCubeHandle } from "./rubiks-cube"
import { AudioReactiveEngine, EmotionType } from "@/lib/audio-reactive-engine"

export type VoiceAvatarHandle = {
  startCall: () => Promise<void>
  endCall: () => void
  getCurrentEmotion: () => EmotionType
}

type VoiceAvatarProps = {
  cubeRef: React.RefObject<RubiksCubeHandle>
  vapiPublicKey?: string
  assistantId?: string
}

export const useVoiceAvatar = ({ cubeRef, vapiPublicKey, assistantId }: VoiceAvatarProps) => {
  const vapiRef = useRef<Vapi | null>(null)
  const engineRef = useRef<AudioReactiveEngine | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>("neutral")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<string>("")

  useEffect(() => {
    engineRef.current = new AudioReactiveEngine()
    console.log("[v0] VoiceAvatar: AudioReactiveEngine created")
  }, [])

  useFrame((state, delta) => {
    if (engineRef.current && cubeRef.current) {
      const params = engineRef.current.update(delta)
      cubeRef.current.updateAnimation(params, delta)
    }
  })

  useEffect(() => {
    console.log("[v0] VoiceAvatar: Initializing emotion engine", { hasCubeRef: !!cubeRef.current })
    // The engine will check .current when it actually needs to execute animations.
  }, [cubeRef])

  useEffect(() => {
    if (vapiPublicKey) {
      console.log("[v0] VoiceAvatar: Initializing Vapi")
      vapiRef.current = new Vapi(vapiPublicKey)
      
      vapiRef.current.on("call-start", () => {
        console.log("[v0] Call started")
        setIsCallActive(true)
        engineRef.current?.setState("listening")
        engineRef.current?.setEmotion("happy")
        setCurrentEmotion("happy")
      })

      vapiRef.current.on("call-end", () => {
        console.log("[v0] Call ended")
        setIsCallActive(false)
        engineRef.current?.setState("idle")
        engineRef.current?.setEmotion("neutral")
        setCurrentEmotion("neutral")
        setIsSpeaking(false)
      })

      vapiRef.current.on("speech-start", () => {
        console.log("[v0] User started speaking")
        engineRef.current?.setState("listening")
        setCurrentEmotion("listening" as any)
      })

      vapiRef.current.on("speech-end", () => {
        console.log("[v0] User stopped speaking")
        engineRef.current?.setState("thinking")
        setCurrentEmotion("thinking" as any)
      })

      vapiRef.current.on("volume-level", (volume: number) => {
        engineRef.current?.setAudioEnergy(volume)
      })

      vapiRef.current.on("message", (message: any) => {
        console.log("[v0] Message received:", message)
        
        if (message.type === "transcript") {
          const transcriptText = message.transcript || ""
          setTranscript(transcriptText)
          
          if (message.role === "assistant") {
            setIsSpeaking(true)
            engineRef.current?.setState("responding")
          } else if (message.role === "user") {
            engineRef.current?.setState("listening")
          }
        }

        if (message.type === "function-call") {
          engineRef.current?.setState("thinking")
          setCurrentEmotion("thinking")
        }
      })

      vapiRef.current.on("error", (error: any) => {
        console.error("[v0] Vapi error:", error)
        engineRef.current?.setEmotion("confused")
        setCurrentEmotion("confused")
      })
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [vapiPublicKey])

  const startCall = useCallback(async () => {
    if (!vapiRef.current || !assistantId) {
      console.error("[v0] Vapi not initialized or assistant ID missing")
      return
    }

    try {
      await vapiRef.current.start(assistantId)
    } catch (error) {
      console.error("[v0] Failed to start call:", error)
    }
  }, [assistantId])

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop()
    }
  }, [])

  return {
    isCallActive,
    currentEmotion,
    isSpeaking,
    transcript,
    startCall,
    endCall,
  }
}
