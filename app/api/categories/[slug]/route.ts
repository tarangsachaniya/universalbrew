import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations/category'
import { revalidateTag } from '@/lib/revalidate'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { products: { where: { published: true } } },
    })
    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  try {
    const body = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { slug },
      data: parsed.data,
    })
    revalidateTag('categories')
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  try {
    await prisma.category.delete({ where: { slug } })
    revalidateTag('categories')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}