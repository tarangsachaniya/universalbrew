"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

type FaqItem = {
  question: string
  answer: string
}

type ProductFaqProps = {
  faqs: FaqItem[]
}

function FaqRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          padding: "1.2rem 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{
          fontSize: "0.92rem",
          fontWeight: 400,
          fontFamily: "var(--font-playfair), Georgia, serif",
          color: "var(--foreground)",
          lineHeight: 1.4,
        }}>
          {item.question}
        </span>
        <span style={{
          flexShrink: 0,
          width: "22px",
          height: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: isOpen ? "var(--primary)" : "var(--border)",
          borderRadius: "50%",
          color: isOpen ? "var(--primary)" : "var(--muted-foreground)",
          transition: "border-color 0.2s ease, color 0.2s ease",
        }}>
          {isOpen ? <Minus size={11} /> : <Plus size={11} />}
        </span>
      </button>

      <div style={{
        overflow: "hidden",
        maxHeight: isOpen ? "400px" : "0",
        transition: "max-height 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
        <p style={{
          fontSize: "0.875rem",
          lineHeight: 1.75,
          color: "var(--muted-foreground)",
          paddingBottom: "1.2rem",
        }}>
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export function ProductFaq({ faqs }: ProductFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (!faqs || faqs.length === 0) return null

  return (
    <section
      aria-label="Frequently Asked Questions"
      style={{
        marginTop: "4rem",
        paddingTop: "3rem",
        borderTop: "1px solid var(--border)",
      }}
    >
      <h2 style={{
        fontFamily: "var(--font-playfair), Georgia, serif",
        fontSize: "1.5rem",
        fontWeight: 400,
        color: "var(--foreground)",
        marginBottom: "1.5rem",
        letterSpacing: "-0.01em",
      }}>
        Frequently Asked Questions
      </h2>

      <div style={{ borderTop: "1px solid var(--border)" }}>
        {faqs.map((item, i) => (
          <FaqRow
            key={i}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(prev => prev === i ? null : i)}
          />
        ))}
      </div>
    </section>
  )
}
