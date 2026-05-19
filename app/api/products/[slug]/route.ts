import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations/product'
import { revalidateTag } from '@/lib/revalidate'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...product, price: product.price.toNumber() })
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
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { categoryId, ...rest } = parsed.data
    const product = await prisma.product.update({
      where: { slug },
      data: {
        ...rest,
        ...(categoryId ? { categoryId } : { categoryId: null }),
      },
    })
    revalidateTag('products')
    return NextResponse.json({ ...product, price: product.price.toNumber() })
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
    await prisma.product.delete({ where: { slug } })
    revalidateTag('products')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}