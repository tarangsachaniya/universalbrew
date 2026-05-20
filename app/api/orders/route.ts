import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const placeOrderSchema = z.object({
  addressId: z.string().min(1, 'Address is required'),
  note: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { address: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = placeOrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Verify address belongs to user
  const address = await db.address.findUnique({ where: { id: parsed.data.addressId } })
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  // Fetch cart items with product data
  const cartItems = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { select: { id: true, name: true, price: true, stock: true, featuredImage: true, slug: true } } },
  })
  if (cartItems.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  // Validate stock
  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      return NextResponse.json({ error: `Insufficient stock for ${item.product.name}` }, { status: 400 })
    }
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  // Snapshot items for order record
  const itemsSnapshot = cartItems.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    price: Number(item.product.price),
    quantity: item.quantity,
    image: item.product.featuredImage,
    slug: item.product.slug,
  }))

  // Create order, decrement stock, clear cart — all in one transaction
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
        addressId: parsed.data.addressId,
        items: itemsSnapshot,
        total,
        note: parsed.data.note,
      },
    })

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
