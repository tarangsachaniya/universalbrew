import type { NextAuthConfig } from 'next-auth'

const authConfig = {
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge:    7 * 24 * 60 * 60, // 7 days
    updateAge: 60 * 60,          // re-issue JWT at most once per hour
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { id: string; role: string }
        token.role = u.role
        token.id = u.id
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      session.user.id = token.id as string
      return session
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl

      if (pathname.startsWith('/admin')) {
        return !!auth && auth.user.role === 'ADMIN'
      }

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig

export default authConfig
