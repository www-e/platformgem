import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
      
      // Convenience properties for role checking
      isAdmin: boolean;
      isProfessor: boolean;
      isStudent: boolean;
    };
  }
}
