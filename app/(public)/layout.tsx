import { NavBar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CouponTicker } from '@/components/coupon-ticker'
import { getFooterContent, getNavigationCategories, getHomepageData } from '@/lib/cache/homepage'
import { headers } from 'next/headers'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [footerData, categories, homepageData] = await Promise.all([
    getFooterContent(),
    getNavigationCategories(),
    getHomepageData(),
  ])

  const activeCoupons = homepageData.activeCoupons ?? []

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  const isSpecialPage = /^\/(products|checkout|account|orders)(\/|$)/.test(pathname)

  const paddingTop = isSpecialPage
    ? '90px'
    : activeCoupons.length > 0
    ? '126px'
    : '0px'

  return (
    <>
      <CouponTicker coupons={activeCoupons} />
      <NavBar categories={categories} tickerVisible={activeCoupons.length > 0} />
      <div style={{ paddingTop }}>
        {children}
      </div>
      <Footer data={footerData} />
    </>
  )
}
