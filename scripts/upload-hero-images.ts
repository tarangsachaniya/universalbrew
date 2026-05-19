/**
 * Uploads the static hero images in public/images to Cloudinary
 * and saves their URLs in the default homepage hero slides.
 *
 * Run: npm run hero:upload
 */
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import 'dotenv/config'
import { DEFAULT_ABOUT_BODY, DEFAULT_ABOUT_FEATURES, DEFAULT_ABOUT_TITLE } from '../lib/about'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient()
// The generated Prisma client can lag behind the schema during local setup.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const homepageHero = (prisma as any).homepageHero

async function uploadBuffer(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'hero',
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('Upload failed'))
          resolve(result.secure_url)
        }
      )
      .end(buffer)
  })
}

const SLIDE_META = [
  { file: 'img1.webp', title: 'The Vessel', subtitle: 'Heritage - Craft - Ritual' },
  { file: 'img2.webp', title: 'The Bag', subtitle: 'Where it all begins' },
  { file: 'img3.webp', title: 'The Bloom', subtitle: 'Nature awakens within' },
  { file: 'img4.webp', title: 'The Release', subtitle: 'Botanicals set free' },
  { file: 'img5.webp', title: 'The Cup', subtitle: 'Hold the warmth, hold the moment' },
]

async function main() {
  const imagesDir = path.join(process.cwd(), 'public', 'images')
  const slides: { url: string; title: string; subtitle: string }[] = []

  for (const slide of SLIDE_META) {
    const filePath = path.join(imagesDir, slide.file)
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${slide.file} not found, skipping.`)
      continue
    }

    const buffer = fs.readFileSync(filePath)
    const publicId = slide.file.replace('.webp', '')
    console.log(`Uploading ${slide.file}...`)
    const url = await uploadBuffer(buffer, publicId)
    slides.push({ url, title: slide.title, subtitle: slide.subtitle })
    console.log(`Uploaded ${slide.file} -> ${url}`)
  }

  if (slides.length === 0) {
    console.error('No images uploaded. Aborting DB update.')
    process.exit(1)
  }

  await homepageHero.upsert({
    where: { id: 'default-hero' },
    update: {
      slides,
      youtubeUrls: [],
      aboutTitle: DEFAULT_ABOUT_TITLE,
      aboutBody: DEFAULT_ABOUT_BODY,
      aboutFeatures: DEFAULT_ABOUT_FEATURES,
      active: true,
    },
    create: {
      id: 'default-hero',
      slides,
      youtubeUrls: [],
      aboutTitle: DEFAULT_ABOUT_TITLE,
      aboutBody: DEFAULT_ABOUT_BODY,
      aboutFeatures: DEFAULT_ABOUT_FEATURES,
      active: true,
    },
  })

  console.log(`Hero record updated with ${slides.length} Cloudinary slide(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
