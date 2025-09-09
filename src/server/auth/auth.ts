import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/server/db/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const config = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
  providers: [
    Credentials({
      async authorize(creds) {
        try {
          const parsed = credentialsSchema.safeParse(creds)
          if (!parsed.success) return null
          const { email, password } = parsed.data
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null
          const ok = await bcrypt.compare(password, user.password)
          if (!ok) return null
          return { id: user.id, email: user.email, name: user.name ?? undefined }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.uid = user.id
        token.name = user.name
        token.email = user.email
      }
      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name
        token.email = session.email
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: any) {
      if (session.user && token?.uid) {
        session.user.id = token.uid as string
        session.user.name = token.name
        session.user.email = token.email
      }
      return session
    },
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
export const { GET, POST } = handlers
