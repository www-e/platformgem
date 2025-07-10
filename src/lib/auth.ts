// src/lib/auth.ts

import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { User as PrismaUser, Grade } from "@prisma/client"

import prisma from "@/lib/prisma"

// Extend the JWT and User types to include our custom fields
declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
    grade?: Grade;
  }
}

declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
    grade?: Grade;
  }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // ADD THIS LINE
  providers: [
    Credentials({
      credentials: {
        login: { label: "Student ID or Phone" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { login, password } = credentials
        if (!login || !password) return null;

        const user = await prisma.user.findFirst({
          where: { OR: [{ studentId: login as string }, { phone: login as string }] },
        })

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password as string, user.password)
        
        if (passwordsMatch) return user;
        
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin; 
        token.grade = user.grade;
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin ?? false;
        session.user.grade = token.grade as Grade;
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
