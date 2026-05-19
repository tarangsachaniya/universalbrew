import { z } from 'zod'

export const pageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  content: z.string().optional(),
  showIn: z.enum(['HEADER', 'FOOTER', 'BOTH', 'NONE']).default('NONE'),
  published: z.coerce.boolean().default(false),
})

export type PageInput = z.infer<typeof pageSchema>
