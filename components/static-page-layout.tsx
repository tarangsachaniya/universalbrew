import { Coffee } from "lucide-react"

type Props = {
  title: string
  content: string | null
}

export function StaticPageLayout({ title, content }: Props) {
  return (
    <main className="min-h-screen bg-background">
      {/* ── Premium Editorial Header ─────────────────────────── */}
      <div 
        style={{
          borderBottom: "1px solid var(--border)",
          paddingTop: "4rem",
          paddingBottom: "3rem",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--primary)",
            fontWeight: 600,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            · Information <Coffee size={12} style={{ opacity: 0.8 }} />
          </p>
          <h1 style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "var(--foreground)",
            margin: 0,
          }}>
            {title}
          </h1>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem 6rem" }}>
        <div
          className="prose prose-sm md:prose-base prose-amber max-w-none
            prose-headings:font-serif prose-headings:text-foreground prose-headings:font-normal prose-headings:tracking-tight
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
            prose-li:text-muted-foreground prose-li:leading-relaxed
            prose-a:text-primary prose-a:underline hover:prose-a:opacity-80
            prose-strong:text-foreground prose-strong:font-semibold
            prose-hr:border-border/50"
          style={{
            fontSize: "0.95rem",
            lineHeight: 1.75,
            color: "var(--muted-foreground)",
          }}
          dangerouslySetInnerHTML={{ __html: content ?? "" }}
        />
      </div>
    </main>
  )
}
