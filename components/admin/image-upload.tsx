"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { getWebPUrl } from "@/lib/cloudinary-url"

type ImageUploadProps = {
  value?: string
  onChange: (url: string) => void
  onClear?: () => void
  label?: string
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url) || url.includes('/video/')
}

export function ImageUpload({ value, onChange, onClear, label = "Upload Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("Please select an image or video file")
      return
    }
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      onChange(url)
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const preview = value || null
  const videoPreview = preview && isVideo(preview)
  const imagePreview = preview && !videoPreview ? getWebPUrl(preview, 400) : null

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative inline-block">
          {videoPreview ? (
            <video
              src={preview}
              className="w-[200px] h-[200px] rounded-lg object-cover border"
              muted
              playsInline
              controls
            />
          ) : (
            <Image
              src={imagePreview!}
              alt="Preview"
              width={200}
              height={200}
              className="rounded-lg object-cover border"
            />
          )}
          <button
            type="button"
            onClick={() => { onClear?.(); onChange("") }}
            className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {!preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : label}
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
