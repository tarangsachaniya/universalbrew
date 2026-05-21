import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil } from "lucide-react"
import type { StaticPageKey } from "@prisma/client"

const PAGE_META: Record<StaticPageKey, { label: string; description: string }> = {
  ABOUT_US:         { label: "About Us",         description: "Company story and product offerings" },
  TERMS_OF_SERVICE: { label: "Terms of Service",  description: "Terms and conditions for using the store" },
  PRIVACY_POLICY:   { label: "Privacy Policy",    description: "How we collect and use personal data" },
  REFUND_POLICY:    { label: "Refund Policy",     description: "Returns, refunds, and cancellation rules" },
  SHIPPING_POLICY:  { label: "Shipping Policy",   description: "Order processing and delivery information" },
}

const ALL_KEYS: StaticPageKey[] = [
  "ABOUT_US", "TERMS_OF_SERVICE", "PRIVACY_POLICY", "REFUND_POLICY", "SHIPPING_POLICY",
]

export default async function StaticPagesAdminPage() {
  const pages = await prisma.staticPage.findMany()
  const pageMap = Object.fromEntries(pages.map((p) => [p.key, p]))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Static Pages</h1>
        <p className="text-sm text-muted-foreground mt-1">Edit content for your site's static informational pages.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_KEYS.map((key) => {
          const meta = PAGE_META[key]
          const page = pageMap[key]
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <CardDescription className="text-xs">{meta.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {page ? "Content saved" : "No content yet"}
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/static-pages/${key}/edit`}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
