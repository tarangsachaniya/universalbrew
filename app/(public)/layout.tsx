import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getFooterContent, getNavigationCategories } from '@/lib/cache/homepage'
import { getPagesByLocation } from '@/lib/cache/pages'

type SocialLinks = { facebook?: string; instagram?: string; linkedin?: string; twitter?: string }

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [footerData, headerPages, footerPages, categories] = await Promise.all([
    getFooterContent(),
    getPagesByLocation('HEADER'),
    getPagesByLocation('FOOTER'),
    getNavigationCategories(),
  ])

  const socialLinks = (footerData?.socialLinks ?? {}) as SocialLinks

  return (
    <>
      <Header pages={headerPages} socialLinks={socialLinks} categories={categories} />
      {children}
      <Footer data={footerData} pages={footerPages} />
    </>
  )
}
