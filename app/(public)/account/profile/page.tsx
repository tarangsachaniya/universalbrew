"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddressForm, type AddressFormInput } from "@/components/address-form"
import { Home, Briefcase, MapPin, Plus, Pencil, Trash2, Star, User, Mail, Calendar, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

type UserProfile = { id: string; name: string | null; email: string; createdAt: string }
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

export default function ProfilePage() {
  const { status, update: updateSession } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])

  // profile edit state
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [savingName, setSavingName] = useState(false)

  // password change state
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [savingPw, setSavingPw] = useState(false)

  // address state
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Address | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d); setNameInput(d.name ?? "") })
      .catch(() => {})
    fetchAddresses()
  }, [status])

  const fetchAddresses = () =>
    fetch("/api/addresses").then((r) => r.json()).then(setAddresses).catch(() => {})

  const handleSaveName = async () => {
    setSavingName(true)
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput }),
    })
    const data = await res.json()
    setSavingName(false)
    if (!res.ok) { toast.error(data?.error ?? "Failed to update name"); return }
    setProfile(data)
    setEditingName(false)
    await updateSession({ name: data.name })
    toast.success("Name updated")
  }

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return }
    setSavingPw(true)
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const data = await res.json()
    setSavingPw(false)
    if (!res.ok) { toast.error(data?.error ?? "Failed to change password"); return }
    toast.success("Password changed")
    setPwOpen(false)
    setCurrentPw(""); setNewPw(""); setConfirmPw("")
  }

  const handleAddAddress = async (data: AddressFormInput) => {
    const res = await fetch("/api/addresses", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Failed to save address"); return }
    toast.success("Address added")
    setAddOpen(false)
    fetchAddresses()
  }

  const handleEditAddress = async (data: AddressFormInput) => {
    if (!editTarget) return
    const res = await fetch(`/api/addresses/${editTarget.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Failed to update address"); return }
    toast.success("Address updated")
    setEditTarget(null)
    fetchAddresses()
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return
    await fetch(`/api/addresses/${id}`, { method: "DELETE" })
    toast.success("Address removed")
    fetchAddresses()
  }

  if (status === "loading" || !profile) {
    return (
      <main className="min-h-screen py-12 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 max-w-2xl space-y-10">

        {/* ── Profile info ── */}
        <section>
          <h1 className="text-2xl font-serif font-bold mb-6">My Profile</h1>
          <div className="rounded-lg border p-5 space-y-5">

            {/* Name */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-muted shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveName} disabled={savingName}>
                      {savingName ? "Saving…" : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameInput(profile.name ?? "") }}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile.name || <span className="text-muted-foreground italic">No name set</span>}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-muted shrink-0">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <span className="font-medium">{profile.email}</span>
              </div>
            </div>

            {/* Member since */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-muted shrink-0">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Member Since</p>
                <span className="font-medium">{format(new Date(profile.createdAt), "dd MMM yyyy")}</span>
              </div>
            </div>

            {/* Password */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-muted shrink-0">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Password</p>
                <button
                  onClick={() => setPwOpen(true)}
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Change password
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Addresses ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-serif font-bold">My Addresses</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your delivery addresses</p>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border rounded-lg">
              <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No addresses saved yet</p>
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
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAddress(addr.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Change password dialog */}
      <Dialog open={pwOpen} onOpenChange={(o) => { if (!o) { setPwOpen(false); setCurrentPw(""); setNewPw(""); setConfirmPw("") } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <Label className="text-xs">Current Password</Label>
              <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New Password</Label>
              <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Confirm New Password</Label>
              <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleChangePassword} disabled={savingPw || !currentPw || !newPw || !confirmPw}>
                {savingPw ? "Saving…" : "Change Password"}
              </Button>
              <Button variant="outline" onClick={() => setPwOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add address dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Address</DialogTitle></DialogHeader>
          <AddressForm onSubmit={handleAddAddress} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit address dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Address</DialogTitle></DialogHeader>
          {editTarget && (
            <AddressForm
              initialData={{ ...editTarget, line2: editTarget.line2 ?? undefined } as AddressFormInput}
              onSubmit={handleEditAddress}
              onCancel={() => setEditTarget(null)}
              submitLabel="Update Address"
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
