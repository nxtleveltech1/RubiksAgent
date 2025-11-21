"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { PutBlobResult } from "@vercel/blob"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload } from "lucide-react"

interface FileUploaderProps {
  onUploadComplete?: (blob: PutBlobResult) => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [blob, setBlob] = useState<PutBlobResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!inputFileRef.current?.files) {
      setError("No file selected")
      return
    }

    const file = inputFileRef.current.files[0]
    setIsUploading(true)

    try {
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })

      setBlob(newBlob)
      if (onUploadComplete) {
        onUploadComplete(newBlob)
      }
    } catch (uploadError: any) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleUploadSubmit} className="space-y-2">
        <Input name="file" ref={inputFileRef} type="file" required />
        <Button type="submit" disabled={isUploading} className="w-full">
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </form>
      {blob && (
        <div>
          <p className="text-sm text-green-400">Upload successful!</p>
          <a
            href={blob.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline break-all"
          >
            {blob.url}
          </a>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
