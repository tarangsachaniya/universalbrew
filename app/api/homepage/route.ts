import { auth } from '@/lib/auth'
import { getHomepageData } from '@/lib/cache/homepage'
import { prisma } from '@/lib/prisma'
import { heroSchema, heroSlidesUpdateSchema, homepageDetailsUpdateSchema } from '@/lib/validations/hero'
import { revalidateTag } from '@/lib/revalidate'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json(await getHomepageData())
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, ...data } = body
    const parsed = heroSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { youtubeUrls, slides, aboutTitle, aboutBody, aboutFeatures, ...rest } = parsed.data
    const filteredUrls = (youtubeUrls ?? []).filter((u) => u.trim() !== '').slice(0, 3)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slidesJson = slides as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aboutFeaturesJson = (aboutFeatures?.length ? aboutFeatures : null) as any
    const aboutData = {
      aboutTitle: aboutTitle ?? null,
      aboutBody:  aboutBody  ?? null,
      aboutFeatures: aboutFeaturesJson,
    }

    let hero
    hero = await prisma.$transaction(async (tx) => {
      if (rest.active) {
        await tx.homepageHero.updateMany({
          where: id ? { active: true, NOT: { id } } : { active: true },
          data: { active: false },
        })
      }

      if (id) {
        return tx.homepageHero.update({
          where: { id },
          data: { ...rest, slides: slidesJson, youtubeUrls: filteredUrls, ...aboutData },
        })
      }

      return tx.homepageHero.create({
        data: { ...rest, slides: slidesJson, youtubeUrls: filteredUrls, ...aboutData },
      })
    })

    revalidateTag('homepage')
    return NextResponse.json(hero)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    if (body?.section === 'slides') {
      const parsed = heroSlidesUpdateSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
      }

      const { id, slides, active } = parsed.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const slidesJson = slides as any

      const hero = await prisma.$transaction(async (tx) => {
        if (active) {
          await tx.homepageHero.updateMany({
            where: { active: true, NOT: { id } },
            data: { active: false },
          })
        }

        return tx.homepageHero.update({
          where: { id },
          data: {
            slides: slidesJson,
            ...(typeof active === 'boolean' ? { active } : {}),
          },
        })
      })

      revalidateTag('homepage')
      return NextResponse.json(hero)
    }

    if (body?.section === 'details') {
      const parsed = homepageDetailsUpdateSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
      }

      const { id, youtubeUrls, aboutTitle, aboutBody, aboutFeatures } = parsed.data
      const filteredUrls = (youtubeUrls ?? []).filter((u) => u.trim() !== '').slice(0, 3)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aboutFeaturesJson = (aboutFeatures?.length ? aboutFeatures : null) as any

      const hero = await prisma.homepageHero.update({
        where: { id },
        data: {
          youtubeUrls: filteredUrls,
          aboutTitle: aboutTitle ?? null,
          aboutBody: aboutBody ?? null,
          aboutFeatures: aboutFeaturesJson,
        },
      })

      revalidateTag('homepage')
      return NextResponse.json(hero)
    }

    return NextResponse.json({ error: 'Invalid homepage update section' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
