import { NavBar }           from '@/components/navbar'
import { CouponTicker }    from '@/components/coupon-ticker'
import { Hero }            from '@/components/hero'
import { About }           from '@/components/about'
import { Videos }          from '@/components/videos'
import { Products }        from '@/components/products'
import { HomepageFaq }     from '@/components/homepage-faq'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { Footer }          from '@/components/footer'
import { getHomepageData } from '@/lib/cache/homepage'

export default async function Home() {
  const homepageData = await getHomepageData()
  const { hero: heroData, featuredProducts, footer: footerData, categories, activeCoupons } = homepageData

  const about = {
    title:    (heroData as any)?.aboutTitle    ?? null,
    body:     (heroData as any)?.aboutBody     ?? null,
    features: (heroData as any)?.aboutFeatures ?? null,
  }

  const tickerVisible = activeCoupons.length > 0

  return (
    <main className="min-h-screen" style={{ paddingTop: 0 }}>
      <CouponTicker coupons={activeCoupons} />
      <NavBar categories={categories} tickerVisible={tickerVisible} />

      {/* 1. Hero — full-screen immersive */}
      <Hero data={heroData} />

      {/* 2. Brand story — About + features */}
      <About title={about.title} body={about.body} features={about.features} />

      {/* 3. Best sellers */}
      <Products products={featuredProducts} />

      {/* 4. Videos / brand content */}
      {(heroData as any)?.youtubeUrls?.length > 0 && (
        <Videos youtubeUrls={(heroData as any).youtubeUrls} backgroundColor="var(--parchment, #faf8f5)" />
      )}

      {/* 5. FAQ */}
      <HomepageFaq backgroundColor={(heroData as any)?.youtubeUrls?.length > 0 ? "var(--background)" : "var(--parchment, #faf8f5)"} />

      {/* 6. Contact + sample taster */}
      <NewsletterSignup />

      <Footer data={footerData} />
    </main>
  )
}
