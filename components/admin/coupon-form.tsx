"use client"

import { useState } from "react"
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
import { toast } from "sonner"

type CouponFormProps = {
  onSuccess: () => void
  onCancel: () => void
  initialData?: {
    id: string
    code: string
    type: string
    value: number
    label: string | null
    minOrder: number | null
    maxUses: number | null
    active: boolean
    expiresAt: string | null
  }
}

export function CouponForm({ onSuccess, onCancel, initialData }: CouponFormProps) {
  const isEdit = !!initialData
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState(initialData?.code ?? "")
  const [type, setType] = useState(initialData?.type ?? "PERCENT")
  const [value, setValue] = useState(String(initialData?.value ?? ""))
  const [label, setLabel] = useState(initialData?.label ?? "")
  const [minOrder, setMinOrder] = useState(String(initialData?.minOrder ?? ""))
  const [maxUses, setMaxUses] = useState(String(initialData?.maxUses ?? ""))
  const [active, setActive] = useState(initialData?.active ?? true)
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expiresAt ? initialData.expiresAt.slice(0, 10) : ""
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value) || 0,
        label: label || null,
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        active,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      }

      const url = isEdit ? `/api/admin/coupons/${initialData.id}` : "/api/admin/coupons"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save coupon")
        return
      }

      toast.success(isEdit ? "Coupon updated" : "Coupon created")
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Code *</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SUMMER10"
            pattern="[A-Z0-9_-]+"
            required
            disabled={isEdit}
            className="uppercase"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type *</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENT">Percentage (%)</SelectItem>
              <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
              <SelectItem value="FREE_DELIVERY">Free Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">
            Value {type === "PERCENT" ? "(%) *" : type === "FIXED" ? "(₹) *" : "(ignored for free delivery)"}
          </Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "PERCENT" ? "10" : "50"}
            disabled={type === "FREE_DELIVERY"}
            required={type !== "FREE_DELIVERY"}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Min Order Amount (₹)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            placeholder="500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Max Uses</Label>
          <Input
            type="number"
            min="1"
            step="1"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Unlimited"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Expires On</Label>
          <Input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Display Label (shown in ticker — optional)</Label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="10% off on orders above ₹500"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch id="active" checked={active} onCheckedChange={setActive} />
        <Label htmlFor="active" className="text-sm">Active</Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting} size="sm">
          {submitting ? "Saving…" : isEdit ? "Update Coupon" : "Create Coupon"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
