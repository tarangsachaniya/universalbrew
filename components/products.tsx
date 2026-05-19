"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Coffee, ChevronLeft, ChevronRight } from "lucide-react"
import { getWebPUrl } from "@/lib/cloudinary-url"

type ProductItem = {
  id: string
  name: string
  slug: string
  price: number
  featuredImage?: string | null
  description?: string | null
}

type ProductsProps = {
  products?: ProductItem[]
}

const GRADIENT_COLORS = [
  "from-amber-100 to-amber-200",
  "from-amber-200 to-amber-300",
  "from-yellow-100 to-yellow-200",
  "from-orange-100 to-orange-200",
  "from-rose-100 to-rose-200",
  "from-emerald-100 to-emerald-200",
  "from-lime-100 to-lime-200",
  "from-red-100 to-red-200",
]

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
              {visible.map((product, idx) => {
                const webpImg = product.featuredImage ? getWebPUrl(product.featuredImage, 400) : null
                const gradient = GRADIENT_COLORS[(currentIndex + idx) % GRADIENT_COLORS.length]
                return (
                  <div
                    key={product.id}
                    className="group bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      {webpImg ? (
                        <div className="aspect-square rounded-lg overflow-hidden mb-4 group-hover:scale-105 transition-transform">
                          <Image
                            src={webpImg}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`aspect-square rounded-lg bg-gradient-to-b ${gradient} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                          <div className="text-center">
                            <Coffee className="h-12 w-12 mx-auto text-primary/40 mb-2" />
                            <span className="text-xs text-primary/60 font-medium">{product.name}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-primary font-bold">₹{product.price.toFixed(2)}</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        asChild
                      >
                        <Link href={`/products/${product.slug}`}>BUY NOW</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
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