import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { CATEGORIES, PRODUCTS } from './seed-data'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@universalbrew.shop'
  const adminPassword = await bcrypt.hash(process.env?.SEED_ADMIN_PASSWORD ?? '', 12)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  // Only seed the catalog (categories/products/variants) into a genuinely
  // empty database. Re-running this against a live database would overwrite
  // any price/stock/content edits made through the admin CMS with these
  // static seed values — safe for first-time setup, not safe as a
  // recurring build/deploy step otherwise.
  const existingProductCount = await prisma.product.count()
  if (existingProductCount > 0) {
    console.log(`✓ Catalog already has ${existingProductCount} product(s) — skipping catalog seed (admin user upsert still ran above).`)
    return
  }

  // Seed categories
  for (const categoryData of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        name: categoryData.name,
        tagline: categoryData.tagline,
        description: categoryData.description,
      },
      create: {
        id: categoryData.id,
        name: categoryData.name,
        slug: categoryData.slug,
        tagline: categoryData.tagline,
        description: categoryData.description,
        image: null,
      },
    })
    console.log(`✓ Seeded category: ${category.name}`)
  }

  // Seed products and their variants
  for (const productData of PRODUCTS) {
    const stock = productData.inStock ? 50 : 0
    const featuredProduct =
      ['basic', 'granule', 'classic', 'ginger', 'masala'].includes(productData.id)

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        name: productData.name,
        description: productData.description,
        content: productData.content,
        price: productData.price,
        sku: productData.sku,
        compareAtPrice: productData.compareAtPrice,
        badges: productData.badges,
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        stock,
        published: true,
        featuredProduct,
      },
      create: {
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        content: productData.content,
        price: productData.price,
        sku: productData.sku,
        compareAtPrice: productData.compareAtPrice,
        badges: productData.badges,
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        stock,
        published: true,
        featuredProduct,
        categoryId: productData.categoryId,
        featuredImage: null,
        gallery: [],
      },
    })
    console.log(`✓ Seeded product: ${product.name}`)

    // Seed variants for this product
    for (const variantData of productData.variants) {
      const variant = await prisma.productVariant.upsert({
        where: {
          productId_weight: {
            productId: product.id,
            weight: variantData.weight,
          },
        },
        update: {
          price: variantData.price,
          compareAtPrice: variantData.compareAtPrice,
        },
        create: {
          productId: product.id,
          weight: variantData.weight,
          price: variantData.price,
          compareAtPrice: variantData.compareAtPrice,
          sku: null,
        },
      })
      console.log(
        `  ✓ Seeded variant: ${product.name} - ${variant.weight}`,
      )
    }
  }

  console.log('✓ Seed complete')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
