import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens only'),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
})

export type CategoryInput = z.infer<typeof categorySchema>