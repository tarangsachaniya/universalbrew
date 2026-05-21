import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const validateSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().min(0),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ valid: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = validateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 })

  const { code, orderTotal } = parsed.data

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, error: 'Invalid coupon code' })
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: 'Coupon has expired' })
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' })
  }

  const minOrder = coupon.minOrder ? Number(coupon.minOrder) : 0
  if (orderTotal < minOrder) {
    return NextResponse.json({
      valid: false,
      error: `Minimum order of ₹${minOrder.toFixed(2)} required`,
    })
  }

  let discount = 0
  let message = ''

  if (coupon.type === 'PERCENT') {
    discount = (orderTotal * Number(coupon.value)) / 100
    message = `${Number(coupon.value)}% off applied`
  } else if (coupon.type === 'FIXED') {
    discount = Math.min(Number(coupon.value), orderTotal)
    message = `₹${Number(coupon.value).toFixed(2)} off applied`
  } else if (coupon.type === 'FREE_DELIVERY') {
    discount = 0
    message = 'Free delivery applied'
  }

  return NextResponse.json({
    valid: true,
    discount: parseFloat(discount.toFixed(2)),
    type: coupon.type,
    message,
  })
}
