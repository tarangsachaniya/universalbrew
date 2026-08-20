import { Sparkles, Dumbbell, Ban, Wheat, Coffee, Leaf } from "lucide-react"
import { DEFAULT_ABOUT_BODY, DEFAULT_ABOUT_TITLE, parseAboutFeatures } from "@/lib/about"

const FEATURE_ICON_MAP: Record<string, typeof Ban> = {
  "No Artificial Flavours": Ban,
  "Keto Friendly":          Dumbbell,
  "No Added Sugar":         Sparkles,
  "Gluten-Free":            Wheat,
  "No Machines Required":   Coffee,
  "100% Pure Coffee":       Leaf,
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
  const displayTitle     = title || DEFAULT_ABOUT_TITLE
  const displayParagraphs = (body || DEFAULT_ABOUT_BODY).split("\n\n").filter(Boolean)
  const displayFeatures  = parseAboutFeatures(features).map((f) => ({
    ...f,
    icon: FEATURE_ICON_MAP[f.title] ?? FALLBACK_ICON,
  }))

  return (
    <section id="about" style={{ padding: "6rem 0", background: "var(--parchment, #faf8f5)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>

        {/* ── Editorial header ──────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          marginBottom: "5rem",
          alignItems: "end",
        }}
          className="about-header-grid"
        >
          <div>
            <p style={{
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--primary)",
              fontWeight: 600,
              marginBottom: "1.25rem",
            }}>
              · Our Craft
            </p>
            <h2 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
            }}>
              {displayTitle}
            </h2>
          </div>
          <div>
            {displayParagraphs.map((para, i) => (
              <p key={i} style={{
                fontSize: "0.95rem",
                lineHeight: 1.78,
                color: "var(--muted-foreground)",
                marginBottom: i < displayParagraphs.length - 1 ? "1rem" : 0,
              }}>
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* ── Features ─────────────────────────────────────────── */}
        {displayFeatures.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0",
            borderTop: "1px solid var(--border)",
          }}
            className="features-grid"
          >
            {displayFeatures.map((feature, i) => (
              <div
                key={feature.title}
                style={{
                  padding: "2.5rem 2rem",
                  borderRight: i % 3 !== 2 ? "1px solid var(--border)" : "none",
                  transition: "background 0.2s ease",
                }}
                className="feature-item"
              >
                <feature.icon
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "var(--primary)",
                    marginBottom: "1rem",
                    strokeWidth: 1.5,
                  }}
                />
                <h3 style={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.01em",
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: "0.82rem",
                  color: "var(--muted-foreground)",
                  lineHeight: 1.65,
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .about-header-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            margin-bottom: 3rem !important;
          }
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .feature-item {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .feature-item:nth-child(2n) {
            border-right: none !important;
          }
        }
        .feature-item:hover {
          background: var(--secondary);
        }
      `}</style>
    </section>
  )
}
