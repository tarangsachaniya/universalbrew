import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/product-form'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm
        mode="edit"
        categories={categories}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          content: product.content ?? '',
          price: product.price.toNumber(),
          featuredProduct: product.featuredProduct,
          featuredImage: product.featuredImage ?? '',
          gallery: product.gallery,
          categoryId: product.categoryId ?? '',
          stock: product.stock,
          published: product.published,
        }}
      />
    </div>
  )
}