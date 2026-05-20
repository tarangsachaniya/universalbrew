"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, ShoppingCart, Heart, ChevronDown, ChevronRight } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { CartSheet } from "@/components/cart-sheet"
import { useCart } from "@/lib/cart-context"

type Category = { id: string; name: string; slug: string; products?: { id: string; name: string; slug: string }[] }
type SocialLinks = { facebook?: string; instagram?: string; linkedin?: string; twitter?: string }

type HeaderProps = {
  socialLinks?: SocialLinks
  categories?: Category[]
}

function SocialIcon({ label }: { label: string }) {
  const paths: Record<string, string> = {
    facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    instagram: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M6.5 19.5h11a2 2 0 0 0 2-2v-11a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2z",
    linkedin: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    twitter: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[label] ?? ""} />
    </svg>
  )
}

export function Header({ socialLinks = {}, categories: initialCategories = [] }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHero, setIsHero] = useState(true)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [authOpen, setAuthOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { count } = useCart()
  const isHome = pathname === "/"
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

  useEffect(() => {
    if (!isHome) {
      setIsHero(false)
      return
    }
    const hero = document.getElementById("home")
    if (!hero) {
      setIsHero(false)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsHero(entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [isHome])

  const textCls = isHero ? "text-white/80 hover:text-amber-300" : "text-white/70 hover:text-amber-300"
  const homeLinks = [{ href: "#home", label: "HOME" }]
  const otherLinks = [{ href: "/", label: "HOME" }]
  const navLinks = isHome ? homeLinks : otherLinks
  const hasSocial = Object.values(socialLinks).some(Boolean)

  return (
    <>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 backdrop-blur border-b border-white/10 ${
          isHero ? "opacity-0 pointer-events-none -translate-y-full" : "opacity-100 translate-y-0"
        }`}
        style={{ backgroundColor: "rgba(20, 12, 6, 0.95)" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="shrink-0">
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold font-serif tracking-tight transition-colors duration-500 text-amber-300">
                  Universal Brew
                </span>
                <span className="text-[9px] tracking-[0.2em] uppercase transition-colors duration-500 text-white/50">
                  The Coffee Masters
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-5 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors duration-500 ${textCls}`}>
                  {link.label}
                </Link>
              ))}

              {categories.length > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setCatMenuOpen(true)}
                  onMouseLeave={() => {
                    setCatMenuOpen(false)
                    setHoveredCat(null)
                  }}
                >
                  <button className={`flex items-center gap-1 text-sm font-medium transition-colors duration-500 ${textCls}`}>
                    CATEGORIES <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${catMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {catMenuOpen && (
                    <div className="absolute top-full -left-48 pt-2 z-50 w-[700px]">
                      <div className="bg-background border border-border shadow-2xl w-full flex min-h-[300px]">
                        <div className="w-1/3 bg-muted/30 border-r border-border py-4 flex flex-col">
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
                                  isActive ? "text-primary bg-background border-r-2 border-primary font-medium" : "text-foreground/80 hover:text-primary hover:bg-muted/50"
                                }`}
                              >
                                {cat.name}
                                <ChevronRight className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-0"}`} />
                              </Link>
                            )
                          })}
                        </div>

                        <div className="w-2/3 p-8 bg-background">
                          {(() => {
                            const activeCat = categories.find((cat) => cat.id === (hoveredCat || categories[0]?.id))
                            if (!activeCat) return null

                            return (
                              <div>
                                <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-lg font-serif font-bold text-foreground">{activeCat.name}</h3>
                                  <Link href={`/categories/${activeCat.slug}`} className="text-xs font-medium text-primary hover:underline">
                                    View Category
                                  </Link>
                                </div>
                                {activeCat.products && activeCat.products.length > 0 ? (
                                  <div className="grid grid-cols-2 gap-4">
                                    {activeCat.products.map((product) => (
                                      <Link key={product.id} href={`/products/${product.slug}`} className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors truncate">
                                        {product.name}
                                      </Link>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No products found in this category.</p>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {hasSocial && (
                <div className="hidden lg:flex items-center gap-2 transition-colors duration-500 text-white/50">
                  {(["facebook", "instagram", "linkedin", "twitter"] as const).map((key) =>
                    socialLinks[key] ? (
                      <Link
                        key={key}
                        href={socialLinks[key]!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors ${isHero ? "hover:text-amber-300" : "hover:text-primary"}`}
                        aria-label={key}
                      >
                        <SocialIcon label={key} />
                      </Link>
                    ) : null
                  )}
                </div>
              )}

              <button className={`relative transition-colors duration-500 ${textCls}`} aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">0</span>
              </button>

              <button
                className={`relative transition-colors duration-500 ${textCls}`}
                aria-label="Cart"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Link href="/admin" className={`text-sm font-medium transition-colors duration-500 ${textCls}`}>
                      ADMIN
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: "/" })} className={`text-sm font-medium transition-colors duration-500 ${textCls}`}>
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button onClick={() => setAuthOpen(true)} className={`text-sm font-medium transition-colors duration-500 ${textCls}`}>
                  LOGIN
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden transition-colors duration-500 text-white"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={`text-sm font-medium ${textCls}`} onClick={() => setIsMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <Link href="/categories" className={`text-sm font-medium ${textCls}`} onClick={() => setIsMenuOpen(false)}>
                  ALL CATEGORIES
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`} className={`text-sm font-medium pl-4 ${textCls}`} onClick={() => setIsMenuOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
                {hasSocial && (
                  <div className={`flex gap-3 pt-1 ${isHero ? "text-white/60" : "text-muted-foreground"}`}>
                    {(["facebook", "instagram", "linkedin", "twitter"] as const).map((key) =>
                      socialLinks[key] ? (
                        <Link key={key} href={socialLinks[key]!} target="_blank" rel="noopener noreferrer" aria-label={key}>
                          <SocialIcon label={key} />
                        </Link>
                      ) : null
                    )}
                  </div>
                )}
                {!isAuthenticated ? (
                  <button onClick={() => { setIsMenuOpen(false); setAuthOpen(true) }} className={`text-sm font-medium text-left ${textCls}`}>
                    LOGIN
                  </button>
                ) : (
                  <button onClick={() => signOut({ callbackUrl: "/" })} className={`text-sm font-medium text-left ${textCls}`}>
                    SIGN OUT
                  </button>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
