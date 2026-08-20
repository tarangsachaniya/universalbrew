import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  variantId: z.string().min(1).nullish(),
})

const cartItemInclude = {
  product: {
    select: { id: true, name: true, slug: true, price: true, featuredImage: true, stock: true },
  },
  variant: {
    select: { id: true, weight: true, price: true, compareAtPrice: true, sku: true },
  },
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: cartItemInclude,
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
  const variantId = parsed.data.variantId ?? null
  const userId = session.user.id

  const product = await db.product.findUnique({ where: { id: productId }, select: { stock: true, published: true } })
  if (!product || !product.published) return NextResponse.json({ error: 'Product not available' }, { status: 404 })

  // A variant must exist AND belong to this product — otherwise a client could pass
  // another product's (cheaper) variant id to spoof the price it gets charged.
  if (variantId) {
    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, productId: true },
    })
    if (!variant || variant.productId !== productId) {
      return NextResponse.json({ error: 'Invalid variant' }, { status: 400 })
    }
  }

  // Stock is a single shared pool on Product regardless of variant.
  // Postgres does not consider two NULLs equal, so the @@unique([userId, productId, variantId])
  // index does NOT dedupe rows where variantId IS NULL. Look those up with findFirst and
  // create/update explicitly; only the fully non-null case can safely use upsert's ON CONFLICT.
  const existing = variantId
    ? await db.cartItem.findUnique({
        where: { userId_productId_variantId: { userId, productId, variantId } },
      })
    : await db.cartItem.findFirst({ where: { userId, productId, variantId: null } })

  const newQty = (existing?.quantity ?? 0) + quantity
  if (newQty > product.stock) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })

  let item
  if (variantId) {
    item = await db.cartItem.upsert({
      where: { userId_productId_variantId: { userId, productId, variantId } },
      update: { quantity: newQty },
      create: { userId, productId, variantId, quantity },
      include: cartItemInclude,
    })
  } else if (existing) {
    item = await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
      include: cartItemInclude,
    })
  } else {
    item = await db.cartItem.create({
      data: { userId, productId, variantId: null, quantity },
      include: cartItemInclude,
    })
  }

  return NextResponse.json(item, { status: 201 })
}
