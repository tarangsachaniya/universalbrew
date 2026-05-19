import { prisma } from '@/lib/prisma'
import { HeroSlidesForm } from '@/components/admin/hero-slides-form'
import { HomepageDetailsForm } from '@/components/admin/homepage-details-form'
import type { HeroSlide } from '@/components/hero'
import { parseAboutFeatures } from '@/lib/about'

export default async function AdminHeroesPage() {
  const activeHero = await prisma.homepageHero.findFirst({ where: { active: true } })
  const hero = activeHero ?? await prisma.homepageHero.findFirst({ orderBy: { createdAt: 'desc' } })

  if (!hero) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Homepage Hero</h1>
          <p className="text-sm text-muted-foreground mt-1">No homepage hero record is available yet.</p>
        </div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = hero as any
  const slides: HeroSlide[] = Array.isArray(raw.slides) ? raw.slides : []

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Homepage Hero</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit homepage slides and details directly here. New hero creation is disabled.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <HeroSlidesForm
            mode="edit"
            initialData={{
              id: hero.id,
              slides,
              active: hero.active,
            }}
          />
        </div>

        <div className="space-y-4">
          <HomepageDetailsForm
            initialData={{
              id: hero.id,
              youtubeUrls: raw.youtubeUrls ?? [],
              aboutTitle: raw.aboutTitle ?? '',
              aboutBody: raw.aboutBody ?? '',
              aboutFeatures: parseAboutFeatures(raw.aboutFeatures),
            }}
          />
        </div>
      </div>
    </div>
  )
}
