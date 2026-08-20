import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/cache/products'
import { getCategories } from '@/lib/cache/categories'
import { ProductCard } from '@/components/product-card'
import { Coffee } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our full range of premium Indian coffee products.',
}

export const revalidate = 300

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const categorySlug = params.category

  const [{ items, total, limit }, categories] = await Promise.all([
    getProducts({ categorySlug, page, limit: 20 }),
    getCategories(),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="relative border-b border-amber-100/60 dark:border-amber-900/20 bg-gradient-to-b from-amber-50/70 to-background dark:from-amber-950/20 dark:to-background">
        <div className="container mx-auto px-4 pt-16 pb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary/40" />
            <Coffee className="h-4 w-4 text-primary/60" />
            <div className="h-px w-12 bg-primary/40" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-3">Our Products</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
            Discover the full range of Universal Brew coffee — crafted with 100% Arabica beans for every palate.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link
              href="/products"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all border ${
                !categorySlug
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all border ${
                  categorySlug === cat.slug
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Coffee className="h-10 w-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm">No products found in this category.</p>
            <Link href="/products" className="mt-3 inline-block text-xs text-primary hover:underline">
              View all products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground text-center mb-6">{total} product{total !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={Number(product.price)}
                  compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
                  stock={product.stock}
                  featuredImage={product.featuredImage}
                  description={product.description}
                  category={product.category}
                  badges={product.badges}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-14">
            {page > 1 ? (
              <Link
                href={`/products?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                className="px-5 py-2 text-sm rounded-full border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
              >
                ← Previous
              </Link>
            ) : (
              <span className="px-5 py-2 text-sm rounded-full border border-border/30 text-muted-foreground/30 cursor-not-allowed">
                ← Previous
              </span>
            )}
            <span className="text-xs text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/products?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                className="px-5 py-2 text-sm rounded-full border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
              >
                Next →
              </Link>
            ) : (
              <span className="px-5 py-2 text-sm rounded-full border border-border/30 text-muted-foreground/30 cursor-not-allowed">
                Next →
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
