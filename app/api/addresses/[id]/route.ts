import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  type: z.enum(['HOME', 'OFFICE', 'OTHER']).optional(),
  name: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  line1: z.string().min(1).optional(),
  line2: z.string().optional().nullable(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  isDefault: z.boolean().optional(),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await db.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  if (parsed.data.isDefault) {
    await db.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
  }

  const address = await db.address.update({ where: { id }, data: parsed.data })
  return NextResponse.json(address)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await db.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.address.delete({ where: { id } })

  // If deleted was default, make the newest remaining address the default
  if (existing.isDefault) {
    const next = await db.address.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: 'asc' } })
    if (next) await db.address.update({ where: { id: next.id }, data: { isDefault: true } })
  }

  return NextResponse.json({ ok: true })
}
