import { notFound } from "next/navigation"
import { db } from "@/lib/prisma"
import { PageForm } from "@/components/admin/page-form"

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await db.page.findUnique({ where: { id } })
  if (!page) notFound()

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">Edit Page</h1>
      <PageForm
        mode="edit"
        initialData={{
          id:        page.id,
          title:     page.title,
          slug:      page.slug,
          content:   page.content ?? "",
          showIn:    page.showIn,
          published: page.published,
        }}
      />
    </div>
  )
}
