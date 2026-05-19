"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import slugify from "slugify"
import { productSchema, type ProductInput } from "@/lib/validations/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/admin/image-upload"

type Category = { id: string; name: string; slug: string }

type ProductFormProps = {
  initialData?: Partial<ProductInput> & { id?: string; slug?: string }
  mode: "create" | "edit"
  categories: Category[]
}

export function ProductForm({ initialData, mode, categories }: ProductFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialData?.gallery ?? [])

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      content: "",
      price: 0,
      featuredProduct: false,
      featuredImage: "",
      gallery: [],
      categoryId: "",
      stock: 0,
      published: false,
      ...initialData,
    },
  })

  const name = watch("name")
  const featuredImage = watch("featuredImage")
  const featuredProduct = watch("featuredProduct")
  const published = watch("published")

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue("name", val)
    if (mode === "create") {
      setValue("slug", slugify(val, { lower: true, strict: true }))
    }
  }

  const addGalleryImage = (url: string) => {
    const updated = [...galleryUrls, url]
    setGalleryUrls(updated)
    setValue("gallery", updated)
  }

  const removeGalleryImage = (idx: number) => {
    const updated = galleryUrls.filter((_, i) => i !== idx)
    setGalleryUrls(updated)
    setValue("gallery", updated)
  }

  const onSubmit = async (data: ProductInput) => {
    setServerError(null)
    const url = mode === "edit" && initialData?.slug
      ? `/api/products/${initialData.slug}`
      : "/api/products"
    const method = mode === "edit" ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, gallery: galleryUrls }),
    })

    if (!res.ok) {
      const body = await res.json()
      setServerError(body.error ?? "Something went wrong")
      return
    }

    router.push("/admin/products")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} onChange={handleNameChange} value={name} placeholder="Product name" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} placeholder="product-slug" />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea id="description" {...register("description")} rows={2} placeholder="Brief product description" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Full Content</Label>
        <Textarea id="content" {...register("content")} rows={6} placeholder="Detailed product content (Markdown supported)" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} placeholder="0.00" />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register("stock")} placeholder="0" />
          {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue("categoryId", v)} defaultValue={initialData?.categoryId ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex items-center gap-3">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={(v) => setValue("published", v)}
          />
          <Label htmlFor="published">Published</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="featured"
            checked={featuredProduct}
            onCheckedChange={(v) => setValue("featuredProduct", v)}
          />
          <Label htmlFor="featured">Featured</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Featured Image</Label>
        <ImageUpload
          value={featuredImage}
          onChange={(url) => setValue("featuredImage", url)}
          onClear={() => setValue("featuredImage", "")}
        />
        {errors.featuredImage && <p className="text-sm text-destructive">{errors.featuredImage.message}</p>}
      </div>

      <div className="space-y-3">
        <Label>Gallery Images</Label>
        <div className="flex flex-wrap gap-3">
          {galleryUrls.map((url, idx) => (
            <div key={idx} className="relative">
              <img src={url} alt={`Gallery ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
              <button
                type="button"
                onClick={() => removeGalleryImage(idx)}
                className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <ImageUpload
          onChange={addGalleryImage}
          label="Add Gallery Image"
        />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "edit" ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}