import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil } from "lucide-react"

const LOCATION_LABELS: Record<string, string> = {
  NONE:   "None",
  HEADER: "Header",
  FOOTER: "Footer",
  BOTH:   "Header & Footer",
}

export default async function AdminPagesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages: any[] = await (prisma as any).page.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
            Create custom links and choose where they appear. `Header` and `Both` show in both homepage navbars.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4 mr-1" /> New Page
          </Link>
        </Button>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">No pages yet.</p>
          <Button asChild variant="outline">
            <Link href="/admin/pages/new">Create your first page</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 font-medium">Show In</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{page.title}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">/pages/{page.slug}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{LOCATION_LABELS[page.showIn] ?? page.showIn}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {page.published
                        ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
                        : <Badge variant="secondary">Draft</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/pages/${page.id}/edit`}><Pencil className="h-3 w-3 mr-1" />Edit</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {pages.map((page) => (
              <div key={page.id} className="border rounded-lg p-4 bg-card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">/pages/{page.slug}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/pages/${page.id}/edit`}><Pencil className="h-3 w-3 mr-1" />Edit</Link>
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{LOCATION_LABELS[page.showIn] ?? page.showIn}</Badge>
                  {page.published
                    ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
                    : <Badge variant="secondary">Draft</Badge>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
