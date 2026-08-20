'use client'

import { usePathname } from 'next/navigation'

/**
 * Adds paddingTop to compensate for the fixed navbar on non-hero pages.
 * The homepage (/) manages its own padding (hero is full-screen).
 * Product detail pages also handle their own paddingTop via inline style.
 * This wrapper handles remaining pages: categories, account, checkout, etc.
 */
export function PaddingWrapper({ children, hasCoupons }: { children: React.ReactNode; hasCoupons: boolean }) {
  const pathname = usePathname()

  // These pages manage their own top padding
  const selfPadded = pathname === '/' || /^\/products(\/[^/]+)?$/.test(pathname)

  if (selfPadded) {
    return <>{children}</>
  }

  const tickerHeight = hasCoupons ? '2.25rem' : '0px'
  const paddingTop   = `calc(var(--navbar-height, 4.5rem) + ${tickerHeight})`

  return <div style={{ paddingTop }}>{children}</div>
}
