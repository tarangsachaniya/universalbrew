"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

type MediaItem = {
  url: string
  alt: string
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url) || url.includes('/video/')
}

export function ProductCarousel({ items }: { items: MediaItem[] }) {
  const [current, setCurrent] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length)
  const next = () => setCurrent((c) => (c + 1) % items.length)

  // Autoplay video when slide becomes active
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [current])

  if (items.length === 0) return null

  const item = items[current]
  const isVid = isVideo(item.url)

  return (
    <div className="space-y-3">
      {/* Main slide */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary group">
        {isVid ? (
          <video
            ref={videoRef}
            key={item.url}
            src={item.url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            loop
            onEnded={next}
          />
        ) : (
          <Image
            src={item.url}
            alt={item.alt}
            fill
            className="object-cover"
            priority={current === 0}
          />
        )}

        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((it, i) => {
            const vid = isVideo(it.url)
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === current ? "border-primary" : "border-transparent"
                }`}
              >
                {vid ? (
                  <video
                    src={it.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image src={it.url} alt={it.alt} fill className="object-cover" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
