"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, ChevronRight, Menu, X, ShoppingCart, Search, User } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { CartSheet } from "@/components/cart-sheet"
import { UserDropdown } from "@/components/user-dropdown"
import { Logo } from "@/components/logo"
import { useCart } from "@/lib/cart-context"

type Category = { id: string; name: string; slug: string; products?: { id: string; name: string; slug: string }[] }

type NavBarProps = {
  categories?: Category[]
  tickerVisible?: boolean
}

const NAV_LINKS = [
  { label: "Shop",          href: "/products" },
  { label: "Our Story",     href: "/about-us" },
]

export function NavBar({ categories: initialCategories = [], tickerVisible = false }: NavBarProps) {
  const { data: session, status } = useSession()
  const [authOpen,    setAuthOpen]    = useState(false)
  const [cartOpen,    setCartOpen]    = useState(false)
  const { count } = useCart()
  const [categories,  setCategories]  = useState<Category[]>(initialCategories)
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [hoveredCat,  setHoveredCat]  = useState<string | null>(null)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)
  const pathname  = usePathname()
  const isAuthenticated = status === "authenticated"
  const isAdmin = session?.user?.role === "ADMIN"
  const homeHref = pathname === "/" ? "#home" : "/"
  const tickerRef = useRef<HTMLDivElement | null>(null)

  /* ── Sync categories from SSR prop ─────────────────────────── */
  useEffect(() => { setCategories(initialCategories) }, [initialCategories])
  useEffect(() => {
    if (initialCategories.length > 0) return
    fetch("/api/categories").then(r => r.json()).then(d => Array.isArray(d) && setCategories(d)).catch(() => {})
  }, [initialCategories])

  /* ── Scroll awareness ───────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* ── Close mobile drawer on route change ────────────────────── */
  useEffect(() => { setMobileOpen(false) }, [pathname])

  /* ── Lock body scroll when mobile menu is open ──────────────── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const isHome = pathname === "/"
  const transparent = isHome && !scrolled

  /* ── Style tokens ───────────────────────────────────────────── */
  const navBg = transparent
    ? "bg-transparent border-transparent"
    : "bg-[rgba(12,5,0,0.88)] backdrop-blur-md border-white/10"

  const linkCls = `text-[0.62rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-200 ${
    transparent ? "text-white/80 hover:text-white" : "text-white/75 hover:text-amber-200"
  }`

  const iconCls = `transition-colors duration-200 cursor-pointer ${
    transparent ? "text-white/80 hover:text-white" : "text-white/75 hover:text-amber-200"
  }`

  return (
    <>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      {/* ── Desktop / Tablet Navbar ──────────────────────────────── */}
      <nav
        aria-label="Primary navigation"
        style={{
          position: "fixed",
          top: tickerVisible ? "calc(2.25rem + 0.5rem)" : 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
          borderBottom: "1px solid",
        }}
        className={navBg}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "var(--navbar-height, 4.5rem)",
          }}
        >
          {/* ── Logo ────────────────────────────────────────────── */}
          <Link href={homeHref} style={{ textDecoration: "none", flexShrink: 0 }} aria-label="Universal Brew home">
            <Logo variant="full" className={`h-8 w-auto transition-colors duration-200 ${transparent ? "text-white" : "text-amber-100"}`} />
          </Link>

          {/* ── Centre links (desktop) ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkCls}
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}

            {/* Categories mega-menu */}
            {categories.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setCatMenuOpen(true)}
                onMouseLeave={() => { setCatMenuOpen(false); setHoveredCat(null) }}
              >
                <button
                  className={`${linkCls} flex items-center gap-1 bg-transparent border-none cursor-pointer p-0`}
                  aria-expanded={catMenuOpen}
                  aria-haspopup="menu"
                >
                  Collections
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${catMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Mega-menu panel */}
                <div
                  role="menu"
                  aria-label="Collections menu"
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50 w-[640px] transition-all duration-200 ${
                    catMenuOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-2"
                  }`}
                >
                  <div className="bg-[rgba(12,5,0,0.94)] backdrop-blur-xl border border-white/15 shadow-2xl w-full flex min-h-[260px] overflow-hidden"
                    style={{ borderRadius: "2px" }}>
                    {/* Category list */}
                    <div className="w-[200px] shrink-0 border-r border-white/10 py-5 flex flex-col">
                      {categories.map((cat) => {
                        const isActive = (hoveredCat || categories[0]?.id) === cat.id
                        return (
                          <Link
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            role="menuitem"
                            onMouseEnter={() => setHoveredCat(cat.id)}
                            onClick={() => { setCatMenuOpen(false); setHoveredCat(null) }}
                            className={`px-6 py-2.5 text-[0.7rem] font-medium tracking-[0.14em] uppercase flex items-center justify-between transition-all duration-150 ${
                              isActive
                                ? "text-amber-300 bg-white/6 border-r-2 border-amber-400"
                                : "text-white/60 hover:text-white hover:bg-white/4"
                            }`}
                          >
                            {cat.name}
                            <ChevronRight className={`h-3 w-3 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
                          </Link>
                        )
                      })}
                    </div>

                    {/* Products panel */}
                    <div className="flex-1 p-7">
                      {(() => {
                        const activeCat = categories.find(c => c.id === (hoveredCat || categories[0]?.id))
                        if (!activeCat) return null
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-5">
                              <span className="text-[0.62rem] tracking-[0.2em] uppercase text-amber-400/80 font-semibold">
                                {activeCat.name}
                              </span>
                              <Link
                                href={`/categories/${activeCat.slug}`}
                                className="text-[0.6rem] tracking-widest uppercase text-white/40 hover:text-amber-300 transition-colors border-b border-white/20 hover:border-amber-300 pb-0.5"
                              >
                                View All →
                              </Link>
                            </div>
                            {activeCat.products && activeCat.products.length > 0 ? (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {activeCat.products.map((p) => (
                                  <Link
                                    key={p.id}
                                    href={`/products/${p.slug}`}
                                    className="text-[0.78rem] text-white/55 hover:text-white transition-colors truncate py-0.5 group flex items-center gap-1.5"
                                    onClick={() => setCatMenuOpen(false)}
                                  >
                                    <span className="w-1 h-1 rounded-full bg-amber-500/60 group-hover:bg-amber-400 transition-colors shrink-0" />
                                    {p.name}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-white/30 italic">No products in this category.</p>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right icons ──────────────────────────────────────── */}
          <div className="flex items-center gap-4">
            {/* Auth — desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <UserDropdown name={session?.user?.name} isAdmin={isAdmin} />
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className={`${iconCls} bg-transparent border-none p-1`}
                  aria-label="Sign in"
                >
                  <User className="h-[18px] w-[18px]" />
                </button>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className={`${iconCls} relative bg-transparent border-none p-1`}
              aria-label={`Cart — ${count} item${count !== 1 ? "s" : ""}`}
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    background: "rgb(217 119 6)", color: "#fff",
                    fontSize: "0.55rem", fontWeight: 700, borderRadius: "999px",
                    width: "14px", height: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {count}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden ${iconCls} bg-transparent border-none p-1`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen drawer ────────────────────────────── */}
      <div
        aria-hidden={!mobileOpen}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 49,
          background: "rgba(8, 3, 0, 0.97)",
          backdropFilter: "blur(16px)",
          display: "flex",
          flexDirection: "column",
          padding: "calc(var(--navbar-height, 4.5rem) + 2rem) 2rem 2.5rem",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: mobileOpen ? 1 : 0,
          transform: mobileOpen ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      >
        {/* Brand tagline */}
        <p className="text-[0.6rem] tracking-[0.25em] uppercase text-amber-400/60 mb-8">
          · The Coffee Masters ·
        </p>

        {/* Primary links */}
        <nav className="flex flex-col gap-1 mb-8">
          <a href={homeHref} onClick={() => setMobileOpen(false)}
            className="text-3xl font-serif font-light text-white/90 hover:text-amber-200 transition-colors py-2">
            Home
          </a>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="text-3xl font-serif font-light text-white/90 hover:text-amber-200 transition-colors py-2">
              {link.label}
            </Link>
          ))}
          {categories.map(cat => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} onClick={() => setMobileOpen(false)}
              className="text-3xl font-serif font-light text-white/90 hover:text-amber-200 transition-colors py-2">
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "1.5rem" }} />

        {/* Auth links */}
        <div className="flex flex-col gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="text-[0.65rem] tracking-[0.2em] uppercase text-amber-400/80 hover:text-amber-300 transition-colors">
                  Admin Panel
                </Link>
              )}
              <Link href="/account/profile" onClick={() => setMobileOpen(false)}
                className="text-[0.65rem] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors">
                My Profile
              </Link>
              <Link href="/account/orders" onClick={() => setMobileOpen(false)}
                className="text-[0.65rem] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors">
                My Orders
              </Link>
              <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }}
                className="text-left text-[0.65rem] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0">
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => { setMobileOpen(false); setAuthOpen(true) }}
              className="text-left text-[0.65rem] tracking-[0.2em] uppercase text-amber-400/80 hover:text-amber-300 transition-colors bg-transparent border-none cursor-pointer p-0">
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Cart button (mobile) */}
        <div className="mt-auto pt-6">
          <button
            onClick={() => { setMobileOpen(false); setCartOpen(true) }}
            className="flex items-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase text-white/60 hover:text-amber-200 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart{count > 0 && <span className="text-amber-400">({count})</span>}
          </button>
        </div>
      </div>
    </>
  )
}
