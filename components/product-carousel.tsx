"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

type MediaItem = { url: string; alt: string }

function isVideo(url: string) {
  return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url) || url.includes('/video/')
}

export function ProductCarousel({
  items,
  fill = false,
}: {
  items: MediaItem[]
  fill?: boolean
}) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length)
  const next = () => setCurrent((c) => (c + 1) % items.length)

  useEffect(() => {
    if (items.length <= 1 || paused || isVideo(items[current].url)) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % items.length), 3000)
    return () => clearInterval(id)
  }, [current, paused, items])

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }, [current])

  if (items.length === 0) return null
  const item = items[current]
  const isVid = isVideo(item.url)

  return (
    <div className={fill ? "h-full flex flex-col gap-2 min-h-0" : "space-y-3"}>
      {/* Main slide */}
      <div
        className={`relative ${fill ? "flex-1 min-h-0" : "aspect-square"} rounded-xl overflow-hidden bg-muted group`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {isVid ? (
          <video
            ref={videoRef}
            key={item.url}
            src={item.url}
            className="w-full h-full object-cover"
            autoPlay muted playsInline loop
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

        {/* Dot indicators inside slide (fill mode) */}
        {fill && items.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails strip */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto shrink-0 pb-1">
          {items.map((it, i) => {
            const vid = isVideo(it.url)
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === current ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {vid ? (
                  <video src={it.url} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <Image src={it.url} alt={it.alt} fill className="object-cover" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Dots (non-fill mode only) */}
      {!fill && items.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
