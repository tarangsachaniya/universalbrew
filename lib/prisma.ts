import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Escape-hatch for models added before `prisma generate` runs (Page, updated HomepageHero).
// Replace with direct prisma.xxx calls after running: npx prisma migrate dev && npx prisma generate
// Escape-hatch for models added before `prisma generate` runs.
// After: npx prisma migrate dev && npx prisma generate — remove this and use prisma directly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = prisma