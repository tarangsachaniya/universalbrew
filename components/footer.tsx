"use client"

import Link from "next/link"

type SocialLinks = {
  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
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

type PageLink = { id: string; title: string; slug: string }

type FooterProps = {
  data?: FooterData | null
  pages?: PageLink[]
}

function SocialIcon({ label }: { label: string }) {
  const icons: Record<string, string> = {
    facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    instagram: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M6.5 19.5h11a2 2 0 0 0 2-2v-11a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2z",
    linkedin: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    twitter: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
  }
  const d = icons[label] ?? ""
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export function Footer({ data, pages = [] }: FooterProps) {
  const companyName = data?.companyName ?? "Khyati & Sons Enterprise"
  const social = (data?.socialLinks ?? {}) as SocialLinks
  const hasSocial = social.facebook || social.instagram || social.linkedin || social.twitter

  return (
    <footer className="bg-secondary">
      {/* Info Row */}
      {data && (data.address || data.phone || data.email) && (
        <div className="py-6 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {data.address && <span>{data.address}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.email && (
                <a href={`mailto:${data.email}`} className="hover:text-primary transition-colors">
                  {data.email}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Social Icons */}
      {hasSocial && (
        <div className="py-4 border-b border-border">
          <div className="container mx-auto px-4 flex justify-center gap-4">
            {(["facebook", "instagram", "linkedin", "twitter"] as const).map((key) =>
              social[key] ? (
                <Link
                  key={key}
                  href={social[key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={key}
                >
                  <SocialIcon label={key} />
                </Link>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Footer Links — dynamic pages only */}
      {pages.length > 0 && (
        <div className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {pages.map((page, i) => (
                <>
                  {i > 0 && <span key={`sep-${i}`} className="text-border">|</span>}
                  <Link
                    key={page.id}
                    href={`/pages/${page.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {page.title}
                  </Link>
                </>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className="py-4 border-t border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Copyright © {new Date().getFullYear()}, {companyName}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
