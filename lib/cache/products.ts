import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const getFeaturedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { published: true, featuredProduct: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
  },
  ['featured-products'],
  { revalidate: 300, tags: ['products'] }
)

export const getProducts = unstable_cache(
  async (opts?: { categorySlug?: string; page?: number; limit?: number }) => {
    const page = opts?.page ?? 1
    const limit = opts?.limit ?? 20
    const skip = (page - 1) * limit

    const where = {
      published: true,
      ...(opts?.categorySlug
        ? { category: { slug: opts.categorySlug } }
        : {}),
    }

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

    return { items, total, page, limit }
  },
  ['products'],
  { revalidate: 300, tags: ['products'] }
)

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    })
  },
  ['product-by-slug'],
  { revalidate: 300, tags: ['products'] }
)

export const getProductsByCategory = unstable_cache(
  async (categorySlug: string) => {
    return prisma.product.findMany({
      where: { published: true, category: { slug: categorySlug } },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
  },
  ['products-by-category'],
  { revalidate: 300, tags: ['products'] }
)