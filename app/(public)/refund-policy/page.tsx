import { notFound } from "next/navigation"
import { getStaticPage } from "@/lib/cache/static-pages"
import { StaticPageLayout } from "@/components/static-page-layout"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("REFUND_POLICY")
  return {
    title: page?.title ?? "Refund Policy",
    description: "Universal Brew return, refund, and cancellation policy.",
    alternates: { canonical: "https://universalbrew.in/refund-policy" },
  }
}

export default async function RefundPolicyPage() {
  const page = await getStaticPage("REFUND_POLICY")
  if (!page) notFound()
  return <StaticPageLayout title={page.title} content={page.content ?? null} />
}
