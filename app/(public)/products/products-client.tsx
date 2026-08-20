"use client"

import { useEffect, useState, useTransition, useCallback, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { Coffee, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"

type Category = { id: string; name: string; slug: string }

type Product = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  stock: number
  featuredImage: string | null
  description: string | null
  category: { name: string; slug: string } | null
  badges: string[]
  rating: number | null
  reviewCount: number
}

type ProductsClientProps = {
  initialItems: Product[]
  initialTotal: number
  initialLimit: number
  initialPage: number
  categories: Category[]
  categorySlug?: string
  sort?: string
}

const SORT_OPTIONS = [
  { value: "featured",   label: "Featured" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest",     label: "Newest" },
] as const

function ProductsClientInner({
  initialItems,
  initialTotal,
  initialLimit,
  initialPage,
  categories,
  categorySlug: initCategory,
  sort: initSort,
}: ProductsClientProps) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [items,    setItems]    = useState<Product[]>(initialItems)
  const [total,    setTotal]    = useState(initialTotal)
  const [loading,  setLoading]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const currentCategory = searchParams.get("category") ?? initCategory ?? ""
  const currentSort     = searchParams.get("sort")     ?? initSort     ?? "featured"
  const currentPage     = parseInt(searchParams.get("page") ?? String(initialPage))
  const limit           = initialLimit
  const totalPages      = Math.ceil(total / limit)

  const buildUrl = useCallback((overrides: { category?: string; sort?: string; page?: number }) => {
    const params = new URLSearchParams()
    const cat  = overrides.category  !== undefined ? overrides.category  : currentCategory
    const sort = overrides.sort      !== undefined ? overrides.sort      : currentSort
    const page = overrides.page      !== undefined ? overrides.page      : 1
    if (cat)                 params.set("category", cat)
    if (sort !== "featured") params.set("sort", sort)
    if (page > 1)            params.set("page", String(page))
    const qs = params.toString()
    return `${pathname}${qs ? "?" + qs : ""}`
  }, [pathname, currentCategory, currentSort])

  const fetchProducts = useCallback(async (cat: string, sort: string, page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (cat)  params.set("category", cat)
      if (sort) params.set("sort", sort)
      const res  = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
    } catch {
      /* keep existing data on error */
    } finally {
      setLoading(false)
    }
  }, [limit])

  /* Fetch when URL params change */
  useEffect(() => {
    fetchProducts(currentCategory, currentSort, currentPage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory, currentSort, currentPage])

  const navigate = (url: string) => {
    startTransition(() => router.push(url, { scroll: false }))
  }

  const setCategory = (slug: string) => {
    navigate(buildUrl({ category: slug, page: 1 }))
    setFilterOpen(false)
  }

  const setSort = (sort: string) => {
    navigate(buildUrl({ sort, page: 1 }))
  }

  const setPage = (page: number) => {
    navigate(buildUrl({ page }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const isTransitioning = isPending || loading

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>

      {/* ── Filter/Sort bar ───────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2.5rem",
        paddingBottom: "1.25rem",
        borderBottom: "1px solid var(--border)",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        {/* Category pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted-foreground)", marginRight: "0.25rem", fontWeight: 500 }}>
            Filter
          </span>
          <FilterPill
            label="All"
            active={!currentCategory}
            onClick={() => setCategory("")}
          />
          {categories.map(cat => (
            <FilterPill
              key={cat.id}
              label={cat.name}
              active={currentCategory === cat.slug}
              onClick={() => setCategory(cat.slug)}
            />
          ))}
        </div>

        {/* Sort + results count */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
            {isTransitioning ? "…" : `${total} product${total !== 1 ? "s" : ""}`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted-foreground)", fontWeight: 500 }}>Sort</span>
            <select
              value={currentSort}
              onChange={e => setSort(e.target.value)}
              style={{
                fontSize: "0.78rem",
                border: "1px solid var(--border)",
                padding: "0.4rem 0.6rem",
                background: "var(--background)",
                color: "var(--foreground)",
                cursor: "pointer",
                outline: "none",
              }}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────────── */}
      <div
        style={{
          opacity: isTransitioning ? 0.5 : 1,
          transition: "opacity 0.25s ease",
          pointerEvents: isTransitioning ? "none" : "auto",
        }}
      >
        {items.length === 0 && !isTransitioning ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--muted-foreground)" }}>
            <Coffee style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto 1rem", opacity: 0.25 }} />
            <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>No products found.</p>
            <button
              onClick={() => setCategory("")}
              style={{
                fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--primary)", background: "transparent", border: "1px solid var(--primary)",
                padding: "0.6rem 1.25rem", cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
          }}
            className="products-listing-grid"
          >
            {items.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
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
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "4rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--border)",
        }}>
          <PaginationBtn
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            icon={<ChevronLeft size={16} />}
          />
          <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
            {currentPage} / {totalPages}
          </span>
          <PaginationBtn
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            icon={<ChevronRight size={16} />}
          />
        </div>
      )}

      <style>{`
        @media (max-width: 639px) {
          .products-listing-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .products-listing-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: "0.65rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontWeight: active ? 600 : 500,
        padding: "0.4rem 0.9rem",
        border: "1px solid",
        borderColor: active ? "var(--primary)" : "var(--border)",
        background: active ? "var(--primary)" : "transparent",
        color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
        cursor: "pointer",
        transition: "all 0.18s ease",
        borderRadius: 0,
      }}
    >
      {label}
    </button>
  )
}

function PaginationBtn({ onClick, disabled, icon }: { onClick: () => void; disabled: boolean; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "36px", height: "36px",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid var(--border)",
        background: "transparent",
        color: disabled ? "var(--muted-foreground)" : "var(--foreground)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "border-color 0.2s ease",
      }}
    >
      {icon}
    </button>
  )
}

export default function ProductsClient(props: ProductsClientProps) {
  return (
    <Suspense>
      <ProductsClientInner {...props} />
    </Suspense>
  )
}
