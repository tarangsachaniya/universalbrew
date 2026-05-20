"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AddressForm, type AddressFormInput } from "@/components/address-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  HOME: "bg-blue-50 text-blue-600",
  OFFICE: "bg-amber-50 text-amber-600",
  OTHER: "bg-purple-50 text-purple-600",
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
    <main className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold">My Addresses</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your delivery addresses</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No addresses saved yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const Icon = TYPE_ICON[addr.type]
              return (
                <div key={addr.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-md ${TYPE_COLOR[addr.type]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{addr.name}</span>
                          <Badge variant="outline" className="text-[10px]">{addr.type}</Badge>
                          {addr.isDefault && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{addr.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => setEditTarget(addr)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(addr.id)}>
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
                initialData={editTarget}
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
