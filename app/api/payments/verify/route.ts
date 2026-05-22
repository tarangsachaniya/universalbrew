import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { sendOrderConfirmationEmail } from '@/lib/email'

const schema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  orderId: z.string(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = parsed.data

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expectedSignature !== razorpaySignature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
    },
  })

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Update order to CONFIRMED
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentId: razorpayPaymentId,
        razorpayOrderId,
        paymentStatus: 'paid',
      },
    })

    const items = Array.isArray(order.items) ? order.items as Array<{ productId: string; quantity: number }> : []

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    if (order.couponCode) {
      await tx.coupon.update({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      })
    }

    await tx.cartItem.deleteMany({ where: { userId: session.user.id } })
  })

  // Send confirmation email (non-blocking — don't fail if email errors)
  if (order.user?.email) {
    sendOrderConfirmationEmail(order.user.email, {
      id: order.id,
      total: Number(order.total),
      discount: order.discount != null ? Number(order.discount) : null,
      couponCode: order.couponCode,
      paymentId: razorpayPaymentId,
      items: order.items,
      address: order.address,
      user: order.user,
    }).catch(console.error)
  }

  return NextResponse.json({ success: true, orderId })
}
