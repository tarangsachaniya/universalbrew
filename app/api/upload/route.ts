import { auth } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToCloudinary(buffer, 'original')
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}