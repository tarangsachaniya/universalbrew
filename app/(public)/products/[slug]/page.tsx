import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getProductBySlug, getSimilarProducts } from '@/lib/cache/products'
import { getWebPUrl } from '@/lib/cloudinary-url'
import { ArrowLeft, Package } from 'lucide-react'
import { ProductCarousel } from '@/components/product-carousel'
import { ProductPurchaseBox } from '@/components/product-purchase-box'
import { ProductCard } from '@/components/product-card'
import { ProductFaq } from '@/components/product-faq'

export const revalidate = 3600

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return products.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product  = await getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found' }

  const desc  = product.description ?? `Buy ${product.name} — premium Arabica coffee from Universal Brew`
  const image = product.featuredImage ? getWebPUrl(product.featuredImage) : undefined

  return {
    title:       product.name,
    description: desc,
    alternates:  { canonical: `https://www.universalbrew.shop/products/${slug}` },
    openGraph: {
      title:       `${product.name} | Universal Brew`,
      description: desc,
      url:         `https://www.universalbrew.shop/products/${slug}`,
      type:        'website',
      images:      image ? [{ url: image, width: 800, height: 800, alt: product.name }] : [],
    },
    twitter: {
      card:        'summary_large_image',
      title:       product.name,
      description: desc,
      images:      image ? [image] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug }   = await params
  const product    = await getProductBySlug(slug)
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

  /* JSON-LD structured data */
  const jsonLd = {
    '@context':  'https://schema.org',
    '@type':     'Product',
    name:        product.name,
    description: product.description ?? '',
    image:       product.featuredImage ? getWebPUrl(product.featuredImage) : undefined,
    offers: {
      '@type':       'Offer',
      priceCurrency: 'INR',
      price:          Number(product.price).toFixed(2),
      availability:   product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Universal Brew' },
    },
  }

  /* Safely parse FAQs from the product */
  const faqs: { question: string; answer: string }[] = (() => {
    try {
      const raw = product.faqs as unknown
      if (Array.isArray(raw)) return raw.filter(f => f?.question && f?.answer)
    } catch {}
    return []
  })()

  return (
    <main
      className="min-h-screen bg-background"
      style={{ paddingTop: "var(--navbar-height, 4.5rem)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem 6rem" }}>

        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem" }}
        >
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              textDecoration: "none",
              transition: "color 0.2s",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={12} />
            Products
          </Link>
          {product.category && (
            <>
              <span style={{ color: "var(--border)", fontSize: "0.8rem" }}>/</span>
              <Link
                href={`/categories/${product.category.slug}`}
                style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", textDecoration: "none" }}
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span style={{ color: "var(--border)", fontSize: "0.8rem" }}>/</span>
          <span style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--foreground)", fontWeight: 600, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.name}
          </span>
        </nav>

        {/* ── Main grid ─────────────────────────────────────── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }}
          className="product-main-grid"
        >
          {/* Left: Media gallery */}
          <div style={{ position: "sticky", top: "calc(var(--navbar-height, 4.5rem) + 1.5rem)" }}>
            {carouselItems.length > 0 ? (
              <ProductCarousel items={carouselItems} />
            ) : (
              <div style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--secondary)",
              }}>
                <Package style={{ width: "4rem", height: "4rem", opacity: 0.2 }} />
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div style={{ paddingTop: "0.5rem" }}>
            {/* Category label */}
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                style={{
                  display: "inline-block",
                  fontSize: "0.6rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "var(--primary)",
                  textDecoration: "none",
                  marginBottom: "1rem",
                }}
              >
                {product.category.name}
              </Link>
            )}

            {/* Product name */}
            <h1 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
              marginBottom: "1.5rem",
            }}>
              {product.name}
            </h1>

            {/* Description */}
            {product.description && (
              <div
                style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "2rem" }}
                className="prose prose-sm prose-amber max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            {/* Stock indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem" }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: product.stock > 0 ? "rgb(34 197 94)" : "rgb(239 68 68)",
              }} />
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: product.stock > 0 ? "rgb(22 163 74)" : "rgb(220 38 38)",
              }}>
                {product.stock > 0
                  ? product.stock <= 5 ? `Only ${product.stock} left` : "In Stock"
                  : "Out of Stock"}
              </span>
            </div>

            {/* Purchase box (price + variants + qty + ATC) */}
            <ProductPurchaseBox
              productId={product.id}
              price={Number(product.price)}
              compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
              stock={product.stock}
              variants={(product.variants ?? []).map(v => ({
                id:            v.id,
                weight:        v.weight,
                price:         Number(v.price),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              }))}
            />

            {/* Extended content */}
            {product.content && (
              <div style={{ marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
                <h2 style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  marginBottom: "1rem",
                }}>
                  About this coffee
                </h2>
                <div
                  style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "var(--muted-foreground)" }}
                  className="prose prose-sm prose-amber max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.content }}
                />
              </div>
            )}

            {/* Product FAQ */}
            <ProductFaq faqs={faqs} />
          </div>
        </div>

        {/* ── Similar products ───────────────────────────────── */}
        {similarProducts.length > 0 && (
          <section style={{ marginTop: "6rem", paddingTop: "4rem", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "2.5rem" }}>
              <h2 style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "1.75rem",
                fontWeight: 400,
                letterSpacing: "-0.015em",
                color: "var(--foreground)",
              }}>
                You May Also Like
              </h2>
              <Link
                href="/products"
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                  borderBottom: "1px solid var(--primary)",
                }}
              >
                View All
              </Link>
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}
              className="similar-grid"
            >
              {similarProducts.map(p => (
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

      <style>{`
        @media (max-width: 767px) {
          .product-main-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .product-main-grid > div:first-child {
            position: static !important;
          }
          .similar-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .similar-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </main>
  )
}
