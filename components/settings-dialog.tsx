"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from 'lucide-react'

type SettingsDialogProps = {
  vapiPublicKey: string
  assistantId: string
  onSave: (publicKey: string, assistantId: string) => void
}

export function SettingsDialog({ vapiPublicKey, assistantId, onSave }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [publicKey, setPublicKey] = useState(vapiPublicKey)
  const [assistant, setAssistant] = useState(assistantId)

  const handleSave = () => {
    onSave(publicKey, assistant)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 hover:bg-gray-700">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Vapi Configuration</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your Vapi AI credentials to enable voice functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="publicKey">Vapi Public Key</Label>
            <Input
              id="publicKey"
              placeholder="Enter your Vapi public key"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-500">
              Get this from your Vapi dashboard at vapi.ai
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assistantId">Assistant ID</Label>
            <Input
              id="assistantId"
              placeholder="Enter your assistant ID"
              value={assistant}
              onChange={(e) => setAssistant(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-500">
              Create an assistant in your Vapi dashboard
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="bg-gray-800 border-gray-600">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
