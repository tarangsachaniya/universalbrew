"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"

type SocialLinks = {
  facebook?:  string
  instagram?: string
  linkedin?:  string
  twitter?:   string
}

type FooterData = {
  id: string
  companyName: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  socialLinks?: unknown
}

type FooterProps = {
  data?: FooterData | null
}

const SHOP_LINKS = [
  { href: "/products",  label: "All Products" },
  { href: "/categories", label: "Collections" },
]

const INFO_LINKS = [
  { href: "/about-us",         label: "About Us" },
  { href: "/shipping-policy",  label: "Shipping Policy" },
  { href: "/refund-policy",    label: "Refund Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy",   label: "Privacy Policy" },
]

function SvgIcon({ label }: { label: string }) {
  const paths: Record<string, string> = {
    facebook:  "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    instagram: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M6.5 19.5h11a2 2 0 0 0 2-2v-11a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2z",
    linkedin:  "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    twitter:   "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[label] ?? ""} />
    </svg>
  )
}

export function Footer({ data }: FooterProps) {
  const companyName = data?.companyName ?? "Khyati & Sons Enterprise"
  const social = (data?.socialLinks ?? {}) as SocialLinks
  const hasSocial = social.facebook || social.instagram || social.linkedin || social.twitter

  const linkStyle: React.CSSProperties = {
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    transition: "color 0.2s ease",
    lineHeight: 1.8,
  }

  return (
    <footer style={{ background: "var(--espresso, #140800)", color: "#fff" }}>

      {/* ── Main footer grid ──────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "4rem", padding: "5rem 0 4rem" }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Logo variant="full" className="h-9 w-auto text-amber-100 mb-5" />
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.75, maxWidth: "320px", marginBottom: "2rem" }}>
              {data?.description ?? "Premium 100% Arabica instant coffee from the heart of India. No machines, no compromise — just pure, aromatic coffee."}
            </p>
            {hasSocial && (
              <div style={{ display: "flex", gap: "1rem" }}>
                {(["facebook", "instagram", "linkedin", "twitter"] as const).map(key =>
                  social[key] ? (
                    <Link
                      key={key}
                      href={social[key]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      style={{
                        width: "32px", height: "32px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.45)",
                        transition: "border-color 0.2s, color 0.2s",
                        borderRadius: "50%",
                      }}
                    >
                      <SvgIcon label={key} />
                    </Link>
                  ) : null
                )}
              </div>
            )}
          </div>

          {/* Shop links */}
          <div>
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: "rgba(255,255,255,0.28)", marginBottom: "1.25rem" }}>
              Shop
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {SHOP_LINKS.map(l => (
                <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Info links */}
          <div>
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: "rgba(255,255,255,0.28)", marginBottom: "1.25rem" }}>
              Information
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {INFO_LINKS.map(l => (
                <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Contact bar ────────────────────────────────────── */}
        {data && (data.address || data.phone || data.email) && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem 2.5rem",
            padding: "1.5rem 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.35)",
          }}>
            {data.address && <span>{data.address}</span>}
            {data.phone   && <span>{data.phone}</span>}
            {data.email   && (
              <a href={`mailto:${data.email}`} style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
                {data.email}
              </a>
            )}
          </div>
        )}

        {/* ── Copyright row ──────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.18)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Premium Indian Coffee
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            padding: 3.5rem 0 3rem !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        footer a:hover { color: rgba(255,255,255,0.85) !important; }
      `}</style>
    </footer>
  )
}
