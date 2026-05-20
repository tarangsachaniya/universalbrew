import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/prisma"
import { StaticPageForm } from "@/components/admin/static-page-form"
import { ArrowLeft } from "lucide-react"
import type { StaticPageKey } from "@prisma/client"

const PAGE_LABELS: Record<StaticPageKey, string> = {
  ABOUT_US:         "About Us",
  TERMS_OF_SERVICE: "Terms of Service",
  PRIVACY_POLICY:   "Privacy Policy",
  REFUND_POLICY:    "Refund Policy",
  SHIPPING_POLICY:  "Shipping Policy",
}

const VALID_KEYS: StaticPageKey[] = [
  "ABOUT_US", "TERMS_OF_SERVICE", "PRIVACY_POLICY", "REFUND_POLICY", "SHIPPING_POLICY",
]

const DEFAULT_TITLES: Record<StaticPageKey, string> = {
  ABOUT_US:         "About Us",
  TERMS_OF_SERVICE: "Terms of Service",
  PRIVACY_POLICY:   "Privacy Policy",
  REFUND_POLICY:    "Refund Policy",
  SHIPPING_POLICY:  "Shipping Policy",
}

export default async function EditStaticPagePage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  if (!VALID_KEYS.includes(key as StaticPageKey)) notFound()

  const pageKey = key as StaticPageKey
  const page = await db.staticPage.findUnique({ where: { key: pageKey } })

  return (
    <div>
      <Link
        href="/admin/static-pages"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Static Pages
      </Link>

      <h1 className="text-2xl font-semibold mb-6">
        Edit: {PAGE_LABELS[pageKey]}
      </h1>

      <StaticPageForm
        pageKey={pageKey}
        initialData={{
          title: page?.title ?? DEFAULT_TITLES[pageKey],
          content: page?.content ?? "",
        }}
      />
    </div>
  )
}
