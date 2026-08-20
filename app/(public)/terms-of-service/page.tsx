import { notFound } from "next/navigation"
import { getStaticPage } from "@/lib/cache/static-pages"
import { StaticPageLayout } from "@/components/static-page-layout"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("TERMS_OF_SERVICE")
  return {
    title: page?.title ?? "Terms of Service",
    description: "Terms and conditions for using Universal Brew.",
    alternates: { canonical: "https://www.universalbrew.shop/terms-of-service" },
  }
}

export default async function TermsOfServicePage() {
  const page = await getStaticPage("TERMS_OF_SERVICE")
  if (!page) notFound()
  return <StaticPageLayout title={page.title} content={page.content ?? null} />
}
