import { NavBar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CouponTicker } from '@/components/coupon-ticker'
import { getFooterContent, getNavigationCategories, getHomepageData } from '@/lib/cache/homepage'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
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
      <div style={{ paddingTop: activeCoupons.length > 0 ? "126px" : "90px" }}>
        {children}
      </div>
      <Footer data={footerData} />
    </>
  )
}
