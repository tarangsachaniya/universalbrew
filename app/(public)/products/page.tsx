import type { Metadata } from 'next'
import { getProducts }   from '@/lib/cache/products'
import { getCategories } from '@/lib/cache/categories'
import ProductsClient    from './products-client'

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our full range of premium Indian coffee products.',
}

export const revalidate = 300

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; sort?: string }>
}) {
  const params       = await searchParams
  const page         = parseInt(params.page ?? '1')
  const categorySlug = params.category
  const sortParam    = (params.sort === 'price-asc' || params.sort === 'price-desc' || params.sort === 'newest')
    ? params.sort : 'featured'

  const [{ items, total, limit }, categories] = await Promise.all([
    getProducts({ categorySlug, page, limit: 20, sort: sortParam }),
    getCategories(),
  ])

  return (
    <main className="min-h-screen bg-background">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div
        style={{
          paddingTop: "calc(var(--navbar-height, 4.5rem) + 4rem)",
          paddingBottom: "3rem",
          borderBottom: "1px solid var(--border)",
          marginBottom: "3rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--primary)",
            fontWeight: 600,
            marginBottom: "0.75rem",
          }}>
            · Universal Brew
          </p>
          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            color: "var(--foreground)",
            marginBottom: "0.75rem",
          }}>
            Our Coffee Collection
          </h1>
          <p style={{
            fontSize: "0.9rem",
            color: "var(--muted-foreground)",
            maxWidth: "480px",
            lineHeight: 1.7,
          }}>
            100% Arabica beans, no machines required — crafted for the discerning Indian palate.
          </p>
        </div>
      </div>

      {/* ── Client component handles filtering + display ──── */}
      <div style={{ paddingBottom: "6rem" }}>
        <ProductsClient
          initialItems={items.map(p => ({
            id:             p.id,
            name:           p.name,
            slug:           p.slug,
            price:          Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            stock:          p.stock,
            featuredImage:  p.featuredImage ?? null,
            description:    p.description ?? null,
            category:       p.category,
            badges:         p.badges,
            rating:         p.rating ?? null,
            reviewCount:    p.reviewCount,
          }))}
          initialTotal={total}
          initialLimit={limit}
          initialPage={page}
          categories={categories}
          categorySlug={categorySlug}
          sort={sortParam}
        />
      </div>
    </main>
  )
}
