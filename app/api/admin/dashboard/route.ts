import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [productCount, categoryCount, orderCount, recentOrders, revenue] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.order.aggregate({ _sum: { total: true } }),
    ])

    return NextResponse.json({
      productCount,
      categoryCount,
      orderCount,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: o.total.toNumber(),
      })),
      totalRevenue: revenue._sum.total?.toNumber() ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}