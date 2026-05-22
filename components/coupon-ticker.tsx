"use client"

type Coupon = {
  id: string
  code: string
  type: "PERCENT" | "FIXED" | "FREE_DELIVERY"
  value: number | { toNumber(): number }
  label: string | null
  minOrder: number | { toNumber(): number } | null
}

type CouponTickerProps = {
  coupons: Coupon[]
}

function getCouponText(c: Coupon): string {
  if (c.label) return c.label
  const val = Number(c.value)
  const min = c.minOrder ? Number(c.minOrder) : null
  const minText = min ? ` on orders above ₹${min.toFixed(0)}` : ""
  if (c.type === "PERCENT") return `Use ${c.code} — ${val}% off${minText}`
  if (c.type === "FIXED") return `Use ${c.code} — ₹${val.toFixed(0)} off${minText}`
  return `Use ${c.code} — Free delivery${minText}`
}

export function CouponTicker({ coupons }: CouponTickerProps) {
  if (coupons.length === 0) return null

  const items = coupons.map(getCouponText)
  // Duplicate items for seamless loop
  const allItems = [...items, ...items]

  return (
    <div
      style={{
        width: "100%",
        background: "#1c0a00",
        borderBottom: "1px solid rgba(251,191,36,0.15)",
        overflow: "hidden",
        height: "2.25rem",
        display: "flex",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "4rem",
          whiteSpace: "nowrap",
          animation: `ticker-scroll ${items.length * 8}s linear infinite`,
          willChange: "transform",
        }}
      >
        {allItems.map((text, i) => (
          <span
            key={i}
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              color: "rgba(251,191,36,0.9)",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            🏷 {text}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
