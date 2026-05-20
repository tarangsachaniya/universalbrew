"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import type { StaticPageKey } from "@prisma/client"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
})
type FormInput = z.infer<typeof schema>

type StaticPageFormProps = {
  pageKey: StaticPageKey
  initialData: { title: string; content?: string | null }
}

export function StaticPageForm({ pageKey, initialData }: StaticPageFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData.title,
      content: initialData.content ?? "",
    },
  })

  const onSubmit = async (data: FormInput) => {
    setServerError(null)
    setSuccess(false)
    const res = await fetch(`/api/static-pages/${pageKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json()
      setServerError(body.error ?? "Something went wrong")
      return
    }
    setSuccess(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Label htmlFor="title">Page Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor
          value={watch("content") ?? ""}
          onChange={(html) => setValue("content", html)}
          placeholder="Write page content…"
          enableImages
        />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      {success && <p className="text-sm text-green-600">Page saved successfully!</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save Page"}
      </Button>
    </form>
  )
}
