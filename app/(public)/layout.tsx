import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getFooterContent, getNavigationCategories } from '@/lib/cache/homepage'

type SocialLinks = { facebook?: string; instagram?: string; linkedin?: string; twitter?: string }

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [footerData, categories] = await Promise.all([
    getFooterContent(),
    getNavigationCategories(),
  ])

  const socialLinks = (footerData?.socialLinks ?? {}) as SocialLinks

  return (
    <>
      <Header socialLinks={socialLinks} categories={categories} />
      {children}
      <Footer data={footerData} />
    </>
  )
}
