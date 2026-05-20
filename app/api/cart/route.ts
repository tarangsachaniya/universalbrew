import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, featuredImage: true, stock: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { productId, quantity } = parsed.data

  const product = await db.product.findUnique({ where: { id: productId }, select: { stock: true, published: true } })
  if (!product || !product.published) return NextResponse.json({ error: 'Product not available' }, { status: 404 })

  const existing = await db.cartItem.findUnique({ where: { userId_productId: { userId: session.user.id, productId } } })
  const newQty = (existing?.quantity ?? 0) + quantity
  if (newQty > product.stock) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })

  const item = await db.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { quantity: newQty },
    create: { userId: session.user.id, productId, quantity },
    include: {
      product: { select: { id: true, name: true, slug: true, price: true, featuredImage: true, stock: true } },
    },
  })
  return NextResponse.json(item, { status: 201 })
}
