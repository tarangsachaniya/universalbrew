"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { getWebPUrl } from "@/lib/cloudinary-url"
import { formatPrice } from "@/lib/format-price"

type CartSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, count, total, removeItem, updateQty, loading } = useCart()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart {count > 0 && <span className="text-muted-foreground font-normal text-sm">({count} items)</span>}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Loading cart…
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Your cart is empty</p>
            <Button variant="outline" asChild onClick={() => onOpenChange(false)}>
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => {
                const imgUrl = item.product.featuredImage ? getWebPUrl(item.product.featuredImage, 80) : null
                const unitPrice = Number(item.variant?.price ?? item.product.price)
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={item.product.name} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-medium truncate block hover:text-primary transition-colors"
                        onClick={() => onOpenChange(false)}
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <span className="block text-xs text-muted-foreground">{item.variant.weight}</span>
                      )}
                      <p className="text-sm text-primary font-semibold mt-0.5">
                        {formatPrice(unitPrice * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatPrice(unitPrice)} each</p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => item.quantity > 1 ? updateQty(item.id, item.quantity - 1) : removeItem(item.id)}
                          className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t px-6 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <Separator />
              <Button
                className="w-full"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={() => onOpenChange(false)}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
