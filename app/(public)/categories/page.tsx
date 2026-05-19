import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCategories } from '@/lib/cache/categories'
import { getWebPUrl } from '@/lib/cloudinary'
import { Coffee } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all Universal Brew coffee categories.',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-primary mb-4">Categories</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our curated coffee collections, each crafted to deliver a unique experience.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">No categories yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => {
              const img = cat.image ? getWebPUrl(cat.image, 600) : null
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {img ? (
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={img}
                        alt={cat.name}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Coffee className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-serif text-primary mb-2">{cat.name}</h2>
                    {cat.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}