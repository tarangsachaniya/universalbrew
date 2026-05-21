import { z } from 'zod'

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Only uppercase letters, numbers, _ and - allowed'),
  type: z.enum(['PERCENT', 'FIXED', 'FREE_DELIVERY']),
  value: z.number().min(0),
  label: z.string().max(100).optional().nullable(),
  minOrder: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  active: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
})

export type CouponInput = z.infer<typeof couponSchema>
