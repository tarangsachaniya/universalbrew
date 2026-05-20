import { unstable_cache } from 'next/cache'
import { db } from '@/lib/prisma'
import type { StaticPageKey } from '@prisma/client'

export const getAllStaticPages = unstable_cache(
  async () => db.staticPage.findMany({ orderBy: { key: 'asc' } }),
  ['static-pages-all'],
  { revalidate: 3600, tags: ['static-pages'] }
)

export const getStaticPage = unstable_cache(
  async (key: StaticPageKey) => db.staticPage.findUnique({ where: { key } }),
  ['static-page-by-key'],
  { revalidate: 3600, tags: ['static-pages'] }
)
