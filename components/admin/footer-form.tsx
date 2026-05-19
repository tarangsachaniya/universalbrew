"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { footerSchema, type FooterInput } from "@/lib/validations/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FooterFormProps = {
  initialData?: FooterInput & { id?: string }
}

export function FooterForm({ initialData }: FooterFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FooterInput>({
    resolver: zodResolver(footerSchema),
    defaultValues: initialData ?? {
      companyName: "Khyati & Sons Enterprise",
      description: "",
      address: "",
      phone: "",
      email: "",
      socialLinks: {},
    },
  })

  const onSubmit = async (data: FooterInput) => {
    setServerError(null)
    setSuccess(false)
    const res = await fetch("/api/footer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id: initialData?.id }),
    })

    if (!res.ok) {
      const body = await res.json()
      setServerError(body.error ?? "Something went wrong")
      return
    }
    setSuccess(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" {...register("companyName")} />
        {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <fieldset className="space-y-3 border rounded-lg p-4">
        <legend className="text-sm font-medium px-1">Social Links</legend>
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook URL</Label>
          <Input id="facebook" {...register("socialLinks.facebook")} placeholder="https://facebook.com/..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram URL</Label>
          <Input id="instagram" {...register("socialLinks.instagram")} placeholder="https://instagram.com/..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input id="linkedin" {...register("socialLinks.linkedin")} placeholder="https://linkedin.com/..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X URL</Label>
          <Input id="twitter" {...register("socialLinks.twitter")} placeholder="https://twitter.com/..." />
        </div>
      </fieldset>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      {success && <p className="text-sm text-green-600">Footer updated successfully!</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save Footer"}
      </Button>
    </form>
  )
}