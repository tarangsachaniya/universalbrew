import { notFound } from "next/navigation"
import { getStaticPage } from "@/lib/cache/static-pages"
import { StaticPageLayout } from "@/components/static-page-layout"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("PRIVACY_POLICY")
  return {
    title: page?.title ?? "Privacy Policy",
    description: "How Universal Brew collects, uses, and protects your personal information.",
    alternates: { canonical: "https://universalbrew.in/privacy-policy" },
  }
}

export default async function PrivacyPolicyPage() {
  const page = await getStaticPage("PRIVACY_POLICY")
  if (!page) notFound()
  return <StaticPageLayout title={page.title} content={page.content ?? null} />
}
