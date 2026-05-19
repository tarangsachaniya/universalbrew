import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { footerSchema } from '@/lib/validations/footer'
import { revalidateTag } from '@/lib/revalidate'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const footer = await prisma.footerContent.findFirst()
    return NextResponse.json(footer)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, ...data } = body
    const parsed = footerSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    let footer
    if (id) {
      footer = await prisma.footerContent.update({ where: { id }, data: parsed.data })
    } else {
      footer = await prisma.footerContent.create({ data: parsed.data })
    }

    revalidateTag('homepage')
    return NextResponse.json(footer)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}