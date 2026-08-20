"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

/**
 * Cart API errors are a plain string for our own messages ("Insufficient stock for X"),
 * but a zod `flatten()` *object* on 400 validation failures. Passing that object into
 * `new Error(...)` renders "[object Object]" to the user, so anything non-string falls
 * back to a readable message instead.
 */
function apiErrorMessage(body: unknown, fallback: string): string {
  const error = (body as { error?: unknown } | null | undefined)?.error
  return typeof error === "string" && error.trim() !== "" ? error : fallback
}

type CartProduct = {
  id: string
  name: string
  slug: string
  price: number
  featuredImage: string | null
  stock: number
}

// Prisma Decimal fields arrive over the wire as numeric strings (Decimal.toJSON),
// same as product.price already does — hence `number | string` plus Number(...) at read sites.
type CartVariant = {
  id: string
  weight: string
  price: number | string
  compareAtPrice: number | string | null
  sku: string | null
} | null

export type CartItemType = {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  product: CartProduct
  variant: CartVariant
}

type CartContextValue = {
  items: CartItemType[]
  count: number
  total: number
  loading: boolean
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQty: (id: string, quantity: number) => Promise<void>
  clearCart: () => void
  refetch: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [items, setItems] = useState<CartItemType[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (status !== "authenticated") { setItems([]); return }
    setLoading(true)
    try {
      const res = await fetch("/api/cart")
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = async (productId: string, quantity = 1, variantId?: string) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity, variantId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(apiErrorMessage(body, "Failed to add item"))
    }
    const newItem: CartItemType = await res.json()
    setItems((prev) => {
      // Match on product AND variant — two variants of the same product are two cart
      // lines. The server always sends `variantId: null` (never undefined) so normalise
      // both sides before comparing.
      const idx = prev.findIndex(
        (i) => i.productId === productId && (i.variantId ?? null) === (variantId ?? null)
      )
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = newItem
        return updated
      }
      return [...prev, newItem]
    })
  }

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/cart/${id}`, { method: "DELETE" })
  }

  const updateQty = async (id: string, quantity: number) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i))
    const res = await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    })
    if (!res.ok) {
      // The server checks stock across *every* cart line for a product, while the
      // cart sheet's `+` button only knows about one line — so a rejection here is
      // reachable with the button still enabled. Say why before snapping back.
      const body = await res.json().catch(() => null)
      toast.error(apiErrorMessage(body, "Couldn't update quantity"))
      await fetchCart()
    }
  }

  const clearCart = () => setItems([])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + Number(i.variant?.price ?? i.product.price) * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, total, loading, addItem, removeItem, updateQty, clearCart, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
