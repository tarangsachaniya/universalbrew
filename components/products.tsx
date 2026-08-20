"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Coffee } from "lucide-react"
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
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {list.map((product) => (
                <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <ProductCard {...product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center items-center gap-4 mt-8">
              <CarouselPrevious className="static translate-x-0 translate-y-0" />
              <CarouselNext className="static translate-x-0 translate-y-0" />
            </div>
          </Carousel>
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