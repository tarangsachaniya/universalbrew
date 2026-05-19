"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, PlayCircle } from "lucide-react"
import { DEFAULT_ABOUT_FEATURES, type AboutFeature } from "@/lib/about"

type HomepageDetailsFormProps = {
  initialData: {
    id: string
    youtubeUrls?: string[]
    aboutTitle?: string
    aboutBody?: string
    aboutFeatures?: AboutFeature[]
  }
}

export function HomepageDetailsForm({ initialData }: HomepageDetailsFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aboutTitle, setAboutTitle] = useState(initialData.aboutTitle ?? "")
  const [aboutBody, setAboutBody] = useState(initialData.aboutBody ?? "")
  const [aboutFeatures, setAboutFeatures] = useState<AboutFeature[]>(
    initialData.aboutFeatures?.length ? initialData.aboutFeatures : DEFAULT_ABOUT_FEATURES
  )
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(
    initialData.youtubeUrls?.length
      ? [...initialData.youtubeUrls, ...Array(3 - initialData.youtubeUrls.length).fill("")]
      : ["", "", ""]
  )

  const updateYoutubeUrl = (idx: number, value: string) => {
    setYoutubeUrls((prev) => prev.map((url, index) => (index === idx ? value : url)))
  }

  const updateAboutFeature = (idx: number, field: keyof AboutFeature, value: string) => {
    setAboutFeatures((prev) => prev.map((feature, index) => (index === idx ? { ...feature, [field]: value } : feature)))
  }

  const addAboutFeature = () => {
    setAboutFeatures((prev) => [...prev, { title: "", description: "" }])
  }

  const removeAboutFeature = (idx: number) => {
    setAboutFeatures((prev) => prev.filter((_, index) => index !== idx))
  }

  const resetAboutFeatures = () => {
    setAboutFeatures(DEFAULT_ABOUT_FEATURES)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setIsSubmitting(true)

    const filteredYoutube = youtubeUrls.filter((url) => url.trim() !== "").slice(0, 3)
    const filteredAboutFeatures = aboutFeatures
      .map((feature) => ({
        title: feature.title.trim(),
        description: feature.description.trim(),
      }))
      .filter((feature) => feature.title !== "" || feature.description !== "")

    const res = await fetch("/api/homepage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "details",
        id: initialData.id,
        youtubeUrls: filteredYoutube,
        aboutTitle: aboutTitle.trim() || undefined,
        aboutBody: aboutBody.trim() || undefined,
        aboutFeatures: filteredAboutFeatures.length ? filteredAboutFeatures : undefined,
      }),
    })

    const body = await res.json().catch(() => null)
    setIsSubmitting(false)

    if (!res.ok) {
      setServerError(body?.error ?? "Something went wrong")
      return
    }

    router.push("/admin/heroes")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-3 border rounded-lg p-4 bg-card">
        <div>
          <Label className="text-base font-semibold">Homepage Details</Label>
          <p className="text-xs text-muted-foreground mt-1">This form updates only the About section and homepage videos.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-red-500" />
            <Label className="text-base font-semibold">YouTube Videos (max 3)</Label>
          </div>
          <p className="text-xs text-muted-foreground">Paste full YouTube watch URLs. Leave blank to hide the Videos section.</p>
          <div className="space-y-2">
            {youtubeUrls.map((url, idx) => (
              <div key={idx} className="space-y-1">
                <Label className="text-xs text-muted-foreground">Video {idx + 1}</Label>
                <Input
                  value={url}
                  onChange={(e) => updateYoutubeUrl(idx, e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Section Title</Label>
          <Input
            value={aboutTitle}
            onChange={(e) => setAboutTitle(e.target.value)}
            placeholder="An original, pure, rich-creamy & aromatic coffee with incredible taste"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Section Body (use blank line to separate paragraphs)</Label>
          <Textarea
            value={aboutBody}
            onChange={(e) => setAboutBody(e.target.value)}
            placeholder="Coffee could be a daily need or a luxury..."
            rows={5}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs">Feature Cards</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={resetAboutFeatures}>
                Reset Defaults
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={addAboutFeature} disabled={aboutFeatures.length >= 6}>
                <Plus className="h-4 w-4 mr-1" />
                Add Feature
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Up to 6 feature cards are shown. Their icons stay consistent on the storefront while the text is editable here.</p>
          <div className="space-y-3">
            {aboutFeatures.map((feature, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-3 bg-background">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-xs font-medium">Feature {idx + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAboutFeature(idx)}
                    disabled={aboutFeatures.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={feature.title}
                    onChange={(e) => updateAboutFeature(idx, "title", e.target.value)}
                    placeholder="Feature title"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={feature.description}
                    onChange={(e) => updateAboutFeature(idx, "description", e.target.value)}
                    placeholder="Feature description"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3 flex-wrap">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Update Details"}
        </Button>
      </div>
    </form>
  )
}
