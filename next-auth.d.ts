import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null; // Add phone
      role: UserRole;
      isActive: boolean;
      
      // Convenience properties for role checking
      isAdmin: boolean;
      isProfessor: boolean;
      isStudent: boolean;
    };
  }

  interface User {
    phone?: string | null;
    role?: UserRole;
    isActive?: boolean;
  }
}