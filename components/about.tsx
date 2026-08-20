import { Sparkles, Dumbbell, Ban, Wheat, Coffee, Leaf } from "lucide-react"
import { DEFAULT_ABOUT_BODY, DEFAULT_ABOUT_TITLE, parseAboutFeatures } from "@/lib/about"
import { SectionHeading } from "@/components/section-heading"

const FEATURE_ICON_MAP: Record<string, typeof Ban> = {
  "No Artificial Flavours": Ban,
  "Keto Friendly": Dumbbell,
  "No Added Sugar": Sparkles,
  "Gluten-Free": Wheat,
  "No Machines Required": Coffee,
  "100% Pure Coffee": Leaf,
}
const FALLBACK_ICON = Coffee

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
  const displayFeatures = parseAboutFeatures(features).map((feature) => ({
    ...feature,
    icon: FEATURE_ICON_MAP[feature.title] ?? FALLBACK_ICON,
  }))

  return (
    <section id="about" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionHeading
            title={displayTitle}
            headingClassName="lg:text-5xl text-balance"
          />
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
