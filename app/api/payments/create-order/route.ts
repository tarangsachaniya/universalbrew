import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import Razorpay from 'razorpay'
import type { Prisma } from '@prisma/client'

const schema = z.object({
  addressId: z.string().min(1),
  note: z.string().optional(),
  couponCode: z.string().optional(),
})

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: { select: { id: true; name: true; price: true; stock: true; featuredImage: true; slug: true } } }
}>

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const address = await prisma.address.findUnique({ where: { id: parsed.data.addressId } })
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  const cartItems: CartItemWithProduct[] = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { select: { id: true, name: true, price: true, stock: true, featuredImage: true, slug: true } } },
  })
  if (cartItems.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      return NextResponse.json({ error: `Insufficient stock for ${item.product.name}` }, { status: 400 })
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  let discount = 0
  let appliedCouponCode: string | null = null

  if (parsed.data.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data.couponCode.toUpperCase() } })
    const isValid =
      coupon &&
      coupon.active &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrder || subtotal >= Number(coupon.minOrder))

    if (isValid && coupon) {
      if (coupon.type === 'PERCENT') discount = (subtotal * Number(coupon.value)) / 100
      else if (coupon.type === 'FIXED') discount = Math.min(Number(coupon.value), subtotal)
      appliedCouponCode = coupon.code
    }
  }

  const finalTotal = parseFloat((subtotal - discount).toFixed(2))

  const itemsSnapshot = cartItems.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    price: Number(item.product.price),
    quantity: item.quantity,
    image: item.product.featuredImage,
    slug: item.product.slug,
  }))

  // Create pending DB order first
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      addressId: parsed.data.addressId,
      items: itemsSnapshot,
      total: finalTotal,
      note: parsed.data.note,
      couponCode: appliedCouponCode,
      discount: discount > 0 ? discount : null,
      paymentStatus: 'pending',
    },
  })

  // Create Razorpay order
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(finalTotal * 100),
    currency: 'INR',
    receipt: order.id,
  })

  // Store razorpay order id on DB order
  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzpOrder.id },
  })

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}
