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
  const val = Number(c.value)
  const min = c.minOrder ? Number(c.minOrder) : null
  const minText = min ? ` on orders above ₹${min.toFixed(0)}` : ""
  let discount = ""
  if (c.type === "PERCENT") discount = `Use ${c.code} — ${val}% off${minText}`
  else if (c.type === "FIXED") discount = `Use ${c.code} — ₹${val.toFixed(0)} off${minText}`
  else discount = `Use ${c.code} — Free delivery${minText}`
  return c.label ? `${c.label} · ${discount}` : discount
}

const SPAN_STYLE = {
  fontSize: "0.7rem",
  letterSpacing: "0.12em",
  color: "rgba(251,191,36,0.9)",
  textTransform: "uppercase",
  fontWeight: 500,
  flexShrink: 0,
}

export function CouponTicker({ coupons }: CouponTickerProps) {
  if (coupons.length === 0) return null

  const items = coupons.map(getCouponText)
  const duration = items.length * 8

  return (
    <div
      style={{
        width: "100%",
        background: "#1c0a00",
        borderBottom: "1px solid rgba(251,191,36,0.15)",
        overflow: "hidden",
        height: "2.25rem",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 60,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4rem",
          whiteSpace: "nowrap",
          willChange: "transform",
          animation: `ticker-scroll ${duration}s linear infinite`,
          height: "100%",
        }}
      >
        {/* Items repeated twice so the loop is seamless */}
        {[...items, ...items].map((text, i) => (
          <span key={i} style={SPAN_STYLE}>🏷 {text}</span>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
