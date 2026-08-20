import { notFound } from "next/navigation"
import { getStaticPage } from "@/lib/cache/static-pages"
import { StaticPageLayout } from "@/components/static-page-layout"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("ABOUT_US")
  return {
    title: page?.title ?? "About Us",
    description: "Learn about Universal Brew Coffee — our story, values, and products.",
    alternates: { canonical: "https://www.universalbrew.shop/about-us" },
  }
}

export default async function AboutUsPage() {
  const page = await getStaticPage("ABOUT_US")
  if (!page) notFound()
  return <StaticPageLayout title={page.title} content={page.content ?? null} />
}
