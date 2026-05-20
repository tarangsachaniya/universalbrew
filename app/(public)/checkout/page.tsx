"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { AddressForm, type AddressFormInput } from "@/components/address-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Home, Briefcase, MapPin, Plus, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getWebPUrl } from "@/lib/cloudinary-url"
import { cn } from "@/lib/utils"

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

export default function CheckoutPage() {
  const { status } = useSession()
  const router = useRouter()
  const { items, total, clearCart, loading: cartLoading } = useCart()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [note, setNote] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data: Address[]) => {
        setAddresses(data)
        const def = data.find((a) => a.isDefault)
        if (def) setSelectedAddressId(def.id)
      })
      .catch(() => {})
  }, [status])

  const handleAddAddress = async (data: AddressFormInput) => {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Failed to save address"); return }
    const newAddr: Address = await res.json()
    setAddresses((prev) => {
      const updated = data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev
      return [...updated, newAddr]
    })
    setSelectedAddressId(newAddr.id)
    setShowAddForm(false)
    toast.success("Address saved")
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error("Please select a delivery address"); return }
    if (items.length === 0) { toast.error("Your cart is empty"); return }
    setPlacing(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddressId, note }),
      })
      if (!res.ok) {
        const body = await res.json()
        toast.error(body.error ?? "Failed to place order")
        return
      }
      clearCart()
      toast.success("Order placed successfully!")
      router.push("/account/orders")
    } finally {
      setPlacing(false)
    }
  }

  if (status === "loading" || cartLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <main className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-serif font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: Address */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>

              <div className="space-y-3">
                {addresses.map((addr) => {
                  const Icon = TYPE_ICON[addr.type]
                  const selected = selectedAddressId === addr.id
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={cn(
                        "w-full text-left rounded-lg border p-4 transition-colors",
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={cn("mt-0.5 p-1.5 rounded-md", selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{addr.name}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{addr.type}</Badge>
                              {addr.isDefault && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                            <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          </div>
                        </div>
                        {selected && <Check className="h-5 w-5 text-primary shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {showAddForm ? (
                <div className="mt-4 rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-4">New Address</h3>
                  <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddForm(false)} />
                </div>
              ) : (
                <Button variant="outline" className="mt-3 w-full" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Address
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Note <span className="text-muted-foreground">(optional)</span></label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special instructions…"
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your cart is empty. <Link href="/products" className="text-primary underline">Shop now</Link>
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const img = item.product.featuredImage ? getWebPUrl(item.product.featuredImage, 60) : null
                      return (
                        <div key={item.id} className="flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                            {img && <Image src={img} alt={item.product.name} width={48} height={48} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold">₹{(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at delivery</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={placing || items.length === 0}
                  >
                    {placing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Placing Order…</> : "Place Order"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
