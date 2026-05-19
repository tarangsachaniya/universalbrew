import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations/product'
import { revalidateTag } from '@/lib/revalidate'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get('category')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = { published: true }
    if (categorySlug) where.category = { slug: categorySlug }
    if (featured === 'true') where.featuredProduct = true

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const serialized = items.map((p) => ({ ...p, price: p.price.toNumber() }))
    return NextResponse.json({ items: serialized, total, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { categoryId, ...rest } = parsed.data
    const product = await prisma.product.create({
      data: {
        ...rest,
        ...(categoryId ? { categoryId } : {}),
      },
    })
    revalidateTag('products')
    return NextResponse.json({ ...product, price: product.price.toNumber() }, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}