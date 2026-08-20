import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

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
  if (parsed.data.quantity > item.product.stock) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })

  const updated = await db.cartItem.update({
    where: { id },
    data: { quantity: parsed.data.quantity },
    // Keep this shape identical to POST /api/cart so the client always has variant
    // pricing available after any cart mutation.
    include: {
      product: { select: { id: true, name: true, slug: true, price: true, featuredImage: true, stock: true } },
      variant: { select: { id: true, weight: true, price: true, compareAtPrice: true, sku: true } },
    },
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
