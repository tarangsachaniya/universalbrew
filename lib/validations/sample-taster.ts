import { z } from 'zod'

export const sampleTasterSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Must be a valid email'),
  phone: z.string().trim().min(6, 'Phone number is too short').max(20),
  address: z.string().trim().min(1, 'Address is required').max(500),
})

export type SampleTasterInput = z.infer<typeof sampleTasterSchema>
