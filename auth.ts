import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './lib/prisma'
import bcrypt from 'bcryptjs'

const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Admin/Staff Login
    Credentials({
      id: 'staff-login',
      name: 'Staff Login',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),
    // Guest Login
    Credentials({
      id: 'guest-login',
      name: 'Guest Login',
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        roomNumber: { label: "Room Number", type: "text" }
      },
      authorize: async (credentials) => {
        if (!credentials?.phone) {
          return null
        }

        const guest = await prisma.guest.findUnique({
          where: { phone: credentials.phone as string },
          include: { room: true }
        })

        if (!guest || !guest.isActive) {
          return null
        }

        // Verify room number if provided
        if (credentials.roomNumber && guest.room?.roomNumber !== credentials.roomNumber) {
          return null
        }

        return {
          id: guest.id,
          name: guest.name,
          email: guest.phone,
          role: 'GUEST',
          phone: guest.phone,
          roomId: guest.roomId,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = (user as any).phone
        token.roomId = (user as any).roomId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
        session.user.roomId = token.roomId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})

export { handlers, signIn, signOut, auth }
export const { GET, POST } = handlers
