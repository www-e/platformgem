// lib/auth.ts

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import prisma from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted with the form
      credentials: {
        login: { label: "Student ID or Phone" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is the core logic that runs when a user tries to log in
        const { login, password } = credentials
        if (!login || !password) {
          return null // Not enough information provided
        }

        // 1. Find the user by either studentId or phone number
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { studentId: login as string },
              { phone: login as string },
            ],
          },
        })

        if (!user) {
          // No user found with that ID or phone
          return null
        }

        // 2. Check if the user has a password set (they should!)
        if (!user.password) {
          return null
        }

        // 3. Securely compare the provided password with the stored hash
        const passwordsMatch = await bcrypt.compare(password as string, user.password)

        if (passwordsMatch) {
          // 4. If passwords match, return the user object for the session
          return user
        }
        
        // If passwords don't match
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens for session management
  },
  callbacks: {
    // The `jwt` callback is called whenever a JWT is created or updated.
    // We can use it to add information to the token from our database.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.grade = user.grade
      }
      return token
    },
    // The `session` callback is called whenever a session is accessed.
    // We can use it to pass data from the token to the client-side session object.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.grade = token.grade as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login', // Redirect users to our custom login page
  },
})