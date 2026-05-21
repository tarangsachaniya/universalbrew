"use client"

import Image from "next/image"
import Link from "next/link"
import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { getWebPUrl, getBlurUrl } from "@/lib/cloudinary-url"

type ProductCardProps = {
  id: string
  name: string
  slug: string
  price: number
  featuredImage?: string | null
  stock: number
  description?: string | null
  category?: { name: string; slug: string } | null
}

export function ProductCard({ id, name, slug, price, featuredImage, stock, description, category }: ProductCardProps) {
  const webpImg = featuredImage ? getWebPUrl(featuredImage, 400) : null
  const blurUrl = featuredImage ? getBlurUrl(featuredImage) : ""

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {webpImg ? (
          <Image
            src={webpImg}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            {...(blurUrl ? { placeholder: "blur" as const, blurDataURL: blurUrl } : {})}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/60">
            <Coffee className="h-12 w-12 text-primary/30 mb-2" />
            <span className="text-xs text-primary/40 font-medium px-2 text-center">{name}</span>
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-2 right-2 z-10">
          {stock === 0 ? (
            <span className="text-[10px] font-semibold bg-red-500/90 text-white px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          ) : stock <= 5 ? (
            <span className="text-[10px] font-semibold bg-amber-500/90 text-white px-2 py-0.5 rounded-full">
              Only {stock} left
            </span>
          ) : null}
        </div>

        {/* Hover CTA overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 p-3 bg-gradient-to-t from-black/80 to-black/20 flex flex-col gap-2">
          <AddToCartButton
            productId={id}
            stock={stock}
            className="w-full !py-1.5 !text-xs !h-auto bg-amber-500 hover:bg-amber-400 text-black font-semibold border-0"
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full h-auto py-1.5 text-xs border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white"
            asChild
          >
            <Link href={`/products/${slug}`}>View Product</Link>
          </Button>
        </div>
      </div>

      {/* Info area */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {category && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {category.name}
          </span>
        )}
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{name}</h3>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
        )}
        <p className="text-primary font-bold text-base mt-auto pt-1">₹{price.toFixed(2)}</p>
      </div>
    </div>
  )
}
