import { RubiksCubeApp } from "@/components/rubiks-cube-app"

export default function Page() {
  const publicKey = process.env.VAPI_PUBLIC_KEY || ""
  const assistantId = process.env.VAPI_ASSISTANT_ID || ""

  return <RubiksCubeApp defaultPublicKey={publicKey} defaultAssistantId={assistantId} />
}
