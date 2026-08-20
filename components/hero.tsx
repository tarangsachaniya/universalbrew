"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import styles from "./hero.module.css"
import { getWebPUrl } from "@/lib/cloudinary-url"
import { parseAboutFeatures } from "@/lib/about"

export type HeroSlide = {
  url: string
  mobileUrl?: string
  title: string
  subtitle: string
  ctaPrimaryText?: string
  ctaPrimaryHref?: string
  ctaSecondaryText?: string
  ctaSecondaryHref?: string
}

type HeroData = {
  id: string
  slides: unknown
  aboutFeatures?: unknown
  youtubeUrls?: string[]
  active: boolean
}

type HeroProps = {
  data?: HeroData | null
}

const STATIC_SLIDES: HeroSlide[] = [
  {
    url: "/images/img1.webp",
    title: "An Original, Pure, Rich-Creamy & Aromatic Coffee",
    subtitle: "100% pure Arabica instant coffee — no machine required.",
    ctaPrimaryText: "Shop Now",
    ctaPrimaryHref: "/products",
    ctaSecondaryText: "Our Story",
    ctaSecondaryHref: "/about-us",
  },
  {
    url: "/images/img2.webp",
    title: "Classic Indian Spice, Reinvented",
    subtitle: "Ginger, masala, cinnamon & cardamom — pure Arabica coffee with a twist.",
    ctaPrimaryText: "Explore Flavours",
    ctaPrimaryHref: "/products?category=flavoured-coffee",
    ctaSecondaryText: "Our Story",
    ctaSecondaryHref: "/about-us",
  },
]

function parseSlides(raw: unknown): HeroSlide[] {
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw
    .filter((s): s is HeroSlide => typeof s === "object" && s !== null && "url" in s && "title" in s)
    .map((s) => ({
      url:              s.url,
      mobileUrl:        s.mobileUrl ?? undefined,
      title:            s.title,
      subtitle:         s.subtitle ?? "",
      ctaPrimaryText:   s.ctaPrimaryText ?? undefined,
      ctaPrimaryHref:   s.ctaPrimaryHref ?? undefined,
      ctaSecondaryText: s.ctaSecondaryText ?? undefined,
      ctaSecondaryHref: s.ctaSecondaryHref ?? undefined,
    }))
}

function withCtaDefaults(slide: HeroSlide): HeroSlide {
  return {
    ...slide,
    ctaPrimaryText:   slide.ctaPrimaryText   || "Shop Now",
    ctaPrimaryHref:   slide.ctaPrimaryHref   || "/products",
    ctaSecondaryText: slide.ctaSecondaryText || "Our Story",
    ctaSecondaryHref: slide.ctaSecondaryHref || "/about-us",
  }
}

function pad(n: number) { return String(n).padStart(2, "0") }

export function Hero({ data }: HeroProps) {
  const parsed = data ? parseSlides(data.slides) : []
  const slides: HeroSlide[] = (parsed.length > 0
    ? parsed.map((s) => ({ ...s, url: getWebPUrl(s.url), mobileUrl: s.mobileUrl ? getWebPUrl(s.mobileUrl) : undefined }))
    : STATIC_SLIDES
  ).map(withCtaDefaults)

  // Determine trust features, but we don't necessarily display them directly in the hero slides anymore,
  // leaving parseAboutFeatures just in case it's used elsewhere or you want it back later.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const trustFeatures = parseAboutFeatures(data?.aboutFeatures).slice(0, 4)

  const [current, setCurrent] = useState(0)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const currentRef = useRef(0)

  /* ── Native Scroll-Driven Sequence ───────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current
    if (!el || slides.length <= 1) return

    const handleScroll = () => {
      // getBoundingClientRect().top is 0 when the top of the wrapper hits the top of the viewport
      // If the user scrolls down, .top becomes negative.
      const rect = el.getBoundingClientRect()
      
      // Distance scrolled into the hero section
      const scrolledIntoHero = -rect.top
      const viewportHeight = window.innerHeight
      
      // Number of viewports we have scrolled into the hero
      // Example: if we scrolled 1.5 viewports, we should be on slide index 1.
      const calculatedIndex = Math.floor(scrolledIntoHero / viewportHeight)
      
      // Clamp the index safely between 0 and the final slide
      const safeIndex = Math.max(0, Math.min(slides.length - 1, calculatedIndex))
      
      if (safeIndex !== currentRef.current) {
        currentRef.current = safeIndex
        setCurrent(safeIndex)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initialize in case we started mid-page

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [slides.length])

  const slide = slides[current]

  return (
    <section
      id="home"
      ref={sectionRef}
      // The wrapper height determines how long the hero sticks
      // 1 slide = 100vh. N slides = N * 100vh.
      style={{ height: `${slides.length * 100}vh`, width: "100%", background: "#0a0400" }}
    >
      <div 
        className={styles.root}
        // The actual visual hero remains pinned to the viewport
        style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden" }}
      >
        {/* ── Slide images (crossfade) ───────────────────────────── */}
        {slides.map((s, i) => (
          <div key={i} className={`${styles.slide} ${i === current ? styles.slideActive : ""}`}>
            {/* Desktop image */}
            <Image
              src={s.url}
              alt={s.title}
              fill
              priority={i === 0}
              draggable={false}
              className={`object-cover ${s.mobileUrl ? "hidden sm:block" : ""} ${styles.slideImg}`}
              sizes="100vw"
            />
            {/* Mobile image */}
            {s.mobileUrl && (
              <Image
                src={s.mobileUrl}
                alt={s.title}
                fill
                priority={i === 0}
                draggable={false}
                className={`object-cover block sm:hidden ${styles.slideImg}`}
                sizes="100vw"
              />
            )}
          </div>
        ))}

        {/* ── Localized text gradient (bottom only, behind text) ─── */}
        <div className={styles.textGradient} />

        {/* ── Content layer ─────────────────────────────────────── */}
        <div className={styles.content}>

          {/* Title & Subtitle */}
          {/* Key on `current` forces re-animation of content on slide change */}
          <div key={`content-${current}`} className={styles.titleIn} style={{ position: "relative", zIndex: 10 }}>
            <h1 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "white",
              maxWidth: "800px",
              marginBottom: "1rem",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)"
            }}>
              {slide?.title}
            </h1>
            
            <p style={{
              fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
              color: "rgba(255,255,255,0.85)",
              maxWidth: "600px",
              lineHeight: 1.6,
              marginBottom: "2rem",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)"
            }}>
              {slide?.subtitle}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
              {slide?.ctaPrimaryHref && (
                <Link
                  href={slide.ctaPrimaryHref}
                  style={{
                    background: "rgba(251, 191, 36, 0.9)",
                    color: "#000",
                    padding: "0.75rem 2rem",
                    fontSize: "0.75rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                  className="hover:bg-amber-400"
                >
                  {slide.ctaPrimaryText}
                  <ArrowRight size={14} />
                </Link>
              )}
              {slide?.ctaSecondaryHref && (
                <Link
                  href={slide.ctaSecondaryHref}
                  style={{
                    background: "transparent",
                    color: "white",
                    padding: "0.75rem 2rem",
                    fontSize: "0.75rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.3)",
                    transition: "all 0.2s ease"
                  }}
                  className="hover:border-amber-400 hover:text-amber-400"
                >
                  {slide.ctaSecondaryText}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
