import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_ABOUT_BODY, DEFAULT_ABOUT_FEATURES, DEFAULT_ABOUT_TITLE } from '../lib/about'

const prisma = new PrismaClient()
// The generated Prisma client can lag behind the schema during local setup.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const homepageHero = (prisma as any).homepageHero

async function main() {
  // Admin user
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

  // Default category
  const category = await prisma.category.upsert({
    where: { slug: 'instant-coffee' },
    update: {},
    create: {
      name: 'Instant Coffee',
      slug: 'instant-coffee',
      description: 'Premium instant coffee blends crafted from 100% Arabica beans. No machines required.',
    },
  })

  // Products from existing static data
  const products = [
    { name: 'Basic', slug: 'basic', price: 209, description: 'Our signature blend — smooth and balanced for everyday enjoyment.' },
    { name: 'Granule', slug: 'granule', price: 249, description: 'Rich granule coffee with a bold, robust flavour profile.' },
    { name: 'Classic', slug: 'classic', price: 219, description: 'A timeless classic blend with deep aroma and velvety finish.' },
    { name: 'Ginger', slug: 'ginger', price: 299, description: 'Infused with natural ginger for a warming, spiced coffee experience.', featured: true },
    { name: 'Filter', slug: 'filter', price: 209, description: 'Traditional South Indian filter coffee taste in an instant format.' },
    { name: 'Masala', slug: 'masala', price: 229, description: 'A spiced masala coffee blend inspired by the streets of India.', featured: true },
    { name: 'Cardamom', slug: 'cardamom', price: 259, description: 'Fragrant cardamom-infused coffee for a floral, aromatic cup.' },
    { name: 'Cinnamon', slug: 'cinnamon', price: 279, description: 'Warm cinnamon notes paired with premium Arabica for a cozy brew.' },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: 100,
        published: true,
        featuredProduct: p.featured ?? false,
        categoryId: category.id,
      },
    })
  }

  const heroSlides = [
    { url: '/images/img1.webp', title: 'The Vessel',  subtitle: 'Heritage · Craft · Ritual'                                                    },
    { url: '/images/img2.webp', title: 'The Bag',     subtitle: 'Where it all begins'                                                          },
    { url: '/images/img3.webp', title: 'The Bloom',   subtitle: 'Nature awakens within'                                                        },
    { url: '/images/img4.webp', title: 'The Release', subtitle: 'Botanicals set free'                                                          },
    { url: '/images/img5.webp', title: 'The Cup',     subtitle: 'An original, pure, rich-creamy & aromatic coffee with incredible taste'        },
  ]

  await homepageHero.upsert({
    where:  { id: 'default-hero' },
    update: {
      slides: heroSlides,
      youtubeUrls: [],
      aboutTitle: DEFAULT_ABOUT_TITLE,
      aboutBody: DEFAULT_ABOUT_BODY,
      aboutFeatures: DEFAULT_ABOUT_FEATURES,
      active: true,
    },
    create: {
      id: 'default-hero',
      slides: heroSlides,
      youtubeUrls: [],
      aboutTitle: DEFAULT_ABOUT_TITLE,
      aboutBody: DEFAULT_ABOUT_BODY,
      aboutFeatures: DEFAULT_ABOUT_FEATURES,
      active: true,
    },
  })

  // Default footer
  const existing = await prisma.footerContent.findFirst()
  if (!existing) {
    await prisma.footerContent.create({
      data: {
        companyName: 'Khyati & Sons Enterprise',
        description: '100% pure Arabica coffee with a classic Indian touch. No artificial flavours.',
        address: 'Ahmedabad, Gujarat, India',
        phone: '+91 98765 43210',
        email: 'hello@universalbrew.in',
        socialLinks: {},
      },
    })
  }

  console.log('✓ Seed complete')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
