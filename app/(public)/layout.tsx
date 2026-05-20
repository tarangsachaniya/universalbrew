import { NavBar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getFooterContent, getNavigationCategories } from '@/lib/cache/homepage'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [footerData, categories] = await Promise.all([
    getFooterContent(),
    getNavigationCategories(),
  ])

  return (
    <>
      <NavBar categories={categories} />
      <div style={{ paddingTop: "90px" }}>
        {children}
      </div>
      <Footer data={footerData} />
    </>
  )
}
