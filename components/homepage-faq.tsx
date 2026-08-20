"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

type FaqItem = {
  question: string
  answer: string
}

type FaqAccordionProps = {
  items?: FaqItem[]
  title?: string
  subtitle?: string
  backgroundColor?: string
}

const HOME_FAQS: FaqItem[] = [
  {
    question: "What makes Universal Brew different from other instant coffees?",
    answer: "Universal Brew is crafted from 100% pure Arabica beans — the world's most prized coffee variety. Unlike most instant coffees that use cheaper Robusta blends, our Arabica beans deliver a naturally smooth, rich, and aromatic cup. We add no artificial flavours, no preservatives, and absolutely no sugar — just pure coffee, the way it should be.",
  },
  {
    question: "Where is the coffee sourced from?",
    answer: "We source our Arabica beans from select premium coffee-growing regions of India. Each batch is carefully selected for quality, ensuring consistent flavour and aroma. Our sourcing partners follow sustainable and ethical farming practices.",
  },
  {
    question: "How fresh is the coffee when it reaches me?",
    answer: "We roast and package in small batches to ensure maximum freshness. Your coffee is sealed immediately after processing to lock in aroma. We recommend consuming within 12 months of the manufacturing date, which you'll find on the packaging.",
  },
  {
    question: "How should I store my coffee?",
    answer: "Store your Universal Brew coffee in a cool, dry place away from direct sunlight, moisture, and strong odours. Keep the pouch/container tightly sealed after each use. Avoid refrigerating open packages — the humidity can affect flavour. A kitchen cupboard away from heat sources is ideal.",
  },
  {
    question: "What roast level should I choose?",
    answer: "If you enjoy a bright, nuanced cup with floral and fruity notes, go for a Light or Medium roast. If you prefer a bold, full-bodied coffee with deep caramel and chocolate undertones, a Medium-Dark or Dark roast is ideal. Our flavoured variants — Ginger, Masala, Cardamom, Cinnamon — pair beautifully with milk and are perfect for traditional Indian-style coffee.",
  },
  {
    question: "How long does delivery take?",
    answer: "We typically dispatch orders within 1–2 business days. Delivery within India generally takes 3–7 business days depending on your location. You'll receive a tracking number via email once your order ships.",
  },
]

function FaqItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        borderBottom: "1px solid",
        borderColor: "var(--border)",
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          padding: "1.4rem 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{
          fontSize: "1rem",
          fontWeight: 400,
          fontFamily: "var(--font-playfair), Georgia, serif",
          color: "var(--foreground)",
          lineHeight: 1.4,
          letterSpacing: "-0.005em",
        }}>
          {item.question}
        </span>
        <span style={{
          flexShrink: 0,
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: isOpen ? "var(--primary)" : "var(--border)",
          borderRadius: "50%",
          color: isOpen ? "var(--primary)" : "var(--muted-foreground)",
          transition: "border-color 0.2s ease, color 0.2s ease",
        }}>
          {isOpen ? <Minus size={12} /> : <Plus size={12} />}
        </span>
      </button>

      <div
        style={{
          overflow: "hidden",
          maxHeight: isOpen ? "500px" : "0",
          transition: "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <p style={{
          fontSize: "0.9rem",
          lineHeight: 1.75,
          color: "var(--muted-foreground)",
          paddingBottom: "1.4rem",
          maxWidth: "640px",
        }}>
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export function HomepageFaq({ items = HOME_FAQS, title, subtitle, backgroundColor }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <section
      id="faq"
      style={{
        padding: "6rem 0",
        background: backgroundColor || "var(--background)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem", alignItems: "start" }}>
          {/* Left: heading */}
          <div style={{ position: "sticky", top: "calc(var(--navbar-height, 4.5rem) + 2rem)" }}>
            <p style={{
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--primary)",
              fontWeight: 600,
              marginBottom: "1rem",
            }}>
              Questions & Answers
            </p>
            <h2 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
              marginBottom: "1.25rem",
            }}>
              {title ?? "Frequently Asked Questions"}
            </h2>
            {subtitle && (
              <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", lineHeight: 1.65 }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Right: accordion */}
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {items.map((item, i) => (
              <FaqItem
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile layout override */}
      <style>{`
        @media (max-width: 767px) {
          #faq > div > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          #faq > div > div > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </section>
  )
}
