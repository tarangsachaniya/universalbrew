"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { VariantSelector } from "@/components/variant-selector"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { formatPrice, getDiscountPercent } from "@/lib/format-price"

type Variant = {
  id: string
  weight: string
  price: number
  compareAtPrice: number | null
}

type ProductPurchaseBoxProps = {
  productId: string
  price: number
  compareAtPrice: number | null
  stock: number
  variants: Variant[]
}

export function ProductPurchaseBox({
  productId,
  price,
  compareAtPrice,
  stock,
  variants,
}: ProductPurchaseBoxProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null)
  const [quantity, setQuantity] = useState(1)

  const activeVariant = variants.find((v) => v.id === selectedVariantId)
  const displayPrice = activeVariant?.price ?? price
  const displayCompareAt = activeVariant ? activeVariant.compareAtPrice : compareAtPrice
  const discountPercent = getDiscountPercent(displayPrice, displayCompareAt)

  const inStock = stock > 0
  const canIncrease = inStock && quantity < stock

  return (
    <div className="space-y-5">
      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-bold text-primary">{formatPrice(displayPrice)}</span>
        {discountPercent !== null && displayCompareAt != null && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(displayCompareAt)}
            </span>
            <span className="text-sm font-semibold text-primary">-{discountPercent}%</span>
          </>
        )}
      </div>

      <VariantSelector
        variants={variants}
        value={selectedVariantId}
        onChange={(id) => setSelectedVariantId(id)}
      />

      {/* Quantity */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quantity
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="h-9 w-9 rounded border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={!canIncrease}
            className="h-9 w-9 rounded border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AddToCartButton
        productId={productId}
        stock={stock}
        quantity={quantity}
        variantId={selectedVariantId ?? undefined}
      />

      {/* Sticky mobile purchase bar — mirrors the exact same state as above.
          `data-mobile-buy-bar` is what globals.css keys the footer's reserved
          bottom padding off of, so the bar cannot cover the end of the page. */}
      <div
        data-mobile-buy-bar
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border px-4 py-3 flex items-center justify-between gap-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-bold text-primary leading-tight">
            {formatPrice(displayPrice * quantity)}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {activeVariant ? `${activeVariant.weight} × ${quantity}` : `Qty ${quantity}`}
          </span>
        </div>
        <AddToCartButton
          productId={productId}
          stock={stock}
          quantity={quantity}
          variantId={selectedVariantId ?? undefined}
          className="flex-1 max-w-[60%]"
        />
      </div>
    </div>
  )
}
