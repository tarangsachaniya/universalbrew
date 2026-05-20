import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash(process.env?.SEED_ADMIN_PASSWORD ?? '', 12)
  await prisma.user.upsert({
    where: { email: 'admin@universalbrew.in' },
    update: {},
    create: {
      email: 'admin@universalbrew.in',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('✓ Seed complete')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
