import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { couponSchema } from '@/lib/validations/coupon'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.coupon.count(),
  ])

  return NextResponse.json({ items, total, page, limit })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = couponSchema.safeParse({ ...body, code: body.code?.toUpperCase() })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } })
  if (existing) {
    return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      label: parsed.data.label ?? null,
      minOrder: parsed.data.minOrder ?? null,
      maxUses: parsed.data.maxUses ?? null,
      active: parsed.data.active,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  })

  return NextResponse.json(coupon, { status: 201 })
}
