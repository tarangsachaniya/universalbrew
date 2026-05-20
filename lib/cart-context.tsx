"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useSession } from "next-auth/react"

type CartProduct = {
  id: string
  name: string
  slug: string
  price: number
  featuredImage: string | null
  stock: number
}

export type CartItemType = {
  id: string
  productId: string
  quantity: number
  product: CartProduct
}

type CartContextValue = {
  items: CartItemType[]
  count: number
  total: number
  loading: boolean
  addItem: (productId: string, quantity?: number) => Promise<void>
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

  const addItem = async (productId: string, quantity = 1) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error ?? "Failed to add item")
    }
    const newItem: CartItemType = await res.json()
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId)
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
    if (!res.ok) await fetchCart()
  }

  const clearCart = () => setItems([])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)

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
