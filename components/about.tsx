import { Sparkles, Dumbbell, Ban, Wheat, Coffee, Leaf } from "lucide-react"
import { DEFAULT_ABOUT_BODY, DEFAULT_ABOUT_TITLE, parseAboutFeatures } from "@/lib/about"

const FEATURE_ICONS = [Ban, Dumbbell, Sparkles, Wheat, Coffee, Leaf]

export function About({
  title,
  body,
  features,
}: {
  title?: string | null
  body?: string | null
  features?: unknown
}) {
  const displayTitle = title || DEFAULT_ABOUT_TITLE
  const displayParagraphs = (body || DEFAULT_ABOUT_BODY).split("\n\n").filter(Boolean)
  const displayFeatures = parseAboutFeatures(features).map((feature, index) => ({
    ...feature,
    icon: FEATURE_ICONS[index % FEATURE_ICONS.length],
  }))

  return (
    <section id="about" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-primary mb-4 text-balance">
            {displayTitle}
          </h2>
          <div className="flex items-center justify-center gap-2 my-6">
            <div className="h-px w-12 bg-primary/30" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Coffee key={i} className="h-3 w-3 text-primary" />
              ))}
            </div>
            <div className="h-px w-12 bg-primary/30" />
          </div>
          {displayParagraphs.map((para, i) => (
            <p key={i} className={`text-muted-foreground leading-relaxed ${i > 0 ? "mt-4" : ""}`}>
              {para}
            </p>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {displayFeatures.map((feature) => (
            <div
              key={feature.title}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
