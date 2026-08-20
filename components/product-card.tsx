"use client"

import Image from "next/image"
import Link from "next/link"
import { Coffee } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { getWebPUrl, getBlurUrl } from "@/lib/cloudinary-url"
import { formatPrice, getDiscountPercent } from "@/lib/format-price"

type ProductCardProps = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  featuredImage?: string | null
  stock: number
  description?: string | null
  category?: { name: string; slug: string } | null
  badges?: string[]
  rating?: number | null
  reviewCount?: number
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  featuredImage,
  stock,
  category,
  badges,
  rating,
  reviewCount,
}: ProductCardProps) {
  const webpImg        = featuredImage ? getWebPUrl(featuredImage, 500) : null
  const blurUrl        = featuredImage ? getBlurUrl(featuredImage) : ""
  const discountPercent = getDiscountPercent(price, compareAtPrice)
  const hasRating      = typeof rating === "number" && !!reviewCount && reviewCount > 0
  const outOfStock     = stock === 0

  return (
    <article
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "var(--card)",
        transition: "transform 0.3s ease",
      }}
      className="group"
    >
      {/* ── Image area ─────────────────────────────────────────── */}
      <Link href={`/products/${slug}`} tabIndex={-1} aria-hidden style={{ display: "block", position: "relative" }}>
        <div
          style={{
            position: "relative",
            aspectRatio: "3 / 4",
            overflow: "hidden",
            background: "var(--secondary)",
          }}
        >
          {webpImg ? (
            <Image
              src={webpImg}
              alt={name}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              {...(blurUrl ? { placeholder: "blur" as const, blurDataURL: blurUrl } : {})}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "var(--cream-warm, #f5f0ea)",
            }}>
              <Coffee
                style={{ width: "2.5rem", height: "2.5rem", color: "var(--coffee-mid)", opacity: 0.35, marginBottom: "0.5rem" }}
              />
              <span style={{ fontSize: "0.7rem", color: "var(--coffee-mid)", opacity: 0.5, textAlign: "center", padding: "0 0.75rem" }}>
                {name}
              </span>
            </div>
          )}

          {/* Badges — only out-of-stock and discount; no clutter */}
          {outOfStock && (
            <div style={{
              position: "absolute", top: "0.75rem", left: "0.75rem",
              background: "rgba(15,5,0,0.72)", color: "rgba(255,255,255,0.9)",
              fontSize: "0.55rem", letterSpacing: "0.15em", fontWeight: 600,
              textTransform: "uppercase", padding: "0.3rem 0.6rem",
            }}>
              Sold Out
            </div>
          )}
          {!outOfStock && discountPercent !== null && (
            <div style={{
              position: "absolute", top: "0.75rem", right: "0.75rem",
              background: "var(--primary)", color: "var(--primary-foreground)",
              fontSize: "0.55rem", letterSpacing: "0.12em", fontWeight: 600,
              textTransform: "uppercase", padding: "0.3rem 0.6rem",
            }}>
              −{discountPercent}%
            </div>
          )}


        </div>
      </Link>

      {/* ── Info area ──────────────────────────────────────────── */}
      <div style={{ padding: "0.85rem 0 0.25rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {/* Category */}
        {category && (
          <Link
            href={`/categories/${category.slug}`}
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            {category.name}
          </Link>
        )}

        {/* Name */}
        <Link
          href={`/products/${slug}`}
          style={{ textDecoration: "none" }}
        >
          <h3 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "1.15rem",
            fontWeight: 500,
            lineHeight: 1.35,
            color: "var(--foreground)",
            letterSpacing: "0.01em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            transition: "color 0.2s ease"
          }} className="group-hover:text-amber-700 dark:group-hover:text-amber-400">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {hasRating && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="10" height="10" viewBox="0 0 10 10" fill={s <= Math.round(rating!) ? "var(--gold)" : "var(--border)"}>
                <polygon points="5,0.5 6.2,3.8 9.5,3.8 6.9,5.8 7.9,9 5,7.1 2.1,9 3.1,5.8 0.5,3.8 3.8,3.8" />
              </svg>
            ))}
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", marginLeft: "0.2rem" }}>
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "auto", paddingTop: "0.35rem" }}>
          <span style={{
            fontSize: "1.05rem",
            fontWeight: 500,
            letterSpacing: "0.02em",
            color: "var(--foreground)",
          }}>
            {formatPrice(price)}
          </span>
          {compareAtPrice != null && discountPercent !== null && (
            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", textDecoration: "line-through" }}>
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
          <AddToCartButton
            productId={id}
            stock={stock}
            className="flex-1 !py-2.5 !text-[0.62rem] !h-auto !tracking-[0.15em] bg-amber-500 hover:bg-amber-400 text-black font-semibold border-0 uppercase"
          />
          <Link
            href={`/products/${slug}`}
            className="flex items-center justify-center px-4 !py-2.5 !text-[0.62rem] !h-auto !tracking-[0.15em] bg-transparent border border-white/20 hover:border-amber-500 hover:text-amber-400 transition-colors font-semibold uppercase text-white/80"
            style={{ textDecoration: "none" }}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  )
}
