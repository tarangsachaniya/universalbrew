import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const addressSchema = z.object({
  type: z.enum(['HOME', 'OFFICE', 'OTHER']).default('HOME'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone required'),
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  isDefault: z.boolean().default(false),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(addresses)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  if (parsed.data.isDefault) {
    await db.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
  }

  // First address is always default
  const count = await db.address.count({ where: { userId: session.user.id } })
  const isDefault = count === 0 ? true : parsed.data.isDefault

  const address = await db.address.create({
    data: { ...parsed.data, isDefault, userId: session.user.id },
  })
  return NextResponse.json(address, { status: 201 })
}
