'use client'

import { usePathname } from 'next/navigation'

export function PaddingWrapper({ children, hasCoupons }: { children: React.ReactNode; hasCoupons: boolean }) {
  const pathname = usePathname()
  const isSpecialPage = /^\/(products|checkout|account|orders)(\/|$)/.test(pathname)

  const paddingTop = isSpecialPage
    ? '120px'
    : hasCoupons
    ? '126px'
    : '0px'

  return <div style={{ paddingTop }}>{children}</div>
}
