import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const placeOrderSchema = z.object({
  addressId: z.string().min(1, 'Address is required'),
  note: z.string().optional(),
  couponCode: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { address: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: { select: { id: true; name: true; price: true; stock: true; featuredImage: true; slug: true } } }
}>

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = placeOrderSchema.safeParse(body)
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

  const subtotal = cartItems.reduce((sum: number, item: CartItemWithProduct) => sum + Number(item.product.price) * item.quantity, 0)

  // Validate coupon server-side
  let discount = 0
  let appliedCouponCode: string | null = null

  if (parsed.data.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: parsed.data.couponCode.toUpperCase() },
    })

    const isValid =
      coupon &&
      coupon.active &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrder || subtotal >= Number(coupon.minOrder))

    if (isValid && coupon) {
      if (coupon.type === 'PERCENT') {
        discount = (subtotal * Number(coupon.value)) / 100
      } else if (coupon.type === 'FIXED') {
        discount = Math.min(Number(coupon.value), subtotal)
      }
      appliedCouponCode = coupon.code
    }
  }

  const finalTotal = parseFloat((subtotal - discount).toFixed(2))

  const itemsSnapshot = cartItems.map((item: CartItemWithProduct) => ({
    productId: item.product.id,
    name: item.product.name,
    price: Number(item.product.price),
    quantity: item.quantity,
    image: item.product.featuredImage,
    slug: item.product.slug,
  }))

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
        addressId: parsed.data.addressId,
        items: itemsSnapshot,
        total: finalTotal,
        note: parsed.data.note,
        couponCode: appliedCouponCode,
        discount: discount > 0 ? discount : null,
      },
    })

    if (appliedCouponCode) {
      await tx.coupon.update({
        where: { code: appliedCouponCode },
        data: { usedCount: { increment: 1 } },
      })
    }

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    await tx.cartItem.deleteMany({ where: { userId: session.user.id } })

    return created
  })

  return NextResponse.json(order, { status: 201 })
}
