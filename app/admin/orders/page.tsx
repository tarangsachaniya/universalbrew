"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"

type OrderItem = { name: string; quantity: number; price: number }
type Order = {
  id: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
  user: { name: string | null; email: string }
  address: { line1: string; city: string; state: string; pincode: string; name: string; phone: string } | null
}

type UserOption = { id: string; name: string | null; email: string }

type CartRow = {
  id: string
  quantity: number
  createdAt: string
  user: { name: string | null; email: string }
  product: { name: string; price: number; slug: string }
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  SHIPPED:   "bg-indigo-100 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]

export default function AdminOrdersPage() {
  // Users for filter dropdowns
  const [users, setUsers] = useState<UserOption[]>([])

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [orderTotal, setOrderTotal] = useState(0)
  const [orderPage, setOrderPage] = useState(1)
  const [orderLoading, setOrderLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [userFilter, setUserFilter] = useState("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Cart state
  const [carts, setCarts] = useState<CartRow[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [cartPage, setCartPage] = useState(1)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartSearch, setCartSearch] = useState("")
  const [cartUserFilter, setCartUserFilter] = useState("ALL")
  const [cartDateFrom, setCartDateFrom] = useState("")
  const [cartDateTo, setCartDateTo] = useState("")

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUsers(data))
      .catch(() => {})
  }, [])

  const fetchOrders = useCallback(async (page = 1) => {
    setOrderLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (search) params.set("search", search)
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    if (userFilter !== "ALL") params.set("userId", userFilter)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    try {
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      setOrders(data.items ?? [])
      setOrderTotal(data.total ?? 0)
      setOrderPage(page)
    } finally {
      setOrderLoading(false)
    }
  }, [search, statusFilter, userFilter, dateFrom, dateTo])

  const fetchCarts = useCallback(async (page = 1) => {
    setCartLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "50" })
    if (cartSearch) params.set("search", cartSearch)
    if (cartUserFilter !== "ALL") params.set("userId", cartUserFilter)
    if (cartDateFrom) params.set("dateFrom", cartDateFrom)
    if (cartDateTo) params.set("dateTo", cartDateTo)
    try {
      const res = await fetch(`/api/admin/carts?${params}`)
      const data = await res.json()
      setCarts(data.items ?? [])
      setCartTotal(data.total ?? 0)
      setCartPage(page)
    } finally {
      setCartLoading(false)
    }
  }, [cartSearch, cartUserFilter, cartDateFrom, cartDateTo])

  useEffect(() => { fetchOrders(1) }, [fetchOrders])
  useEffect(() => { fetchCarts(1) }, [fetchCarts])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) { toast.error("Failed to update status"); return }
    toast.success("Status updated")
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
  }

  const orderPages = Math.ceil(orderTotal / 20)
  const cartPages = Math.ceil(cartTotal / 50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage customer orders and view live carts</p>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders ({orderTotal})</TabsTrigger>
          <TabsTrigger value="carts">Live Carts ({cartTotal})</TabsTrigger>
        </TabsList>

        {/* ── Orders Tab ── */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user email or name…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchOrders(1)}
              />
            </div>

            <Select value={userFilter} onValueChange={(v) => setUserFilter(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name ? `${u.name} (${u.email})` : u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input type="date" className="w-36" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
            <Input type="date" className="w-36" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />

            <Button variant="outline" size="icon" onClick={() => fetchOrders(1)} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Items</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Address</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLoading ? (
                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No orders found</td></tr>
                  ) : orders.map((order) => {
                    const items = Array.isArray(order.items) ? order.items as OrderItem[] : []
                    return (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.user.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(order.createdAt), "dd MMM yyyy")}
                          <br />
                          <span className="text-xs">{format(new Date(order.createdAt), "hh:mm a")}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {items.slice(0, 2).map((item, i) => (
                              <p key={i} className="text-xs text-muted-foreground">{item.name} ×{item.quantity}</p>
                            ))}
                            {items.length > 2 && <p className="text-xs text-muted-foreground">+{items.length - 2} more</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ₹{Number(order.total).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {order.address ? (
                            <div className="text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">{order.address.name}</p>
                              <p>{order.address.city}, {order.address.state}</p>
                              <p>{order.address.pincode}</p>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                            <SelectTrigger className={`h-7 text-xs w-32 border ${STATUS_COLOR[order.status] ?? ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {orderPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {orderPage} of {orderPages} ({orderTotal} orders)</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={orderPage <= 1} onClick={() => fetchOrders(orderPage - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={orderPage >= orderPages} onClick={() => fetchOrders(orderPage + 1)}>Next</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Live Carts Tab ── */}
        <TabsContent value="carts" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user…"
                className="pl-8"
                value={cartSearch}
                onChange={(e) => setCartSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCarts(1)}
              />
            </div>
            <Select value={cartUserFilter} onValueChange={(v) => setCartUserFilter(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name ? `${u.name} (${u.email})` : u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" className="w-36" value={cartDateFrom} onChange={(e) => setCartDateFrom(e.target.value)} />
            <Input type="date" className="w-36" value={cartDateTo} onChange={(e) => setCartDateTo(e.target.value)} />
            <Button variant="outline" size="icon" onClick={() => fetchCarts(1)} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Value</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {cartLoading ? (
                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
                  ) : carts.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No active carts</td></tr>
                  ) : carts.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{row.user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{row.user.email}</p>
                      </td>
                      <td className="px-4 py-3">{row.product.name}</td>
                      <td className="px-4 py-3 text-right">{row.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ₹{(Number(row.product.price) * row.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {cartPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {cartPage} of {cartPages} ({cartTotal} items)</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={cartPage <= 1} onClick={() => fetchCarts(cartPage - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={cartPage >= cartPages} onClick={() => fetchCarts(cartPage + 1)}>Next</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
