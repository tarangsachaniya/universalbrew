import { NavBar } from '@/components/navbar'
import { CouponTicker } from '@/components/coupon-ticker'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Videos } from '@/components/videos'
import { Products } from '@/components/products'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { Footer } from '@/components/footer'
import { getHomepageData } from '@/lib/cache/homepage'

export default async function Home() {
  const homepageData = await getHomepageData()
  const { hero: heroData, featuredProducts, footer: footerData, categories, activeCoupons } = homepageData

  const about = {
    title: (heroData as any)?.aboutTitle ?? null,
    body:  (heroData as any)?.aboutBody  ?? null,
    features: (heroData as any)?.aboutFeatures ?? null,
  }

  const tickerVisible = activeCoupons.length > 0

  return (
    <main className="min-h-screen">
      <CouponTicker coupons={activeCoupons} />
      <NavBar categories={categories} tickerVisible={tickerVisible} />
      <Hero data={heroData} />
      <div style={{ scrollMarginTop: "90px" }}>
        <About title={about.title} body={about.body} features={about.features} />
        <Videos youtubeUrls={(heroData as any)?.youtubeUrls ?? []} />
        <Products products={featuredProducts} />
        <NewsletterSignup />
      </div>
      <Footer data={footerData} />
    </main>
  )
}
