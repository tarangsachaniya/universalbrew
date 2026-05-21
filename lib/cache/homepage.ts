import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const getActiveHero = unstable_cache(
  async () => {
    return prisma.homepageHero.findFirst({ where: { active: true } })
  },
  ['active-hero'],
  { revalidate: 3600, tags: ['homepage'] }
)

export const getFooterContent = unstable_cache(
  async () => {
    return prisma.footerContent.findFirst()
  },
  ['footer-content'],
  { revalidate: 3600, tags: ['homepage'] }
)

export const getNavigationCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        products: {
          where: { published: true },
          select: { id: true, name: true, slug: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  },
  ['navigation-categories'],
  { revalidate: 3600, tags: ['homepage', 'categories'] }
)

export const getHomepageData = unstable_cache(
  async () => {
    const [hero, featuredProductsRaw, footer, categories, activeCoupons] = await Promise.all([
      prisma.homepageHero.findFirst({
        where: { active: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { published: true, featuredProduct: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.footerContent.findFirst(),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          products: {
            where: { published: true },
            select: { id: true, name: true, slug: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.coupon.findMany({
        where: {
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true, code: true, type: true, value: true, label: true, minOrder: true },
      }),
    ])

    const featuredProducts = featuredProductsRaw.map((product) => ({
      ...product,
      price: parseFloat(String(product.price)),
    }))

    return {
      hero,
      featuredProducts,
      footer,
      headerPages: [],
      footerPages: [],
      categories,
      activeCoupons,
    }
  },
  ['homepage-data'],
  { revalidate: 300, tags: ['homepage', 'products', 'pages', 'categories', 'coupons'] }
)
