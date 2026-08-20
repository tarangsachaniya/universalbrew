import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cartItemInclude } from '@/lib/cart'

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  variantId: z.string().min(1).nullish(),
})

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

  // Every cart line this user holds for this product — across all variants AND the
  // variant-less line. Fetching them together serves two purposes:
  //   1. Stock is one shared pool on Product, so the check must be against the SUM of all
  //      these lines (see lib/cart.ts). A per-line check would let 50 + 50 units through
  //      against a pool of 50.
  //   2. Postgres does not treat two NULLs as equal, so @@unique([userId, productId, variantId])
  //      does NOT dedupe rows where variantId IS NULL — that line has to be matched here in
  //      JS and written with an explicit create/update rather than an upsert's ON CONFLICT.
  const productLines: { id: string; variantId: string | null; quantity: number }[] =
    await db.cartItem.findMany({
      where: { userId, productId },
      select: { id: true, variantId: true, quantity: true },
    })

  const existing = productLines.find((line) => line.variantId === variantId)
  const otherLinesQty = productLines.reduce(
    (sum, line) => sum + (line.id === existing?.id ? 0 : line.quantity),
    0
  )

  const newQty = (existing?.quantity ?? 0) + quantity
  if (otherLinesQty + newQty > product.stock) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
  }

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
