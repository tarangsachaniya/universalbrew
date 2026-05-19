import { prisma } from '@/lib/prisma'
import { Package, Tag, ShoppingBag, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getDashboardStats() {
  const [productCount, categoryCount, orderCount, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ])
  return {
    productCount,
    categoryCount,
    orderCount,
    totalRevenue: revenue._sum.total?.toNumber() ?? 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    { title: 'Products', value: stats.productCount, icon: Package, color: 'text-blue-500' },
    { title: 'Categories', value: stats.categoryCount, icon: Tag, color: 'text-green-500' },
    { title: 'Orders', value: stats.orderCount, icon: ShoppingBag, color: 'text-orange-500' },
    { title: 'Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Universal Brew admin panel</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[
            { href: '/admin/products/new', label: '+ New Product' },
            { href: '/admin/categories/new', label: '+ New Category' },
            { href: '/admin/heroes', label: 'Manage Hero' },
            { href: '/admin/footer', label: 'Edit Footer' },
            { href: '/', label: '← View Site' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-4 py-2 text-sm border rounded-md hover:bg-secondary transition-colors"
            >
              {label}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}