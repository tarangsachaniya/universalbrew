import { unstable_cache } from 'next/cache'
import { db } from '@/lib/prisma'

export const getPagesByLocation = unstable_cache(
  async (location: 'HEADER' | 'FOOTER') => {
    return db.page.findMany({
      where: { published: true, showIn: { in: [location, 'BOTH'] } },
      select: { id: true, title: true, slug: true },
      orderBy: { createdAt: 'asc' },
    }) as Promise<{ id: string; title: string; slug: string }[]>
  },
  ['pages-by-location'],
  { revalidate: 3600, tags: ['pages'] }
)

export const getPageBySlug = unstable_cache(
  async (slug: string) => {
    return db.page.findFirst({ where: { slug, published: true } }) as Promise<{
      id: string; title: string; slug: string; content: string | null; showIn: string; published: boolean
    } | null>
  },
  ['page-by-slug'],
  { revalidate: 3600, tags: ['pages'] }
)
