import { auth } from '@/lib/auth'
import { revalidateTag } from '@/lib/revalidate'
import { NextResponse } from 'next/server'

const ALL_TAGS = ['homepage', 'products', 'categories', 'coupons', 'pages', 'static-pages']

export async function GET(request: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const tags: string[] = Array.isArray(body.tags) ? body.tags : ALL_TAGS

    const invalid = tags.filter((t) => !ALL_TAGS.includes(t))
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Unknown tags: ${invalid.join(', ')}` }, { status: 400 })
    }

    tags.forEach(revalidateTag)

    return NextResponse.json({ success: true, cleared: tags })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
