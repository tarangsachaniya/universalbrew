import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getProducts } from '@/lib/cache/products'
import { getCategories } from '@/lib/cache/categories'
import { getWebPUrl } from '@/lib/cloudinary'
import { Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our full range of premium Indian coffee products.',
}

const GRADIENT_COLORS = [
  'from-amber-100 to-amber-200',
  'from-yellow-100 to-yellow-200',
  'from-orange-100 to-orange-200',
  'from-rose-100 to-rose-200',
  'from-emerald-100 to-emerald-200',
]

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
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-primary mb-4">Our Products</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover the full range of Universal Brew coffee — crafted with 100% Arabica beans.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <Link href="/products">
            <Button variant={!categorySlug ? 'default' : 'outline'} size="sm">All</Button>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`}>
              <Button variant={categorySlug === cat.slug ? 'default' : 'outline'} size="sm">
                {cat.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((product, idx) => {
              const webpImg = product.featuredImage ? getWebPUrl(product.featuredImage, 400) : null
              const gradient = GRADIENT_COLORS[idx % GRADIENT_COLORS.length]
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                >
                  {webpImg ? (
                    <div className="aspect-square rounded-lg overflow-hidden mb-4">
                      <Image
                        src={webpImg}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className={`aspect-square rounded-lg bg-gradient-to-b ${gradient} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <Coffee className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <h3 className="font-semibold text-foreground mb-1 truncate">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-primary font-bold">₹{product.price.toNumber().toFixed(2)}</p>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <Link href={`/products?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ''}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/products?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ''}`}>
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}