"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei"
import { RubiksCube, type RubiksCubeHandle } from "@/components/rubiks-cube"
import { useVoiceAvatar } from "@/components/voice-avatar"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mic, Phone, PhoneOff } from 'lucide-react'

type RubiksCubeAppProps = {
  defaultPublicKey: string
  defaultAssistantId: string
}

const SceneContent = ({ 
  cubeRef, 
  vapiPublicKey, 
  assistantId,
  onStateChange 
}: { 
  cubeRef: React.RefObject<RubiksCubeHandle>
  vapiPublicKey: string
  assistantId: string
  onStateChange: (state: any) => void
}) => {
  // This hook now uses useFrame, so it must be inside Canvas
  const voiceAvatar = useVoiceAvatar({
    cubeRef,
    vapiPublicKey,
    assistantId,
  })

  // Pass state up to parent UI
  useEffect(() => {
    onStateChange(voiceAvatar)
  }, [voiceAvatar, onStateChange])

  return null
}

export function RubiksCubeApp({ defaultPublicKey, defaultAssistantId }: RubiksCubeAppProps) {
  const cubeRef = useRef<RubiksCubeHandle>(null)
  const [vapiPublicKey, setVapiPublicKey] = useState<string>(defaultPublicKey)
  const [assistantId, setAssistantId] = useState<string>(defaultAssistantId)
  const [avatarState, setAvatarState] = useState<any>(null)

  const handleSaveSettings = (publicKey: string, assistant: string) => {
    setVapiPublicKey(publicKey)
    setAssistantId(assistant)
  }

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      neutral: "bg-gray-500",
      happy: "bg-green-500",
      thinking: "bg-blue-500",
      excited: "bg-yellow-500",
      confused: "bg-purple-500",
      listening: "bg-cyan-500",
      surprised: "bg-orange-500",
      calm: "bg-teal-500",
    }
    return colors[emotion] || "bg-gray-500"
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col md:flex-row">
      {/* 3D Canvas */}
      <div className="flex-grow w-full h-1/2 md:h-full relative">
        <Canvas>
          <PerspectiveCamera makeDefault position={[5, 5, 7]} fov={50} />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={15} />
          
          {/* Improved Lighting Setup */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={1} />
          <pointLight position={[0, 5, 0]} intensity={1} />
          <hemisphereLight args={["#ffffff", "#444444", 1.5]} />
          
          <Environment preset="city" />
          
          <RubiksCube ref={cubeRef} />
          
          <SceneContent 
            cubeRef={cubeRef}
            vapiPublicKey={vapiPublicKey}
            assistantId={assistantId}
            onStateChange={setAvatarState}
          />
        </Canvas>
        
        {/* Emotion indicator overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
          {avatarState && (
            <>
              <Badge className={`${getEmotionColor(avatarState.currentEmotion)} text-white`}>
                {avatarState.currentEmotion.toUpperCase()}
              </Badge>
              {avatarState.isSpeaking && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  <Mic className="w-3 h-3 mr-1" />
                  Speaking
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <Card className="m-4 w-full max-w-xs md:max-w-sm bg-gray-900/90 border-gray-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Voice Avatar Agent</CardTitle>
              <CardDescription className="text-gray-400">
                AI-powered Rubik's Cube with emotional intelligence
              </CardDescription>
            </div>
            <SettingsDialog
              vapiPublicKey={vapiPublicKey}
              assistantId={assistantId}
              onSave={handleSaveSettings}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Voice Control</h3>
            {!avatarState?.isCallActive ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={avatarState?.startCall}
                disabled={!vapiPublicKey || !assistantId || !avatarState}
              >
                <Phone className="mr-2 h-4 w-4" />
                Start Voice Call
              </Button>
            ) : (
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={avatarState?.endCall}
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>
            )}
            
            {!vapiPublicKey || !assistantId ? (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3">
                <p className="text-xs text-yellow-400">
                  Click Settings to configure your Vapi credentials, or add them as environment variables:
                </p>
                <ul className="text-xs text-yellow-400 mt-2 space-y-1 list-disc list-inside">
                  <li>VAPI_PUBLIC_KEY</li>
                  <li>VAPI_ASSISTANT_ID</li>
                </ul>
              </div>
            ) : null}
          </div>

          <Separator className="bg-gray-700" />

          {/* Transcript Display */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Live Transcript</h3>
            <div className="bg-gray-800/50 rounded-md p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
              {avatarState?.transcript ? (
                <p className="text-sm text-gray-300">{avatarState.transcript}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  {avatarState?.isCallActive
                    ? "Listening..."
                    : "Start a call to see transcript"}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Status Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Avatar Status</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800/50 rounded p-2">
                <p className="text-gray-400">Connection</p>
                <p className="font-semibold">
                  {avatarState?.isCallActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <p className="text-gray-400">Emotion</p>
                <p className="font-semibold capitalize">{avatarState?.currentEmotion || "Neutral"}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Manual Controls (for testing) */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Manual Controls</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700"
                onClick={() => cubeRef.current?.scramble()}
                disabled={avatarState?.isCallActive}
              >
                Scramble
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700"
                onClick={() => cubeRef.current?.reset()}
                disabled={avatarState?.isCallActive}
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Manual controls disabled during voice calls
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
