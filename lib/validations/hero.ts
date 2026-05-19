import { z } from 'zod'

const youtubeUrlSchema = z.string().refine(
  (v) => v === '' || /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(v),
  { message: 'Must be a valid YouTube URL' }
)

export const heroSlideSchema = z.object({
  url: z.string().url('Must be a valid image URL'),
  title: z.string().min(1, 'Title required').max(200),
  subtitle: z.string().max(300).default(''),
})

export const aboutFeatureSchema = z.object({
  title: z.string().trim().min(1, 'Feature title required').max(120),
  description: z.string().trim().min(1, 'Feature description required').max(300),
})

export const heroSchema = z.object({
  slides: z.array(heroSlideSchema).default([]),
  youtubeUrls: z.array(youtubeUrlSchema).max(3).default([]),
  active: z.coerce.boolean().default(false),
  aboutTitle: z.string().max(300).optional(),
  aboutBody: z.string().max(2000).optional(),
  aboutFeatures: z.array(aboutFeatureSchema).max(6).optional(),
})

export const heroSlidesUpdateSchema = z.object({
  id: z.string().min(1, 'Hero id is required'),
  slides: z.array(heroSlideSchema).default([]),
  active: z.coerce.boolean().optional(),
})

export const homepageDetailsUpdateSchema = z.object({
  id: z.string().min(1, 'Hero id is required'),
  youtubeUrls: z.array(youtubeUrlSchema).max(3).default([]),
  aboutTitle: z.string().max(300).optional(),
  aboutBody: z.string().max(2000).optional(),
  aboutFeatures: z.array(aboutFeatureSchema).max(6).optional(),
})

export type HeroSlide = z.infer<typeof heroSlideSchema>
export type HeroInput = z.infer<typeof heroSchema>
export type HeroSlidesUpdateInput = z.infer<typeof heroSlidesUpdateSchema>
export type HomepageDetailsUpdateInput = z.infer<typeof homepageDetailsUpdateSchema>
