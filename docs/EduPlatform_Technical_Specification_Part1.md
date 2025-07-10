# EduPlatform: Technical Specification & Architectural Blueprint

**Version:** 1.0  
**Date:** July 11, 2025

---

## 1. Project Overview

### 1.1. 🎯 Mission Statement

EduPlatform is a modern, secure, and performant MVP (Minimum Viable Product) **course-selling platform** designed for a single **teacher-admin**.

It provides:
- A seamless learning experience for students (from registration to course consumption)
- A comprehensive backend for the administrator to manage content and users

---

### 1.2. 🧩 Core User Stories & Features

#### 👤 As a Visitor, I can:
- View a beautiful, modern landing page
- Sign up with personal details and academic grade
- Log into an existing account

#### 🎓 As a Student, I can:
- Log in securely (via student ID or phone)
- Access a personalized dashboard showing courses for my grade
- Enroll in courses
- View my profile (enrolled courses, exam history)
- Watch course videos in a secure player
- Track lesson completion progress

#### 🛠️ As an Admin, I can:
- View a dashboard with key statistics (total students, total courses)
- Create and manage courses, assigning grades and video libraries
- Add and manage lessons (with Bunny Stream video IDs)
- View all registered students
- View specific student profiles and manually add exam results

---

## 2. 🧱 Core Architecture & Technology Stack

| **Category**         | **Technology**             | **Version/Spec** | **Rationale**                                                                 |
|----------------------|----------------------------|------------------|-------------------------------------------------------------------------------|
| Framework            | Next.js (App Router)       | 15.3.5           | Full-stack monolithic, uses RSC for fast, secure data fetching                |
| Language             | TypeScript                 | 5.x              | Static typing, safer and more maintainable code                              |
| Database             | Neon (Serverless Postgres) | Latest           | Scalable, cost-effective, serverless-ready                                   |
| ORM                  | Prisma                     | 6.11.1           | Type-safe DB API, prevents SQL injection, simplifies queries                  |
| Authentication       | NextAuth.js                | v5 (beta)        | Secure, session and CSRF management out-of-the-box                           |
| Styling              | Tailwind CSS               | 3.4.x            | Rapid, consistent, maintainable utility-first styling                        |
| UI Components        | shadcn/ui & Sonner         | Latest           | Clean, accessible components + toast notifications                           |
| Video Delivery       | Bunny.net Stream           | N/A              | Secure hosting and streaming of video content                                |
| Deployment Platform  | Vercel                     | N/A              | Zero-config deploys, auto-scaling, CI/CD from Next.js creators               |

---

## 3. 🗂️ Database Architecture Deep Dive

The database was designed to be cost-efficient and performant on serverless infrastructure.  

### 💡 Optimization Strategy:
- **De-normalization**: Reduced table count from 8 → 4
- **Use of JSON fields**: Simplified structure and queries
- **Goal**: Minimize compute cost and storage on Neon

---

### 🧬 Final Schema (Prisma)

```ts
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ENUMS
enum Grade {
  FIRST_YEAR
  SECOND_YEAR
  THIRD_YEAR
}

// MODELS

model User {
  id             String   @id @default(cuid())
  studentId      String   @unique
  phone          String   @unique
  name           String
  password       String
  parentPhone    String
  grade          Grade
  isAdmin        Boolean  @default(false)
  
  examHistory    Json?    // 📦 Replaces Exam/ExamResult tables

  enrollments    Enrollment[]
}

model Course {
  id              String   @id @default(cuid())
  title           String
  description     String
  thumbnailUrl    String
  targetGrade     Grade
  bunnyLibraryId  String   // 📌 Supports multiple video libraries

  lessons         Lesson[]
  enrollments     Enrollment[]
}

model Enrollment {
  id                 String   @id @default(cuid())
  userId             String
  courseId           String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course             Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  completedLessonIds String[] // ✅ Replaces LessonProgress table

  @@unique([userId, courseId])
}

model Lesson {
  id             String   @id @default(cuid())
  title          String
  order          Int
  bunnyVideoId   String
  courseId       String
  course         Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  materials      Json?    // 🧾 Replaces a separate Material table
}
