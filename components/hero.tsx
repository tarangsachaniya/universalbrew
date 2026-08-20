"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
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

const AUTOPLAY_MS = 6000

function parseSlides(raw: unknown): HeroSlide[] {
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw.filter(
    (slide): slide is HeroSlide =>
      typeof slide === "object" && slide !== null && "url" in slide && "title" in slide
  ).map((slide) => ({
    url: slide.url,
    mobileUrl: slide.mobileUrl ?? undefined,
    title: slide.title,
    subtitle: slide.subtitle ?? "",
    ctaPrimaryText: slide.ctaPrimaryText ?? undefined,
    ctaPrimaryHref: slide.ctaPrimaryHref ?? undefined,
    ctaSecondaryText: slide.ctaSecondaryText ?? undefined,
    ctaSecondaryHref: slide.ctaSecondaryHref ?? undefined,
  }))
}

/** Applies sitewide CTA defaults for slides that predate this feature (or the static fallback). */
function withCtaDefaults(slide: HeroSlide): HeroSlide {
  const hasPrimary = slide.ctaPrimaryText || slide.ctaPrimaryHref
  const hasSecondary = slide.ctaSecondaryText || slide.ctaSecondaryHref
  return {
    ...slide,
    ctaPrimaryText: hasPrimary ? slide.ctaPrimaryText : "Shop Now",
    ctaPrimaryHref: hasPrimary ? slide.ctaPrimaryHref : "/products",
    ctaSecondaryText: hasSecondary ? slide.ctaSecondaryText : "Our Story",
    ctaSecondaryHref: hasSecondary ? slide.ctaSecondaryHref : "/about-us",
  }
}

export function Hero({ data }: HeroProps) {
  const parsed = data ? parseSlides(data.slides) : []
  const slides: HeroSlide[] = (parsed.length > 0
    ? parsed.map((slide) => ({
        ...slide,
        url: getWebPUrl(slide.url),
        mobileUrl: slide.mobileUrl ? getWebPUrl(slide.mobileUrl) : undefined,
      }))
    : STATIC_SLIDES
  ).map(withCtaDefaults)

  const trustFeatures = parseAboutFeatures(data?.aboutFeatures).slice(0, 3)

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  useEffect(() => {
    if (!api || slides.length <= 1) return
    const id = setInterval(() => api.scrollNext(), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [api, slides.length])

  const scrollToContent = () => {
    const hero = document.getElementById("home")
    if (hero) window.scrollTo({ top: hero.offsetTop + hero.offsetHeight, behavior: "smooth" })
  }

  return (
    <section id="home" className={`relative h-screen w-full overflow-hidden bg-black ${styles.root}`}>
      <Carousel setApi={setApi} opts={{ loop: true }} className="h-full w-full">
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="relative h-full w-full pl-0">
              {/* Desktop image (16:9) — hidden on mobile when mobileUrl exists */}
              <Image
                src={slide.url}
                alt={slide.title}
                fill
                priority={index === 0}
                draggable={false}
                className={`object-cover ${index === current ? styles.kenBurns : ""} ${slide.mobileUrl ? "hidden sm:block" : ""}`}
              />
              {/* Mobile image (9:16) — shown only on small screens */}
              {slide.mobileUrl && (
                <Image
                  src={slide.mobileUrl}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  draggable={false}
                  className={`object-cover block sm:hidden ${index === current ? styles.kenBurns : ""}`}
                />
              )}
              <div className={styles.overlay} />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 text-white">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium max-w-3xl leading-tight">
                  {slide.title}
                </h1>
                <p className="mt-4 font-sans text-base sm:text-lg text-white/85 max-w-xl">
                  {slide.subtitle}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={slide.ctaPrimaryHref ?? "/products"}>{slide.ctaPrimaryText ?? "Shop Now"}</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="w-full sm:w-auto text-white hover:text-white hover:bg-white/10"
                  >
                    <Link href={slide.ctaSecondaryHref ?? "/about-us"}>{slide.ctaSecondaryText ?? "Our Story"}</Link>
                  </Button>
                </div>
                {trustFeatures.length > 0 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm uppercase tracking-wider text-white/80">
                    {trustFeatures.map((feature, i) => (
                      <span key={feature.title} className="flex items-center gap-4">
                        {i > 0 && <span className="text-white/40">·</span>}
                        {feature.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <button
        onClick={scrollToContent}
        className={styles.scrollArrow}
        aria-label="Scroll to content"
      >
        <ChevronDown size={32} strokeWidth={1.5} />
      </button>
    </section>
  )
}
