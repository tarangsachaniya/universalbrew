import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Videos } from '@/components/videos'
import { Products } from '@/components/products'
import { Footer } from '@/components/footer'
import { getHomepageData } from '@/lib/cache/homepage'

type SocialLinks = { facebook?: string; instagram?: string; linkedin?: string; twitter?: string }

export default async function Home() {
  const homepageData = await getHomepageData()
  const { hero: heroData, featuredProducts, footer: footerData, headerPages, footerPages, categories } = homepageData

  const socialLinks = (footerData?.socialLinks ?? {}) as SocialLinks

  const about = {
    title: (heroData as any)?.aboutTitle ?? null,
    body:  (heroData as any)?.aboutBody  ?? null,
    features: (heroData as any)?.aboutFeatures ?? null,
  }

  return (
    <main className="min-h-screen">
      <Header pages={headerPages} socialLinks={socialLinks} categories={categories} />
      <Hero data={heroData} pages={headerPages} categories={categories} />
      <About title={about.title} body={about.body} features={about.features} />
      <Videos youtubeUrls={(heroData as any)?.youtubeUrls ?? []} />
      <Products products={featuredProducts} />
      <Footer data={footerData} pages={footerPages} />
    </main>
  )
}
