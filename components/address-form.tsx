"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, Briefcase, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const addressSchema = z.object({
  type: z.enum(["HOME", "OFFICE", "OTHER"]).default("HOME"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  isDefault: z.boolean().default(false),
})

export type AddressFormInput = z.infer<typeof addressSchema>

type AddressFormProps = {
  initialData?: Partial<AddressFormInput>
  onSubmit: (data: AddressFormInput) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

const ADDRESS_TYPES = [
  { value: "HOME", label: "Home", icon: Home },
  { value: "OFFICE", label: "Office", icon: Briefcase },
  { value: "OTHER", label: "Other", icon: MapPin },
] as const

export function AddressForm({ initialData, onSubmit, onCancel, submitLabel = "Save Address" }: AddressFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { type: "HOME", isDefault: false, ...initialData },
  })

  const selectedType = watch("type")
  const isDefault = watch("isDefault")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Address type */}
      <div className="space-y-2">
        <Label>Address Type</Label>
        <div className="flex gap-2">
          {ADDRESS_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("type", value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                selectedType === value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-input text-muted-foreground hover:border-primary/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Recipient name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="10-digit mobile" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="line1">Address Line 1</Label>
        <Input id="line1" placeholder="House no., street, area" {...register("line1")} />
        {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="line2">Address Line 2 <span className="text-muted-foreground">(optional)</span></Label>
        <Input id="line2" placeholder="Landmark, floor, etc." {...register("line2")} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" placeholder="6 digits" maxLength={6} {...register("pincode")} />
          {errors.pincode && <p className="text-xs text-destructive">{errors.pincode.message}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setValue("isDefault", e.target.checked)}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <span className="text-sm">Set as default address</span>
      </label>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  )
}
