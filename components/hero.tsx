"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, ChevronRight } from "lucide-react"
import styles from "./hero.module.css"
import { getWebPUrl } from "@/lib/cloudinary-url"
import { AuthModal } from "@/components/auth-modal"

export type HeroSlide = { url: string; title: string; subtitle: string }
type Category = { id: string; name: string; slug: string; products?: { id: string; name: string; slug: string }[] }
type PageLink = { id: string; title: string; slug: string }

type HeroData = {
  id: string
  slides: unknown
  youtubeUrls?: string[]
  active: boolean
}

type HeroProps = {
  data?: HeroData | null
  pages?: PageLink[]
  categories?: Category[]
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
  )
}

export function Hero({ data, pages = [], categories: initialCategories = [] }: HeroProps) {
  const parsed = data ? parseSlides(data.slides) : []
  const slides: HeroSlide[] = parsed.length > 0
    ? parsed.map((slide) => ({ ...slide, url: getWebPUrl(slide.url) }))
    : STATIC_SLIDES

  const { data: session, status } = useSession()
  const [authOpen, setAuthOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const cur = useRef(0)
  const transitioning = useRef(false)
  const scrollLocked = useRef(false)
  const total = slides.length
  const isAuthenticated = status === "authenticated"
  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  useEffect(() => {
    if (initialCategories.length > 0) return
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d))
      .catch(() => {})
  }, [initialCategories])

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
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />

      <nav className={styles.heroNav}>
        <div className={styles.brandMark}>
          <div className={styles.brandName}>Universal Brew</div>
          <div className={styles.brandSub}>The Coffee Masters</div>
        </div>
        <div className={styles.heroNavLinks}>
          <a href="#home" className={styles.heroNavLink}>Home</a>
          {categories.length > 0 && (
            <>
              <span className={styles.heroNavSep} aria-hidden>·</span>
              <div
                className="relative"
                onMouseEnter={() => setCatMenuOpen(true)}
                onMouseLeave={() => {
                  setCatMenuOpen(false)
                  setHoveredCat(null)
                }}
              >
                <button className={`${styles.heroNavLink} flex items-center gap-1`}>
                  CATEGORIES <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${catMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {catMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 w-[700px]">
                    <div className="bg-black/80 backdrop-blur-md border border-white/20 shadow-2xl w-full flex min-h-[300px] rounded-lg overflow-hidden text-left">
                      <div className="w-1/3 bg-white/5 border-r border-white/20 py-4 flex flex-col">
                        {categories.map((cat) => {
                          const isActive = (hoveredCat || categories[0]?.id) === cat.id
                          return (
                            <Link
                              key={cat.id}
                              href={`/categories/${cat.slug}`}
                              onMouseEnter={() => setHoveredCat(cat.id)}
                              onClick={() => {
                                setCatMenuOpen(false)
                                setHoveredCat(null)
                              }}
                              className={`px-6 py-3 text-sm flex items-center justify-between transition-colors ${
                                isActive ? "text-amber-400 bg-white/10 border-r-2 border-amber-400 font-medium" : "text-white/80 hover:text-amber-400 hover:bg-white/5"
                              }`}
                            >
                              {cat.name}
                              <ChevronRight className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-0"}`} />
                            </Link>
                          )
                        })}
                      </div>

                      <div className="w-2/3 p-8 bg-transparent">
                        {(() => {
                          const activeCat = categories.find((cat) => cat.id === (hoveredCat || categories[0]?.id))
                          if (!activeCat) return null

                          return (
                            <div>
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-serif font-bold text-white">{activeCat.name}</h3>
                                <Link href={`/categories/${activeCat.slug}`} className="text-xs font-medium text-amber-400 hover:underline">
                                  View Category
                                </Link>
                              </div>
                              {activeCat.products && activeCat.products.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                  {activeCat.products.map((product) => (
                                    <Link key={product.id} href={`/products/${product.slug}`} className="text-sm text-white/70 hover:text-amber-400 hover:underline transition-colors truncate">
                                      {product.name}
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-white/50">No products found in this category.</p>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {pages.map((page) => (
            <div key={page.id} className="flex items-center">
              <span className={styles.heroNavSep} aria-hidden>·</span>
              <Link href={`/pages/${page.slug}`} className={styles.heroNavLink}>
                {page.title.toUpperCase()}
              </Link>
            </div>
          ))}

          <span className={styles.heroNavSep} aria-hidden>·</span>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <>
                  <Link href="/admin" className={styles.heroNavLink}>Admin</Link>
                  <span className={styles.heroNavSep} aria-hidden>·</span>
                </>
              )}
              <button onClick={() => signOut({ callbackUrl: "/" })} className={styles.heroNavBtn}>
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => setAuthOpen(true)} className={`${styles.heroNavBtn} ${styles.heroNavBtnOutline}`}>
              Login / Sign Up
            </button>
          )}
        </div>
      </nav>

      {slides.map((slide, index) => (
        <div
          key={index}
          ref={(el) => {
            slideRefs.current[index] = el
          }}
          className={styles.slide}
        >
          <Image
            src={slide.url}
            alt={slide.title}
            fill
            priority={index === 0}
            draggable={false}
            className={styles.slideImg}
          />
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
