"use client"

import { Coffee } from "lucide-react"

type VideosProps = {
  youtubeUrls?: string[]
  backgroundColor?: string
}

function toEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

export function Videos({ youtubeUrls = [], backgroundColor }: VideosProps) {
  const urls = youtubeUrls.filter((u) => u.trim() !== "").slice(0, 3)
  if (urls.length === 0) return null

  return (
    <section id="coffee" className="py-16 lg:py-24" style={{ backgroundColor: backgroundColor || "var(--parchment, #faf8f5)" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-4">Videos</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-primary/30" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Coffee key={i} className="h-3 w-3 text-primary" />
              ))}
            </div>
            <div className="h-px w-12 bg-primary/30" />
          </div>
        </div>

        <div className={`grid gap-6 max-w-5xl mx-auto ${urls.length === 1 ? "grid-cols-1" : urls.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
          {urls.map((url, i) => (
            <div key={i} className="aspect-video rounded-lg overflow-hidden shadow-lg bg-muted">
              <iframe
                width="100%"
                height="100%"
                src={toEmbedUrl(url)}
                title={`Video ${i + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
