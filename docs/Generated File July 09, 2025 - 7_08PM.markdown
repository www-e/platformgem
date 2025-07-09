
# **Project Plan: MVP Course Platform**

## **1. Project Overview**

This document outlines the plan for building a bespoke, single-teacher MVP course platform. The platform will provide a secure, modern, and intuitive learning environment for students, with a full-featured administrative backend for the teacher.

*   **Core Features:** Secure student registration & login, grade-based course filtering, protected video and PDF content via Bunny.net, student profiles with course progress and exam tracking, and a comprehensive admin dashboard.
*   **Key Goals:** Rapid development, robust security, a polished and futuristic user experience, mobile-first responsiveness, and cost-effective, efficient data handling.

## **2. Core Technology Stack**

| Category | Technology | Version/Spec | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | 15+ (App Router) | The best tool for full-stack React. Enables server-side data fetching for performance and security. |
| **Database** | Neon | Serverless Postgres | Your chosen DB. Excellent for serverless applications with seamless integration. |
| **ORM** | Prisma | Latest | Provides type-safe database access, preventing common errors and simplifying queries. |
| **Authentication** | Next-Auth (Auth.js) | v5 (beta) | Industry-standard for Next.js. Handles all complex session and credential logic securely. |
| **Styling** | Tailwind CSS | Latest | For utility-first styling, enabling rapid UI development. |
| **UI Components** | shadcn/ui | Latest | A set of beautiful, accessible, and unstyled components that we can theme easily. |
| **Video** | React Player | Latest | A simple, reliable component for embedding the secure Bunny.net video streams. |
| **Deployment** | Vercel | N/A | Zero-config deployment for Next.js projects. |

## **3. Database Schema (`prisma/schema.prisma`)**

This schema is the application's foundation, designed to support every required feature.

```prisma
// Provider and Generator
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

// Enums for type-safety
enum Grade {
  FIRST_YEAR
  SECOND_YEAR
  THIRD_YEAR
}

// Models
model User {
  id              String    @id @default(cuid())
  studentId       String    @unique
  phone           String    @unique
  name            String
  password        String
  parentPhone     String
  grade           Grade
  isAdmin         Boolean   @default(false)

  enrollments     Enrollment[]
  examResults     ExamResult[]
  lessonProgress  LessonProgress[]
  createdAt       DateTime  @default(now())
}

model Course {
  id              String    @id @default(cuid())
  title           String
  description     String
  thumbnailUrl    String
  targetGrade     Grade

  lessons         Lesson[]
  enrollments     Enrollment[]
  createdAt       DateTime  @default(now())
}

model Enrollment {
  id              String    @id @default(cuid())
  userId          String
  courseId        String
  user            User      @relation(fields: [userId], references: [id])
  course          Course    @relation(fields: [courseId], references: [id])
  progressPercent Int       @default(0)
  enrolledAt      DateTime  @default(now())
  @@unique([userId, courseId])
}

model Lesson {
  id              String    @id @default(cuid())
  title           String
  order           Int
  bunnyVideoId    String
  courseId        String
  course          Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)

  materials       Material[]
  progress        LessonProgress[]
}

model LessonProgress {
  id              String    @id @default(cuid())
  userId          String
  lessonId        String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson          Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  completed       Boolean   @default(false)
  @@unique([userId, lessonId])
}

model Material {
  id              String    @id @default(cuid())
  title           String
  fileUrl         String
  lessonId        String
  lesson          Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}

model Exam {
  id              String    @id @default(cuid())
  title           String
  examDate        DateTime
  results           ExamResult[]
}

model ExamResult {
  id              String    @id @default(cuid())
  score           Float
  userId          String
  examId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  exam              Exam      @relation(fields: [examId], references: [id], onDelete: Cascade)
  @@unique([userId, examId])
}
```

## **4. Detailed File Architecture & Feature Mapping**

The project will be organized logically by feature and domain.

*   **`app/`**: Contains all routes and UI.
    *   **`(auth)/`**: Unprotected routes for login and sign-up.
    *   **`(landing)/`**: The public-facing homepage.
    *   **`(student)/`**: The protected area for logged-in students.
    *   **`admin/`**: The protected area for the teacher/admin.
    *   **`api/`**: For backend routes (Next-Auth and secure media proxy).
*   **`components/`**: Contains all reusable React components.
*   **`lib/`**: Contains server-side logic, utilities, and client instances (Prisma).
*   **`prisma/`**: Contains the database schema.

## **5. Key Implementation Strategies**

*   **Theming & Styling**: We will use CSS variables in `app/globals.css` mapped to your color palette (`1B3C53`, `456882`, etc.). This allows for instant, site-wide theme changes and full compatibility with `shadcn/ui`.
*   **Security**:
    1.  **Route Protection**: A top-level `middleware.ts` file will protect all `/student` and `/admin` routes, redirecting unauthenticated users to `/login`.
    2.  **Video Protection**: We will generate **time-limited signed URLs** for Bunny.net streams on the server for every request. Public video URLs will never be exposed to the client.
    3.  **PDF Protection**: We will create a proxy API route (`/api/media/...`) that verifies user authentication and enrollment before streaming PDF files from secure storage.
*   **Data Fetching & Mutations**:
    *   **Queries**: Data will be fetched primarily inside React Server Components (RSCs), which run only on the server. This means zero client-side API calls for initial data, resulting in excellent performance.
    *   **Mutations**: All form submissions (sign-up, creating courses, adding exam results) will be handled by **Server Actions**. This is a direct, secure RPC-like call from the client to the server, simplifying logic and eliminating the need for manual API endpoint creation.
