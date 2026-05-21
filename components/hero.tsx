"use client"

import { useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import styles from "./hero.module.css"
import { getWebPUrl } from "@/lib/cloudinary-url"

export type HeroSlide = { url: string; mobileUrl?: string; title: string; subtitle: string }

type HeroData = {
  id: string
  slides: unknown
  youtubeUrls?: string[]
  active: boolean
}

type HeroProps = {
  data?: HeroData | null
}

const DEFAULT_SUBTITLE = "An original, pure, rich-creamy & aromatic coffee with incredible taste"

const STATIC_SLIDES: HeroSlide[] = [
  { url: "/images/img1.webp", title: "The Vessel", subtitle: "Heritage · Craft · Ritual" },
  { url: "/images/img2.webp", title: "The Bag", subtitle: "Where it all begins" },
  { url: "/images/img3.webp", title: "The Bloom", subtitle: "Nature awakens within" },
  { url: "/images/img4.webp", title: "The Release", subtitle: "Botanicals set free" },
  { url: "/images/img5.webp", title: "The Cup", subtitle: DEFAULT_SUBTITLE },
]

const TRANSITION_MS = 1100

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
  }))
}

export function Hero({ data }: HeroProps) {
  const parsed = data ? parseSlides(data.slides) : []
  const slides: HeroSlide[] = parsed.length > 0
    ? parsed.map((slide) => ({
        ...slide,
        url: getWebPUrl(slide.url),
        mobileUrl: slide.mobileUrl ? getWebPUrl(slide.mobileUrl) : undefined,
      }))
    : STATIC_SLIDES

  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const cur = useRef(0)
  const transitioning = useRef(false)
  const scrollLocked = useRef(false)
  const total = slides.length

  const goTo = useCallback(
    (nextIdx: number) => {
      if (transitioning.current) return
      if (nextIdx < 0 || nextIdx >= total || nextIdx === cur.current) return
      transitioning.current = true

      const prevEl = slideRefs.current[cur.current]
      const nextEl = slideRefs.current[nextIdx]
      if (!prevEl || !nextEl) return

      nextEl.style.transition = "none"
      nextEl.style.opacity = "0"
      nextEl.style.zIndex = "4"
      prevEl.style.zIndex = "3"
      nextEl.classList.remove(styles.active)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nextEl.classList.add(styles.active)
          nextEl.style.transition = `opacity ${TRANSITION_MS}ms ease`
          nextEl.style.opacity = "1"
          prevEl.style.transition = `opacity ${TRANSITION_MS}ms ease`
          prevEl.style.opacity = "0"
        })
      })

      setTimeout(() => {
        prevEl.style.transition = "none"
        prevEl.classList.remove(styles.active)
        prevEl.style.zIndex = "1"
        nextEl.style.transition = "none"
        nextEl.style.zIndex = "5"
        cur.current = nextIdx
        transitioning.current = false
      }, TRANSITION_MS + 80)
    },
    [total]
  )

  useEffect(() => {
    slideRefs.current.forEach((slide, index) => {
      if (!slide) return
      slide.style.transition = "none"
      slide.style.opacity = index === 0 ? "1" : "0"
      slide.style.zIndex = index === 0 ? "5" : "1"
      if (index === 0) slide.classList.add(styles.active)
    })
  }, [])

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const hero = document.getElementById("home")
      if (!hero) return
      const rect = hero.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return
      if (cur.current === total - 1) return
      event.preventDefault()
      if (scrollLocked.current || transitioning.current) return
      scrollLocked.current = true
      goTo(cur.current + 1)
      setTimeout(() => {
        scrollLocked.current = false
      }, TRANSITION_MS + 160)
    }

    let touchY = 0
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY
    }
    const onTouchEnd = (event: TouchEvent) => {
      const dy = Math.abs(touchY - event.changedTouches[0].clientY)
      if (dy < 50) return
      if (cur.current < total - 1) goTo(cur.current + 1)
    }
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) {
        goTo(cur.current + 1)
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    document.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
      document.removeEventListener("keydown", onKey)
    }
  }, [goTo, total])

  return (
    <section id="home" className={styles.root}>
      {slides.map((slide, index) => (
        <div
          key={index}
          ref={(el) => {
            slideRefs.current[index] = el
          }}
          className={styles.slide}
        >
          {/* Desktop image (16:9) — hidden on mobile when mobileUrl exists */}
          <Image
            src={slide.url}
            alt={slide.title}
            fill
            priority={index === 0}
            draggable={false}
            className={`${styles.slideImg} ${slide.mobileUrl ? "hidden sm:block" : ""}`}
          />
          {/* Mobile image (9:16) — shown only on small screens */}
          {slide.mobileUrl && (
            <Image
              src={slide.mobileUrl}
              alt={slide.title}
              fill
              priority={index === 0}
              draggable={false}
              className={`${styles.slideImg} block sm:hidden`}
            />
          )}
          <div className={styles.overlay} />
          <div className={styles.info}>
            <div className={styles.slideTitle}>{slide.title}</div>
            <div className={styles.slideSubtitle}>{slide.subtitle}</div>
          </div>
        </div>
      ))}
    </section>
  )
}
