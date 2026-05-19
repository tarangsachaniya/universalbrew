import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({ orderBy: { name: 'asc' } })
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
)

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.category.findUnique({
      where: { slug },
      include: { products: { where: { published: true }, orderBy: { createdAt: 'desc' } } },
    })
  },
  ['category-by-slug'],
  { revalidate: 3600, tags: ['categories'] }
)