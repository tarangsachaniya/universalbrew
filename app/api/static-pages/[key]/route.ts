import { auth } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { revalidateTag as nextRevalidateTag } from 'next/cache'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const revalidateTag = (tag: string) => (nextRevalidateTag as any)(tag)
import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { StaticPageKey } from '@prisma/client'

const updateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
})

const validKeys: StaticPageKey[] = [
  'ABOUT_US', 'TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'REFUND_POLICY', 'SHIPPING_POLICY',
]

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params
    if (!validKeys.includes(key as StaticPageKey)) {
      return NextResponse.json({ error: 'Invalid page key' }, { status: 404 })
    }
    const page = await db.staticPage.findUnique({ where: { key: key as StaticPageKey } })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { key } = await params
    if (!validKeys.includes(key as StaticPageKey)) {
      return NextResponse.json({ error: 'Invalid page key' }, { status: 404 })
    }
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const page = await db.staticPage.upsert({
      where: { key: key as StaticPageKey },
      update: parsed.data,
      create: { key: key as StaticPageKey, ...parsed.data },
    })
    revalidateTag('static-pages')
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
