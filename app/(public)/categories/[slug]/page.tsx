import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/cache/categories'
import { getWebPUrl } from '@/lib/cloudinary'
import { Coffee, ArrowLeft } from 'lucide-react'

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
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link href="/categories" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> All Categories
        </Link>

        {/* Category Header */}
        <div className="mb-12">
          {catImg && (
            <div className="w-full h-64 rounded-xl overflow-hidden mb-6">
              <Image src={catImg} alt={category.name} width={1200} height={400} className="w-full h-full object-cover" priority />
            </div>
          )}
          <h1 className="text-4xl font-serif text-primary mb-3">{category.name}</h1>
          {category.description && (
            <div
              className="prose prose-sm prose-amber max-w-2xl text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}
        </div>

        {/* Products */}
        <h2 className="text-2xl font-serif text-foreground mb-6">
          Products ({category.products.length})
        </h2>

        {category.products.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {category.products.map((product, idx) => {
              const img = product.featuredImage ? getWebPUrl(product.featuredImage, 400) : null
              const gradients = ['from-amber-100 to-amber-200', 'from-yellow-100 to-yellow-200', 'from-rose-100 to-rose-200']
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                >
                  {img ? (
                    <div className="aspect-square rounded-lg overflow-hidden mb-4">
                      <Image src={img} alt={product.name} width={400} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className={`aspect-square rounded-lg bg-gradient-to-b ${gradients[idx % 3]} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <Coffee className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <h3 className="font-semibold text-foreground mb-1 truncate">{product.name}</h3>
                  <p className="text-primary font-bold">₹{Number(product.price).toFixed(2)}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
