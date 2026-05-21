"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Package, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"

type OrderItem = { name: string; quantity: number; price: number }
type Order = {
  id: string
  items: OrderItem[]
  total: number
  discount?: number | null
  couponCode?: string | null
  status: string
  createdAt: string
  address?: { city: string; state: string } | null
}

const STATUS_CONFIG: Record<string, { color: string; dot: string; label: string }> = {
  PENDING:   { color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800", dot: "bg-yellow-400", label: "Pending" },
  CONFIRMED: { color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800", dot: "bg-blue-400", label: "Confirmed" },
  SHIPPED:   { color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800", dot: "bg-indigo-400", label: "Shipped" },
  DELIVERED: { color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800", dot: "bg-green-500", label: "Delivered" },
  CANCELLED: { color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800", dot: "bg-red-400", label: "Cancelled" },
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const itemsArr = Array.isArray(order.items) ? order.items as OrderItem[] : []
  const subtotal = Number(order.total) + Number(order.discount ?? 0)
  const cfg = STATUS_CONFIG[order.status] ?? { color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground", label: order.status }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-muted shrink-0 mt-0.5">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs font-mono font-semibold text-foreground tracking-wider">
              #{order.id.slice(-8).toUpperCase()}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
            </div>
            {order.address && (
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {order.address.city}, {order.address.state}
              </div>
            )}
          </div>
        </div>

        <div className="text-right shrink-0 space-y-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          {order.discount && Number(order.discount) > 0 ? (
            <div>
              <p className="text-xs text-muted-foreground line-through">₹{subtotal.toFixed(2)}</p>
              <p className="text-base font-bold text-green-600 dark:text-green-400">₹{Number(order.total).toFixed(2)}</p>
              {order.couponCode && (
                <p className="text-[10px] text-muted-foreground">{order.couponCode}</p>
              )}
            </div>
          ) : (
            <p className="text-base font-bold text-foreground">₹{Number(order.total).toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 bg-muted/50 border-t border-border/40 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <span>{itemsArr.length} item{itemsArr.length !== 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {/* Items breakdown */}
      {expanded && (
        <div className="px-5 py-4 space-y-2.5 border-t border-border/40">
          {itemsArr.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name}
                <span className="text-muted-foreground/60"> × {item.quantity}</span>
              </span>
              <span className="font-semibold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {order.discount && Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400 pt-1 border-t border-border/40">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span>−₹{Number(order.discount).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
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
    <main className="min-h-screen bg-background">
      <div className="border-b border-amber-100/60 dark:border-amber-900/20 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/10 dark:to-transparent pt-12 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-serif font-bold text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and review your purchase history</p>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-2xl py-8">

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-card p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-semibold text-foreground mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-4">When you place an order, it will appear here.</p>
            <a href="/products" className="text-xs text-primary hover:underline">Browse products →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
