"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"
import { format } from "date-fns"

type OrderItem = { name: string; quantity: number; price: number; image?: string }
type Order = {
  id: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  address?: { city: string; state: string } | null
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
}

export default function OrdersPage() {
  const { status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [status])

  return (
    <main className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl font-serif font-bold mb-8">My Orders</h1>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemsArr = Array.isArray(order.items) ? order.items as OrderItem[] : []
              return (
                <div key={order.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}</p>
                      {order.address && (
                        <p className="text-xs text-muted-foreground">{order.address.city}, {order.address.state}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-muted text-muted-foreground"}`}>
                        {order.status}
                      </span>
                      <p className="text-sm font-bold mt-1">₹{Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-1">
                    {itemsArr.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
