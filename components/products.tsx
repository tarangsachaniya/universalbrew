"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Coffee, ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"


type ProductItem = {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  featuredImage?: string | null
  description?: string | null
  category?: { name: string; slug: string } | null
}

type ProductsProps = {
  products?: ProductItem[]
}

export function Products({ products }: ProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 5
  const list = products ?? []
  const maxIndex = Math.max(0, list.length - itemsPerPage)

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1))
  const handleNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))

  const visible = list.slice(currentIndex, currentIndex + itemsPerPage)

  return (
    <section id="shop" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-4">
            Best Seller Products
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-primary/30" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Coffee key={i} className="h-3 w-3 text-primary" />
              ))}
            </div>
            <div className="h-px w-12 bg-primary/30" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We offer something different and delicious to our consumers to ensure you enjoy a rich creamy aromatic and memorable coffee experience every time.
          </p>
        </div>

        {list.length === 0 ? (
          <p className="text-center text-muted-foreground">No featured products yet.</p>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {visible.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 rounded-full border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="p-2 rounded-full border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <Link href="/products">ALL PRODUCTS</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}