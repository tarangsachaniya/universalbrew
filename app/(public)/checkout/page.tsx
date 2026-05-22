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
import { Home, Briefcase, MapPin, Plus, Check, Loader2, Tag, X } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  const [couponCode, setCouponCode] = useState("")
  const [validating, setValidating] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; discount: number; type: string; message: string
  } | null>(null)

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidating(true)
    setCouponError(null)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), orderTotal: total }),
      })
      const data = await res.json()
      if (data.valid) {
        setAppliedCoupon({ code: couponCode.trim().toUpperCase(), ...data })
        setCouponError(null)
      } else {
        setCouponError(data.error ?? "Invalid coupon code")
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.")
    } finally {
      setValidating(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error("Please select a delivery address"); return }
    if (items.length === 0) { toast.error("Your cart is empty"); return }
    setPlacing(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          note,
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        }),
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-amber-100/60 dark:border-amber-900/20 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/10 dark:to-transparent pt-12 pb-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-serif font-bold text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-1">Review your order and confirm delivery details</p>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-5xl py-8">

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left column */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Address
              </h2>

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
                        "w-full text-left rounded-xl border p-4 transition-all",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "mt-0.5 p-2 rounded-lg shrink-0",
                            selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-foreground">{addr.name}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{addr.type}</Badge>
                              {addr.isDefault && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p>
                          </div>
                        </div>
                        {selected && (
                          <div className="shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {showAddForm ? (
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30">
                  <h3 className="text-sm font-semibold mb-4 text-foreground">New Address</h3>
                  <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddForm(false)} />
                </div>
              ) : (
                <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4" /> Add New Address
                </Button>
              )}
            </div>

            {/* Order Note */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">Order Note</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special instructions for your order…"
                rows={2}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Coupon */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Coupon Code
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center gap-3 rounded-xl border border-green-500/40 bg-green-50 dark:bg-green-950/20 px-4 py-3">
                  <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-green-700 dark:text-green-400 flex-1">{appliedCoupon.message}</span>
                  <button
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setCouponCode("") }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null) }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className={`uppercase rounded-xl ${couponError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={validating || !couponCode.trim()}
                      className="rounded-xl shrink-0"
                    >
                      {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-destructive flex items-center gap-1.5 px-1">
                      <X className="h-3 w-3 shrink-0" />{couponError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 lg:sticky lg:top-6">
            <h2 className="text-base font-semibold text-foreground">Order Summary</h2>

            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">Your cart is empty.</p>
                <Link href="/products" className="text-xs text-primary hover:underline">Browse products →</Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item) => {
                    const img = item.product.featuredImage ? getWebPUrl(item.product.featuredImage, 60) : null
                    return (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                          {img && <Image src={img} alt={item.product.name} width={48} height={48} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground shrink-0">₹{(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>
                        {appliedCoupon.type === "FREE_DELIVERY"
                          ? "Free delivery"
                          : `−₹${appliedCoupon.discount.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {(!appliedCoupon || appliedCoupon.type !== "FREE_DELIVERY") && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Shipping</span>
                      <span>Calculated at delivery</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">₹{(total - (appliedCoupon?.discount ?? 0)).toFixed(2)}</span>
                </div>

                <Button
                  className="w-full rounded-xl"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={placing || items.length === 0}
                >
                  {placing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Placing Order…</>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
