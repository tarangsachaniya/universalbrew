"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, ChevronRight, Menu, X, ShoppingCart } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { CartSheet } from "@/components/cart-sheet"
import { UserDropdown } from "@/components/user-dropdown"
import { useCart } from "@/lib/cart-context"

type Category = { id: string; name: string; slug: string; products?: { id: string; name: string; slug: string }[] }

type NavBarProps = {
  categories?: Category[]
  tickerVisible?: boolean
}

export function NavBar({ categories: initialCategories = [], tickerVisible = false }: NavBarProps) {
  const { data: session, status } = useSession()
  const [authOpen, setAuthOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { count } = useCart()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const isAuthenticated = status === "authenticated"
  const isAdmin = session?.user?.role === "ADMIN"
  const homeHref = pathname === "/" ? "#home" : "/"

  useEffect(() => { setCategories(initialCategories) }, [initialCategories])

  useEffect(() => {
    if (initialCategories.length > 0) return
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d))
      .catch(() => {})
  }, [initialCategories])

  const linkCls = "text-[0.7rem] tracking-[0.18em] uppercase text-white/70 hover:text-amber-300 transition-colors duration-200 no-underline"
  const sepCls = "text-white/25 select-none"

  return (
    <>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      <nav style={{
        position: "fixed",
        top: tickerVisible ? "calc(2.25rem + 1rem)" : "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.8rem 1.5rem",
        background: "rgba(15, 6, 0, 0.78)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: "8px",
        maxWidth: "90vw",
        width: "max-content",
        gap: "2.5rem",
        pointerEvents: "auto",
      }}>
        {/* Brand */}
        <Link href={homeHref} style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", fontWeight: 700, letterSpacing: "0.02em", color: "rgba(255,218,128,0.95)", textShadow: "0 0 40px rgba(200,140,50,0.35)", lineHeight: 1.1 }}>
            Universal Brew
          </div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: "2px", textAlign: "center" }}>
            The Coffee Masters
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <a href={homeHref} className={linkCls}>Home</a>

          {categories.length > 0 && (
            <>
              <span className={sepCls}>·</span>
              <div
                className="relative"
                onMouseEnter={() => setCatMenuOpen(true)}
                onMouseLeave={() => { setCatMenuOpen(false); setHoveredCat(null) }}
              >
                <button className={`${linkCls} flex items-center gap-1 bg-transparent border-none cursor-pointer p-0`}>
                  CATEGORIES
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${catMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {catMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 w-[700px]">
                    <div className="bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl w-full flex min-h-[300px] rounded-lg overflow-hidden text-left">
                      <div className="w-1/3 bg-white/5 border-r border-white/20 py-4 flex flex-col">
                        {categories.map((cat) => {
                          const isActive = (hoveredCat || categories[0]?.id) === cat.id
                          return (
                            <Link
                              key={cat.id}
                              href={`/categories/${cat.slug}`}
                              onMouseEnter={() => setHoveredCat(cat.id)}
                              onClick={() => { setCatMenuOpen(false); setHoveredCat(null) }}
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
                      <div className="w-2/3 p-8">
                        {(() => {
                          const activeCat = categories.find((c) => c.id === (hoveredCat || categories[0]?.id))
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
                                  {activeCat.products.map((p) => (
                                    <Link key={p.id} href={`/products/${p.slug}`} className="text-sm text-white/70 hover:text-amber-400 hover:underline transition-colors truncate">
                                      {p.name}
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-white/50">No products in this category.</p>
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

          <span className={sepCls}>·</span>
          {isAuthenticated ? (
            <UserDropdown name={session?.user?.name} isAdmin={isAdmin} />
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className={`${linkCls} bg-transparent cursor-pointer px-3 py-1`}
              style={{ border: "1px solid rgba(255,255,255,0.3)", borderRadius: "3px" }}
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Cart */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative text-white/70 hover:text-amber-300 bg-transparent border-none cursor-pointer"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span style={{
              position: "absolute", top: "-6px", right: "-6px",
              background: "rgba(251,191,36,0.95)", color: "#1a0900",
              fontSize: "0.6rem", fontWeight: 700, borderRadius: "999px",
              width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {count}
            </span>
          )}
        </button>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/70 hover:text-amber-300 bg-transparent border-none cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: "fixed",
          top: "4.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 49,
          background: "rgba(15, 6, 0, 0.92)",
          backdropFilter: "blur(12px)",
          borderRadius: "8px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          minWidth: "220px",
          maxWidth: "90vw",
        }}>
          <a href={homeHref} className={linkCls} onClick={() => setMobileOpen(false)}>Home</a>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className={linkCls} onClick={() => setMobileOpen(false)}>
              {cat.name}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {isAuthenticated ? (
              <>
                {isAdmin && <Link href="/admin" className={linkCls} onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
                <Link href="/account/profile" className={linkCls} onClick={() => setMobileOpen(false)}>My Profile</Link>
                <Link href="/account/orders" className={linkCls} onClick={() => setMobileOpen(false)}>My Orders</Link>
                <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }} className={`${linkCls} bg-transparent border-none cursor-pointer p-0 text-left`}>
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => { setMobileOpen(false); setAuthOpen(true) }} className={`${linkCls} bg-transparent border-none cursor-pointer p-0`}>
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
