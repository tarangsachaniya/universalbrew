import { Coffee } from "lucide-react"

type Props = {
  title: string
  content: string | null
}

export function StaticPageLayout({ title, content }: Props) {
  return (
    <main className="min-h-screen bg-background">
      {/* Warm header */}
      <div className="border-b border-amber-100/60 dark:border-amber-900/20 bg-gradient-to-b from-amber-50/70 to-background dark:from-amber-950/20 dark:to-background">
        <div className="container mx-auto px-4 max-w-3xl pt-16 pb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-10 bg-primary/30" />
            <Coffee className="h-4 w-4 text-primary/50" />
            <div className="h-px w-10 bg-primary/30" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-3xl py-12">
        <div
          className="prose prose-sm md:prose-base prose-amber max-w-none
            prose-headings:font-serif prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-li:text-muted-foreground prose-li:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-hr:border-border/50"
          dangerouslySetInnerHTML={{ __html: content ?? "" }}
        />
      </div>
    </main>
  )
}
