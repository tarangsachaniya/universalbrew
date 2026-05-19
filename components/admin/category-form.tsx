"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import slugify from "slugify"
import { categorySchema, type CategoryInput } from "@/lib/validations/category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/admin/image-upload"

type CategoryFormProps = {
  initialData?: CategoryInput & { id?: string; slug?: string }
  mode: "create" | "edit"
}

export function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ?? { name: "", slug: "", description: "", image: "" },
  })

  const name = watch("name")
  const image = watch("image")

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue("name", val)
    if (mode === "create") {
      setValue("slug", slugify(val, { lower: true, strict: true }))
    }
  }

  const onSubmit = async (data: CategoryInput) => {
    setServerError(null)
    const url = mode === "edit" && initialData?.slug
      ? `/api/categories/${initialData.slug}`
      : "/api/categories"
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

    router.push("/admin/categories")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          onChange={handleNameChange}
          value={name}
          placeholder="e.g. Instant Coffee"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} placeholder="e.g. instant-coffee" />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} rows={3} placeholder="Optional description" />
      </div>

      <div className="space-y-2">
        <Label>Image</Label>
        <ImageUpload
          value={image}
          onChange={(url) => setValue("image", url)}
          onClear={() => setValue("image", "")}
        />
        {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "edit" ? "Update Category" : "Create Category"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}