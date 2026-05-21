import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { couponSchema } from '@/lib/validations/coupon'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = couponSchema.partial().safeParse(
    body.code ? { ...body, code: body.code.toUpperCase() } : body
  )
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(parsed.data.code !== undefined && { code: parsed.data.code }),
      ...(parsed.data.type !== undefined && { type: parsed.data.type }),
      ...(parsed.data.value !== undefined && { value: parsed.data.value }),
      ...(parsed.data.label !== undefined && { label: parsed.data.label }),
      ...(parsed.data.minOrder !== undefined && { minOrder: parsed.data.minOrder }),
      ...(parsed.data.maxUses !== undefined && { maxUses: parsed.data.maxUses }),
      ...(parsed.data.active !== undefined && { active: parsed.data.active }),
      ...(parsed.data.expiresAt !== undefined && {
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      }),
    },
  })

  return NextResponse.json(coupon)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
