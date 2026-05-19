import { z } from 'zod'

export const footerSchema = z.object({
  companyName: z.string().min(1).max(100),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  socialLinks: z
    .object({
      facebook: z.string().url().optional().or(z.literal('')),
      instagram: z.string().url().optional().or(z.literal('')),
      linkedin: z.string().url().optional().or(z.literal('')),
      twitter: z.string().url().optional().or(z.literal('')),
    })
    .default({}),
})

export type FooterInput = z.infer<typeof footerSchema>