import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getProductBySlug, getSimilarProducts } from '@/lib/cache/products'

export const revalidate = 3600

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return products.map((p) => ({ slug: p.slug }))
}

import { getWebPUrl } from '@/lib/cloudinary-url'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package } from 'lucide-react'
import { ProductCarousel } from '@/components/product-carousel'
import { ProductPurchaseBox } from '@/components/product-purchase-box'
import { ProductCard } from '@/components/product-card'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found' }

  const desc = product.description ?? `Buy ${product.name} — premium Arabica coffee from Universal Brew`
  const image = product.featuredImage ? getWebPUrl(product.featuredImage) : undefined

  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `https://www.universalbrew.shop/products/${slug}` },
    openGraph: {
      title: `${product.name} | Universal Brew`,
      description: desc,
      url: `https://www.universalbrew.shop/products/${slug}`,
      type: 'website',
      images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: desc,
      images: image ? [image] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product || !product.published) notFound()

  const similarProducts = product.category
    ? await getSimilarProducts(product.category.slug, slug)
    : []

  const isVideo = (url: string) =>
    /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url) || url.includes('/video/')

  const carouselItems = [
    ...(product.featuredImage
      ? [{ url: isVideo(product.featuredImage) ? product.featuredImage : getWebPUrl(product.featuredImage), alt: product.name }]
      : []),
    ...product.gallery.map((url, i) => ({
      url: isVideo(url) ? url : getWebPUrl(url, 600),
      alt: `${product.name} ${i + 2}`,
    })),
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? '',
    image: product.featuredImage ? getWebPUrl(product.featuredImage) : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Universal Brew' },
    },
  }

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Room for ProductPurchaseBox's fixed mobile bar is reserved on the <footer>
          (see globals.css) — the footer, not this container, is what ends the page. */}
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/products" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Products
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-primary transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate max-w-[160px]">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Carousel */}
          <div>
            {carouselItems.length > 0 ? (
              <ProductCarousel items={carouselItems} />
            ) : (
              <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/40 rounded-full px-3 py-1 transition-all"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl font-serif text-foreground leading-tight">{product.name}</h1>

            {(product.featuredProduct || product.badges.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                {product.featuredProduct && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                    Featured
                  </Badge>
                )}
                {product.badges.map((badge) => (
                  <Badge key={badge} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {product.description && (
              <div
                className="prose prose-sm prose-amber max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <ProductPurchaseBox
              productId={product.id}
              price={Number(product.price)}
              compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
              stock={product.stock}
              variants={(product.variants ?? []).map((v) => ({
                id: v.id,
                weight: v.weight,
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              }))}
            />

            {product.content && (
              <div className="pt-6 border-t border-border/60 space-y-3">
                <h2 className="text-base font-semibold text-foreground">About this product</h2>
                <div
                  className="prose prose-sm prose-amber max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: product.content }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <section className="mt-20 pt-10 border-t border-border/50">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-serif text-foreground shrink-0">You may also like</h2>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={Number(p.price)}
                  compareAtPrice={p.compareAtPrice ? Number(p.compareAtPrice) : null}
                  featuredImage={p.featuredImage}
                  stock={p.stock}
                  category={p.category}
                  badges={p.badges}
                  rating={p.rating}
                  reviewCount={p.reviewCount}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
