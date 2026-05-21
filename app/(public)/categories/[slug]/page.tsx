import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/cache/categories'
import { getWebPUrl } from '@/lib/cloudinary'
import { ArrowLeft, Coffee } from 'lucide-react'
import { ProductCard } from '@/components/product-card'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }
  return {
    title: category.name,
    description: category.description ?? `Browse ${category.name} coffees from Universal Brew`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const catImg = category.image ? getWebPUrl(category.image) : null

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {catImg ? (
          <>
            <Image
              src={catImg}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
            {/* Stronger gradient for image variant */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          </>
        ) : (
          <>
            {/* Rich warm gradient fallback */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-stone-800 to-amber-950" />
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
            }} />
            {/* Decorative rings */}
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-amber-400/10" />
            <div className="absolute -right-8 -top-8 h-52 w-52 rounded-full border border-amber-400/10" />
            <div className="absolute right-32 bottom-0 h-40 w-40 rounded-full border border-amber-400/8" />
            {/* Soft glow */}
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
            {/* Bottom fade to match page bg */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/30 to-transparent" />
          </>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-10 pb-8 md:pb-10 container mx-auto">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/90 mb-5 transition-colors w-fit"
          >
            <ArrowLeft className="h-3 w-3" /> All Collections
          </Link>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-sm">{category.name}</h1>
          {category.description && (
            <div
              className="mt-2.5 text-sm text-white/65 max-w-xl line-clamp-2 [&_*]:!text-white/65 [&_*]:!text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Product count */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-lg font-serif text-foreground">
            {category.products.length} Product{category.products.length !== 1 ? 's' : ''}
          </h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {category.products.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Coffee className="h-10 w-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={Number(product.price)}
                featuredImage={product.featuredImage}
                stock={product.stock}
                category={category}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
