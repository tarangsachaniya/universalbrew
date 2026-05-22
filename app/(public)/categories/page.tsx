import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCategories } from '@/lib/cache/categories'
import { getWebPUrl } from '@/lib/cloudinary'
import { Coffee, ArrowRight } from 'lucide-react'
import { HtmlBg } from '@/components/html-bg'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all Universal Brew coffee categories.',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <main className="min-h-screen bg-background">
      <HtmlBg color="#78350f" />
      {/* Header */}
      <div className="relative h-64 md:h-72 w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-stone-800 to-amber-950" />
        {/* Decorative rings */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-amber-400/10" />
        <div className="absolute -right-8 -top-8 h-52 w-52 rounded-full border border-amber-400/10" />
        <div className="absolute right-32 bottom-0 h-40 w-40 rounded-full border border-amber-400/8" />
        {/* Soft glow */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/30 to-transparent" />
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-amber-400/40" />
            <Coffee className="h-4 w-4 text-amber-400/60" />
            <div className="h-px w-12 bg-amber-400/40" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">Collections</h1>
          <p className="text-amber-100/60 max-w-lg mx-auto text-sm leading-relaxed">
            Explore our curated coffee collections, each crafted to deliver a distinct and memorable experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {categories.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Coffee className="h-10 w-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm">No categories yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const img = cat.image ? getWebPUrl(cat.image, 600) : null
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    {img ? (
                      <Image
                        src={img}
                        alt={cat.name}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900 via-stone-800 to-amber-950">
                        <Coffee className="h-16 w-16 text-amber-400/30" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Product count chip */}
                    {'products' in cat && Array.isArray((cat as { products?: unknown[] }).products) && (
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                        {(cat as { products: unknown[] }).products.length} products
                      </div>
                    )}

                    {/* Title on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-xl font-serif font-bold text-white leading-tight">{cat.name}</h2>
                    </div>
                  </div>

                  {/* Description + CTA */}
                  {cat.description && (
                    <div className="px-5 py-4 flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                        {cat.description.replace(/<[^>]*>/g, '')}
                      </p>
                      <ArrowRight className="h-4 w-4 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                  {!cat.description && (
                    <div className="px-5 py-3 flex items-center justify-end">
                      <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
