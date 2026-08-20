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

          {/* Quick Add overlay — appears on hover */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "0.75rem",
              background: "linear-gradient(to top, rgba(10,4,0,0.82), transparent)",
              transform: "translateY(100%)",
              transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="group-hover:!translate-y-0"
          >
            <AddToCartButton
              productId={id}
              stock={stock}
              className="w-full !py-2 !text-[0.62rem] !h-auto !tracking-[0.16em] bg-amber-500 hover:bg-amber-400 text-black font-semibold border-0 uppercase"
            />
          </div>
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
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.3,
            color: "var(--foreground)",
            letterSpacing: "-0.005em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
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
            fontSize: "0.95rem",
            fontWeight: 600,
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
      </div>
    </article>
  )
}
