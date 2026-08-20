"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import slugify from "slugify"
import { productSchema, type ProductInput } from "@/lib/validations/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/admin/image-upload"
import { Plus, Trash2, GripVertical } from "lucide-react"

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

  const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:           "",
      slug:           "",
      description:    "",
      content:        "",
      price:          0,
      compareAtPrice: null,
      featuredProduct: false,
      featuredImage:  "",
      gallery:        [],
      categoryId:     "",
      stock:          0,
      published:      false,
      faqs:           [],
      ...initialData,
    },
  })

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: "faqs",
  })

  const name           = watch("name")
  const featuredImage  = watch("featuredImage")
  const featuredProduct = watch("featuredProduct")
  const published      = watch("published")

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
    const url    = mode === "edit" && initialData?.slug ? `/api/products/${initialData.slug}` : "/api/products"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

      {/* ── Basic info ───────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
          Basic Information
        </h3>
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
          <Label>Short Description</Label>
          <RichTextEditor
            value={watch("description") ?? ""}
            onChange={html => setValue("description", html)}
            placeholder="Brief product description"
          />
        </div>
        <div className="space-y-2">
          <Label>Full Content</Label>
          <RichTextEditor
            value={watch("content") ?? ""}
            onChange={html => setValue("content", html)}
            placeholder="Detailed product content"
          />
        </div>
      </section>

      {/* ── Pricing + inventory ──────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
          Pricing & Inventory
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" step="0.01" {...register("price")} placeholder="0.00" />
            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Compare At (₹)</Label>
            <Input id="compareAtPrice" type="number" step="0.01" {...register("compareAtPrice")} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" {...register("stock")} placeholder="0" />
            {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={v => setValue("categoryId", v)} defaultValue={initialData?.categoryId ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          <div className="flex items-center gap-3">
            <Switch id="published" checked={published} onCheckedChange={v => setValue("published", v)} />
            <Label htmlFor="published">Published</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="featured" checked={featuredProduct} onCheckedChange={v => setValue("featuredProduct", v)} />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </div>
      </section>

      {/* ── Media ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
          Media
        </h3>
        <div className="space-y-2">
          <Label>Featured Image</Label>
          <ImageUpload
            value={featuredImage}
            onChange={url => setValue("featuredImage", url)}
            onClear={() => setValue("featuredImage", "")}
          />
          {errors.featuredImage && <p className="text-sm text-destructive">{errors.featuredImage.message}</p>}
        </div>

        <div className="space-y-3">
          <Label>Gallery Media</Label>
          <div className="flex flex-wrap gap-3">
            {galleryUrls.map((url, idx) => {
              const isVid = /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url) || url.includes('/video/')
              return (
                <div key={idx} className="relative">
                  {isVid ? (
                    <video src={url} className="w-20 h-20 object-cover rounded-lg border" muted playsInline />
                  ) : (
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
          <ImageUpload onChange={addGalleryImage} label="Add Gallery Media" />
        </div>
      </section>

      {/* ── Product FAQs ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Product FAQs
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendFaq({ question: "", answer: "" })}
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            Add FAQ
          </Button>
        </div>

        {faqFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No FAQs yet. Click "Add FAQ" to create product-specific frequently asked questions.
          </p>
        )}

        <div className="space-y-4">
          {faqFields.map((field, index) => (
            <div
              key={field.id}
              className="border rounded-lg p-4 space-y-3 relative bg-muted/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  FAQ #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label={`Remove FAQ ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`faqs.${index}.question`}>Question</Label>
                <Input
                  id={`faqs.${index}.question`}
                  {...register(`faqs.${index}.question`)}
                  placeholder="e.g. What brewing methods work best?"
                />
                {errors.faqs?.[index]?.question && (
                  <p className="text-sm text-destructive">{errors.faqs[index]?.question?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`faqs.${index}.answer`}>Answer</Label>
                <Textarea
                  id={`faqs.${index}.answer`}
                  {...register(`faqs.${index}.answer`)}
                  placeholder="Provide a helpful, detailed answer..."
                  rows={3}
                  className="resize-none"
                />
                {errors.faqs?.[index]?.answer && (
                  <p className="text-sm text-destructive">{errors.faqs[index]?.answer?.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Submit ───────────────────────────────────────────── */}
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3 pt-2">
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
