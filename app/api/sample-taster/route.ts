import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sampleTasterSchema } from '@/lib/validations/sample-taster'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = sampleTasterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    await prisma.sampleTasterRequest.create({ data: parsed.data })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
