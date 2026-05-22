import { NavBar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CouponTicker } from '@/components/coupon-ticker'
import { PaddingWrapper } from '@/components/padding-wrapper'
import { getFooterContent, getNavigationCategories, getHomepageData } from '@/lib/cache/homepage'

export default async function PublicLayout({ children }: { children: import('react').ReactNode }) {
  const [footerData, categories, homepageData] = await Promise.all([
    getFooterContent(),
    getNavigationCategories(),
    getHomepageData(),
  ])

  const activeCoupons = homepageData.activeCoupons ?? []

  return (
    <>
      <CouponTicker coupons={activeCoupons} />
      <NavBar categories={categories} tickerVisible={activeCoupons.length > 0} />
      <PaddingWrapper hasCoupons={activeCoupons.length > 0}>
        {children}
      </PaddingWrapper>
      <Footer data={footerData} />
    </>
  )
}
