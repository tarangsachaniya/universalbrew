import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/cache/pages"
import { Coffee } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return {}
  const desc = page.content?.slice(0, 160).replace(/\n/g, ' ') ?? `${page.title} — Universal Brew`
  return {
    title: page.title,
    description: desc,
    alternates: { canonical: `https://universalbrew.in/pages/${slug}` },
    openGraph: { title: `${page.title} | Universal Brew`, description: desc, url: `https://universalbrew.in/pages/${slug}` },
    twitter: { card: 'summary', title: page.title, description: desc },
  }
}

export default async function PublicPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  const paragraphs = (page.content ?? "").split(/\n\n+/).filter(Boolean)

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

        <div className="prose prose-amber max-w-none space-y-4">
          {paragraphs.map((para: string, i: number) => (
            <p key={i} className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>
      </div>
    </main>
  )
}
