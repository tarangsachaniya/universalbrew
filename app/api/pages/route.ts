import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { pageSchema } from '@/lib/validations/page'
import { revalidateTag } from '@/lib/revalidate'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const location = searchParams.get('location')
    const where = location
      ? { published: true, showIn: { in: [location, 'BOTH'] } }
      : {}
    const pages = await db.page.findMany({ where, orderBy: { createdAt: 'asc' } })
    return NextResponse.json(pages)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const parsed = pageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const existing = await db.page.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }
    const page = await db.page.create({ data: parsed.data })
    revalidateTag('pages')
    return NextResponse.json(page, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
