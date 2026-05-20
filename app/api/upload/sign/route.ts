import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const folder = new URL(req.url).searchParams.get('folder') ?? 'original'
  const timestamp = Math.round(Date.now() / 1000)

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  })
}
