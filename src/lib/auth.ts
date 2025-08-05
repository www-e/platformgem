// src/lib/auth.ts

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

import prisma from "@/lib/prisma"

// Extend the JWT and User types to include our custom fields
declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    isActive?: boolean;
  }
}

declare module "next-auth" {
  interface User {
    role?: UserRole;
    isActive?: boolean;
  }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        login: { label: "Student ID or Phone" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;
        const { login, password } = credentials;

        // Support login with phone, email, or studentId
        const user = await prisma.user.findFirst({
          where: { 
            OR: [
              { phone: login as string },
              { email: login as string },
              { studentId: login as string }
            ],
            isActive: true // Only allow active users to login
          },
        })

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password as string, user.password)
        
        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
          };
        }
        
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
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone; // Add phone
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email ;
        session.user.phone = token.phone as string | null;
        session.user.role = token.role as UserRole;
        session.user.isActive = token.isActive as boolean;
    
        // Convenience properties
        session.user.isAdmin = token.role === 'ADMIN';
        session.user.isProfessor = token.role === 'PROFESSOR';
        session.user.isStudent = token.role === 'STUDENT';
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log('🔄 Auth redirect called:', { url, baseUrl });
      
      // For sign-in redirects, we'll handle role-based redirects in the login page
      // This callback is mainly for other redirect scenarios
      
      // Default behavior for relative URLs
      if (url.startsWith("/")) {
        console.log('🔄 Relative URL redirect:', `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        console.log('🔄 Same origin redirect:', url);
        return url;
      }
      
      console.log('🔄 Default redirect to base:', baseUrl);
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login'
  }
});
