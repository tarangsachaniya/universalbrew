import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cartItemInclude } from '@/lib/cart'

const updateSchema = z.object({ quantity: z.number().int().min(1) })

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const item = await db.cartItem.findUnique({ where: { id }, include: { product: { select: { stock: true } } } })
  if (!item || item.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Stock is one shared pool per product, and the same product can occupy several cart
  // lines (one per variant, plus a variant-less line). The new quantity has to be checked
  // against the pool together with every OTHER line for this product — see lib/cart.ts.
  const otherLines: { quantity: number }[] = await db.cartItem.findMany({
    where: { userId: session.user.id, productId: item.productId, NOT: { id } },
    select: { quantity: true },
  })
  const otherLinesQty = otherLines.reduce((sum, line) => sum + line.quantity, 0)
  if (otherLinesQty + parsed.data.quantity > item.product.stock) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
  }

  const updated = await db.cartItem.update({
    where: { id },
    data: { quantity: parsed.data.quantity },
    include: cartItemInclude,
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const item = await db.cartItem.findUnique({ where: { id } })
  if (!item || item.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.cartItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
