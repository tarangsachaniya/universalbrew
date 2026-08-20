"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

type ProductItem = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  stock: number
  featuredImage?: string | null
  description?: string | null
  category?: { name: string; slug: string } | null
  badges?: string[]
  rating?: number | null
  reviewCount?: number
}

type ProductsProps = {
  products?: ProductItem[]
}

export function Products({ products }: ProductsProps) {
  const list = products ?? []

  return (
    <section id="shop" style={{ padding: "6rem 0", background: "var(--background)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>

        {/* ── Section header ─────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "3rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1.5rem",
        }}>
          <div>
            <p style={{
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--primary)",
              fontWeight: 600,
              marginBottom: "0.6rem",
            }}>
              · Best Sellers
            </p>
            <h2 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
              margin: 0,
            }}>
              Our Most Loved Coffees
            </h2>
          </div>
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "var(--primary)",
              textDecoration: "none",
              flexShrink: 0,
              paddingBottom: "0.1rem",
              borderBottom: "1px solid var(--primary)",
              transition: "opacity 0.2s ease",
            }}
          >
            View All
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* ── Product grid / carousel ────────────────────────── */}
        {list.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "3rem 0" }}>
            No featured products yet.
          </p>
        ) : (
          <>
            {/* Desktop grid (≥ 1024px) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1.5rem",
              }}
              className="products-desktop-grid"
            >
              {list.slice(0, 8).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Mobile/Tablet carousel */}
            <div className="products-mobile-carousel" style={{ display: "none" }}>
              <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                <CarouselContent className="-ml-3">
                  {list.map((product) => (
                    <CarouselItem key={product.id} className="basis-[70%] sm:basis-[45%] pl-3">
                      <ProductCard {...product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
                  <CarouselPrevious className="static translate-x-0 translate-y-0 h-9 w-9" />
                  <CarouselNext className="static translate-x-0 translate-y-0 h-9 w-9" />
                </div>
              </Carousel>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .products-desktop-grid { display: none !important; }
          .products-mobile-carousel { display: block !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .products-desktop-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .products-mobile-carousel { display: none !important; }
        }
      `}</style>
    </section>
  )
}