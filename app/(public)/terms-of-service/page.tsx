import { notFound } from "next/navigation"
import { getStaticPage } from "@/lib/cache/static-pages"
import { Coffee } from "lucide-react"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("TERMS_OF_SERVICE")
  return {
    title: page?.title ?? "Terms of Service",
    description: "Terms and conditions for using Universal Brew.",
    alternates: { canonical: "https://universalbrew.in/terms-of-service" },
  }
}

export default async function TermsOfServicePage() {
  const page = await getStaticPage("TERMS_OF_SERVICE")
  if (!page) notFound()

  return (
    <main className="min-h-screen py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-primary mb-4">{page.title}</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-primary/30" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Coffee key={i} className="h-3 w-3 text-primary" />
              ))}
            </div>
            <div className="h-px w-12 bg-primary/30" />
          </div>
        </div>
        <div
          className="prose prose-amber max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
        />
      </div>
    </main>
  )
}
