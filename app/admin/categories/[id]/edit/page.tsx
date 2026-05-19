import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CategoryForm } from '@/components/admin/category-form'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Category</h1>
      <CategoryForm
        mode="edit"
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          image: category.image ?? '',
        }}
      />
    </div>
  )
}