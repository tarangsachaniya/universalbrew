"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { AuthModal } from "@/components/auth-modal"

type AddToCartButtonProps = {
  productId: string
  stock: number
  className?: string
  quantity?: number
  variantId?: string
}

export function AddToCartButton({ productId, stock, className, quantity = 1, variantId }: AddToCartButtonProps) {
  const { status } = useSession()
  const { addItem } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  if (stock === 0) {
    return (
      <Button size="lg" className={className} disabled>
        Out of Stock
      </Button>
    )
  }

  const handleClick = async () => {
    if (status !== "authenticated") {
      setAuthOpen(true)
      return
    }
    setLoading(true)
    try {
      await addItem(productId, quantity, variantId)
      setAdded(true)
      toast.success("Added to cart")
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <Button
        size="lg"
        className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground ${className ?? ""}`}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : added ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )}
        {loading ? "Adding…" : added ? "Added!" : "Add to Cart"}
      </Button>
    </>
  )
}
