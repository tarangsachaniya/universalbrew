import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/cache/products'
import { getWebPUrl } from '@/lib/cloudinary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package } from 'lucide-react'

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
    alternates: { canonical: `https://universalbrew.in/products/${slug}` },
    openGraph: {
      title: `${product.name} | Universal Brew`,
      description: desc,
      url: `https://universalbrew.in/products/${slug}`,
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

  const featuredImg = product.featuredImage ? getWebPUrl(product.featuredImage) : null
  const galleryImgs = product.gallery.map((url) => getWebPUrl(url, 600))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? '',
    image: featuredImg ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Universal Brew' },
    },
  }

  return (
    <main className="min-h-screen py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto px-4">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {featuredImg ? (
              <div className="aspect-square rounded-xl overflow-hidden">
                <Image
                  src={featuredImg}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-secondary flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}

            {galleryImgs.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {galleryImgs.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden">
                    <Image src={img} alt={`${product.name} ${i + 2}`} width={200} height={200} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.category && (
              <Link href={`/categories/${product.category.slug}`} className="text-sm text-primary hover:underline">
                {product.category.name}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl font-serif text-foreground">{product.name}</h1>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">₹{Number(product.price).toFixed(2)}</span>
              {product.featuredProduct && <Badge variant="secondary">Featured</Badge>}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock} in stock</span>
              ) : (
                <span className="text-destructive">Out of stock</span>
              )}
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {product.content && (
              <div className="pt-6 border-t">
                <h2 className="text-lg font-semibold mb-3">About this product</h2>
                <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap">
                  {product.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
