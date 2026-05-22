import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendPaymentFailedEmail } from '@/lib/email'

const schema = z.object({
  orderId: z.string(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { user: { select: { email: true, name: true } } },
  })

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { paymentStatus: 'failed', status: 'CANCELLED' },
  })

  if (order.user?.email) {
    sendPaymentFailedEmail(order.user.email, order.id, Number(order.total)).catch(console.error)
  }

  return NextResponse.json({ success: true })
}
