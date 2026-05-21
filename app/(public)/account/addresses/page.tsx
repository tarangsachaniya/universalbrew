"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AddressForm, type AddressFormInput } from "@/components/address-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Home, Briefcase, MapPin, Plus, Pencil, Trash2, Star } from "lucide-react"
import { toast } from "sonner"

type Address = {
  id: string
  type: "HOME" | "OFFICE" | "OTHER"
  name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

const TYPE_ICON = { HOME: Home, OFFICE: Briefcase, OTHER: MapPin }
const TYPE_COLOR = {
  HOME:   "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  OFFICE: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  OTHER:  "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
}
const TYPE_LABEL_COLOR = {
  HOME:   "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-800",
  OFFICE: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-800",
  OTHER:  "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-800",
}

export default function AddressesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Address | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/")
  }, [status, router])

  const fetchAddresses = () =>
    fetch("/api/addresses").then((r) => r.json()).then(setAddresses).catch(() => {})

  useEffect(() => { if (status === "authenticated") fetchAddresses() }, [status])

  const handleAdd = async (data: AddressFormInput) => {
    const res = await fetch("/api/addresses", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Failed to save address"); return }
    toast.success("Address added")
    setAddOpen(false)
    fetchAddresses()
  }

  const handleEdit = async (data: AddressFormInput) => {
    if (!editTarget) return
    const res = await fetch(`/api/addresses/${editTarget.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Failed to update address"); return }
    toast.success("Address updated")
    setEditTarget(null)
    fetchAddresses()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return
    await fetch(`/api/addresses/${id}`, { method: "DELETE" })
    toast.success("Address removed")
    fetchAddresses()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-amber-100/60 dark:border-amber-900/20 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/10 dark:to-transparent pt-12 pb-8">
        <div className="container mx-auto px-4 max-w-2xl flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">My Addresses</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your saved delivery locations</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-2xl py-8">

        {addresses.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-semibold text-foreground mb-1">No addresses saved</p>
            <p className="text-sm text-muted-foreground mb-4">Add a delivery address to speed up checkout.</p>
            <Button onClick={() => setAddOpen(true)} variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const Icon = TYPE_ICON[addr.type]
              return (
                <div
                  key={addr.id}
                  className={`rounded-2xl border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md ${addr.isDefault ? 'border-primary/30' : 'border-border/60'}`}
                >
                  <div className="flex items-start gap-4 p-5">
                    {/* Type icon */}
                    <div className={`p-2.5 rounded-xl shrink-0 ${TYPE_COLOR[addr.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-semibold text-foreground">{addr.name}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${TYPE_LABEL_COLOR[addr.type]}`}>
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                            <Star className="h-2.5 w-2.5 fill-current" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditTarget(addr)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(addr.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Address</DialogTitle></DialogHeader>
            <AddressForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Edit dialog */}
        <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Address</DialogTitle></DialogHeader>
            {editTarget && (
              <AddressForm
                initialData={{ ...editTarget, line2: editTarget.line2 ?? undefined } as AddressFormInput}
                onSubmit={handleEdit}
                onCancel={() => setEditTarget(null)}
                submitLabel="Update Address"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
