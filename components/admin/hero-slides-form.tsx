"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/admin/image-upload"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { getWebPUrl } from "@/lib/cloudinary-url"
import type { HeroSlide } from "@/components/hero"

type HeroSlidesFormProps = {
  initialData?: {
    id?: string
    slides?: HeroSlide[]
    active?: boolean
  }
  mode: "create" | "edit"
}

const DEFAULT_SUBTITLE = "An original, pure, rich-creamy & aromatic coffee with incredible taste"

export function HeroSlidesForm({ initialData, mode }: HeroSlidesFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [active, setActive] = useState(initialData?.active ?? false)
  const [slides, setSlides] = useState<HeroSlide[]>(initialData?.slides ?? [])

  const updateSlide = (idx: number, field: keyof HeroSlide, value: string) => {
    setSlides((prev) => prev.map((slide, index) => (index === idx ? { ...slide, [field]: value } : slide)))
  }

  const addSlide = (url: string) => {
    setSlides((prev) => [...prev, { url, title: "Universal Brew", subtitle: DEFAULT_SUBTITLE }])
  }

  const removeSlide = (idx: number) => {
    setSlides((prev) => prev.filter((_, index) => index !== idx))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setIsSubmitting(true)

    const payload =
      mode === "edit"
        ? { section: "slides", id: initialData?.id, slides, active }
        : { slides, active }

    const res = await fetch("/api/homepage", {
      method: mode === "edit" ? "PATCH" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const body = await res.json().catch(() => null)
    setIsSubmitting(false)

    if (!res.ok) {
      setServerError(body?.error ?? "Something went wrong")
      return
    }

    if (mode === "create" && body?.id) {
      router.push(`/admin/heroes/${body.id}/edit`)
    } else {
      router.push("/admin/heroes")
    }
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Hero Slides</Label>
            <p className="text-xs text-muted-foreground mt-1">This form updates only the slider images and captions.</p>
          </div>
          <span className="text-xs text-muted-foreground">{slides.length} slide{slides.length !== 1 ? "s" : ""}</span>
        </div>

        {slides.length === 0 && (
          <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
            No slides yet. Add an image below to create the first slide.
          </p>
        )}

        <div className="space-y-4">
          {slides.map((slide, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="relative w-full aspect-[16/5] rounded-lg overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getWebPUrl(slide.url, 600)}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <div>
                        <div className="text-white font-serif text-sm font-semibold">{slide.title || "Title"}</div>
                        <div className="text-white/70 text-xs">{slide.subtitle || "Subtitle"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile image upload */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Mobile Image (9:16 portrait) — optional</Label>
                    {slide.mobileUrl ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 aspect-[9/16] rounded overflow-hidden border bg-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getWebPUrl(slide.mobileUrl, 120)} alt="mobile preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSlide(idx, "mobileUrl" as keyof HeroSlide, "")}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <ImageUpload onChange={(url) => updateSlide(idx, "mobileUrl" as keyof HeroSlide, url)} label="Add Mobile Image" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Slide Title</Label>
                      <Input
                        value={slide.title}
                        onChange={(e) => updateSlide(idx, "title", e.target.value)}
                        placeholder="e.g. The Vessel"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Slide Subtitle</Label>
                      <Input
                        value={slide.subtitle}
                        onChange={(e) => updateSlide(idx, "subtitle", e.target.value)}
                        placeholder={DEFAULT_SUBTITLE}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">CTA Primary Text</Label>
                      <Input
                        value={slide.ctaPrimaryText ?? ""}
                        onChange={(e) => updateSlide(idx, "ctaPrimaryText", e.target.value)}
                        placeholder="Shop Now"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">CTA Primary Link</Label>
                      <Input
                        value={slide.ctaPrimaryHref ?? ""}
                        onChange={(e) => updateSlide(idx, "ctaPrimaryHref", e.target.value)}
                        placeholder="/products"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">CTA Secondary Text</Label>
                      <Input
                        value={slide.ctaSecondaryText ?? ""}
                        onChange={(e) => updateSlide(idx, "ctaSecondaryText", e.target.value)}
                        placeholder="Our Story"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">CTA Secondary Link</Label>
                      <Input
                        value={slide.ctaSecondaryHref ?? ""}
                        onChange={(e) => updateSlide(idx, "ctaSecondaryHref", e.target.value)}
                        placeholder="/about-us"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSlide(idx)}
                  className="h-8 w-8 rounded-full bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <ImageUpload onChange={addSlide} label="Add Slide Image" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="active" checked={active} onCheckedChange={setActive} />
        <Label htmlFor="active">Set as Active Hero</Label>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3 flex-wrap">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "edit" ? "Update Slides" : "Create Hero"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
