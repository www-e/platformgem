import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      grade: "FIRST_YEAR" | "SECOND_YEAR" | "THIRD_YEAR";
      isAdmin: boolean;
      // add any other custom fields here
    };
  }
}
