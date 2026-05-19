import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { pageSchema } from '@/lib/validations/page'
import { revalidateTag } from '@/lib/revalidate'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const page = await db.page.findUnique({ where: { id } })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = pageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const conflict = await db.page.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } })
    if (conflict) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }
    const page = await db.page.update({ where: { id }, data: parsed.data })
    revalidateTag('pages')
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    await db.page.delete({ where: { id } })
    revalidateTag('pages')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
