"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { pageSchema, type PageInput } from "@/lib/validations/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PageFormProps = {
  initialData?: PageInput & { id?: string }
  mode: "create" | "edit"
}

const LOCATION_LABELS: Record<string, string> = {
  NONE: "None (not shown in nav)",
  HEADER: "Header navigation (both homepage navbars)",
  FOOTER: "Footer links",
  BOTH: "Header navbars & Footer",
}

export function PageForm({ initialData, mode }: PageFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<PageInput>({
    resolver: zodResolver(pageSchema),
    defaultValues: initialData ?? {
      title: "",
      slug: "",
      content: "",
      showIn: "NONE",
      published: false,
    },
  })

  const published = watch("published")
  const showIn = watch("showIn")

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const onSubmit = async (data: PageInput) => {
    setServerError(null)
    const url = mode === "edit" ? `/api/pages/${initialData?.id}` : "/api/pages"
    const method = mode === "edit" ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setServerError(body.error ?? "Something went wrong")
      return
    }

    router.push("/admin/pages")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="About Us"
          onChange={(e) => {
            register("title").onChange(e)
            if (mode === "create") setValue("slug", autoSlug(e.target.value))
          }}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} placeholder="about-us" />
        <p className="text-xs text-muted-foreground">URL: /pages/<span className="font-mono">{watch("slug") || "slug"}</span></p>
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="showIn">Show in navigation</Label>
        <Select value={showIn} onValueChange={(v) => setValue("showIn", v as PageInput["showIn"])}>
          <SelectTrigger id="showIn">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LOCATION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Choose `Header` or `Both` to show this custom link in both top navbars on the homepage.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <textarea
          id="content"
          {...register("content")}
          placeholder="Write your page content here..."
          rows={12}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y font-mono"
        />
        <p className="text-xs text-muted-foreground">Plain text. Use blank lines to separate paragraphs.</p>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="published" checked={published} onCheckedChange={(v) => setValue("published", v)} />
        <Label htmlFor="published">Published (visible on site)</Label>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "edit" ? "Update Page" : "Create Page"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
