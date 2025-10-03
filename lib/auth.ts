import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    // Admin/Staff Login
    CredentialsProvider({
      id: 'staff-login',
      name: 'Staff Login',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.isActive) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
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
    CredentialsProvider({
      id: 'guest-login',
      name: 'Guest Login',
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        roomNumber: { label: "Room Number", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          throw new Error('Phone number required')
        }

        const guest = await prisma.guest.findUnique({
          where: { phone: credentials.phone },
          include: { room: true }
        })

        if (!guest || !guest.isActive) {
          throw new Error('Guest not found')
        }

        // Verify room number if provided
        if (credentials.roomNumber && guest.room?.roomNumber !== credentials.roomNumber) {
          throw new Error('Invalid room number')
        }

        return {
          id: guest.id,
          name: guest.name,
          phone: guest.phone,
          role: 'GUEST',
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
        token.phone = user.phone
        token.roomId = user.roomId
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
