import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendOrderCompletedEmail } from '@/lib/email'

const statusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const order = await db.order.update({ where: { id }, data: { status: parsed.data.status } })

  if (parsed.data.status === 'DELIVERED') {
    const fullOrder = await db.order.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } }, address: true },
    })
    if (fullOrder?.user?.email) {
      sendOrderCompletedEmail(fullOrder.user.email, {
        id: fullOrder.id,
        total: Number(fullOrder.total),
        discount: fullOrder.discount != null ? Number(fullOrder.discount) : null,
        couponCode: fullOrder.couponCode,
        items: fullOrder.items,
        address: fullOrder.address,
        user: fullOrder.user,
      }).catch(console.error)
    }
  }

  return NextResponse.json(order)
}
