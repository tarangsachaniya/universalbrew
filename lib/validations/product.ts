import { z } from 'zod'

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
})

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens only'),
  description: z.string().optional(),
  content: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  featuredProduct: z.coerce.boolean().default(false),
  featuredImage: z.string().url().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).default([]),
  categoryId: z.string().cuid().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(false),
  faqs: z.array(faqItemSchema).default([]),
})

export type ProductInput = z.infer<typeof productSchema>
export type FaqItem = z.infer<typeof faqItemSchema>