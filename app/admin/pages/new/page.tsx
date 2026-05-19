import { PageForm } from "@/components/admin/page-form"

export default function NewPagePage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">New Page</h1>
      <PageForm mode="create" />
    </div>
  )
}
