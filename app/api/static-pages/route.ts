import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pages = await db.staticPage.findMany({ orderBy: { key: 'asc' } })
    return NextResponse.json(pages)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
