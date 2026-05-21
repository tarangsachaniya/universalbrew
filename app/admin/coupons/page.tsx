"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CouponForm } from "@/components/admin/coupon-form"
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

type Coupon = {
  id: string
  code: string
  type: "PERCENT" | "FIXED" | "FREE_DELIVERY"
  value: number
  label: string | null
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  active: boolean
  expiresAt: string | null
  createdAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/coupons")
      const data = await res.json()
      setCoupons(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Failed to delete"); return }
      toast.success("Coupon deleted")
      fetchCoupons()
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSuccess = () => {
    setDialogOpen(false)
    setEditing(null)
    fetchCoupons()
  }

  const openCreate = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (c: Coupon) => { setEditing(c); setDialogOpen(true) }

  const typeLabel = (type: string) => ({ PERCENT: "Percent", FIXED: "Fixed", FREE_DELIVERY: "Free Delivery" }[type] ?? type)
  const valueDisplay = (c: Coupon) => {
    if (c.type === "PERCENT") return `${Number(c.value)}%`
    if (c.type === "FIXED") return `₹${Number(c.value).toFixed(0)}`
    return "—"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage discount codes shown to customers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCoupons} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> New Coupon
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No coupons yet.</p>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Create First Coupon</Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left">Min Order</th>
                <th className="px-4 py-3 text-left">Uses</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold tracking-wider">{c.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{typeLabel(c.type)}</td>
                  <td className="px-4 py-3 font-medium">{valueDisplay(c)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.minOrder ? `₹${Number(c.minOrder).toFixed(0)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.active ? "default" : "secondary"} className="text-xs">
                      {c.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <CouponForm
            onSuccess={handleFormSuccess}
            onCancel={() => { setDialogOpen(false); setEditing(null) }}
            initialData={editing ? {
              id: editing.id,
              code: editing.code,
              type: editing.type,
              value: Number(editing.value),
              label: editing.label,
              minOrder: editing.minOrder ? Number(editing.minOrder) : null,
              maxUses: editing.maxUses,
              active: editing.active,
              expiresAt: editing.expiresAt,
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
