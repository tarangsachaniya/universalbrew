import { notFound } from "next/navigation"
import { getStaticPage } from "@/lib/cache/static-pages"
import { StaticPageLayout } from "@/components/static-page-layout"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("SHIPPING_POLICY")
  return {
    title: page?.title ?? "Shipping Policy",
    description: "Universal Brew order processing and shipping information.",
    alternates: { canonical: "https://universalbrew.in/shipping-policy" },
  }
}

export default async function ShippingPolicyPage() {
  const page = await getStaticPage("SHIPPING_POLICY")
  if (!page) notFound()
  return <StaticPageLayout title={page.title} content={page.content ?? null} />
}
