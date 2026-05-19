import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const { email } = parsed.data

    // Always respond the same way — don't reveal if email exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      // Remove any existing token for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token, expires },
      })

      await sendPasswordResetEmail(email, token)
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}