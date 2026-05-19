import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { token, password } = parsed.data

    const record = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    if (record.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.delete({ where: { token } }),
    ])

    return NextResponse.json({ message: 'Password updated successfully.' })
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}