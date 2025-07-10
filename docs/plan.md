EduPlatform: Technical Specification & Architectural Blueprint
Version: 1.0
Date: July 11, 2025
1. Project Overview
1.1. Mission Statement
EduPlatform is a modern, secure, and performant MVP (Minimum Viable Product) course-selling platform designed for a single teacher-admin. It provides a seamless learning experience for students, from registration to course consumption, and a comprehensive backend for the administrator to manage all aspects of the content and users.
1.2. Core User Stories & Features
As a Visitor, I can:
View a beautiful, modern landing page.
Sign up for a new account with my personal details and academic grade.
Log into my existing account.
As a Student, I can:
Log in securely with my student ID or phone number.
View a personalized dashboard showing only the courses available for my grade.
Enroll in courses.
View my profile, which lists my enrolled courses and exam history.
Watch course videos through a secure, in-app player.
Track my lesson completion progress.
As an Admin, I can:
View a dashboard with key statistics (total students, total courses).
Create, view, and manage courses, assigning them to a specific grade and video library.
Add and manage lessons (with video IDs) for each course.
View a list of all registered students.
View a specific student's profile and manually add their exam results.
2. Core Architecture & Technology Stack
The technology stack was chosen for speed of development, security, and scalability. It leverages a modern, full-stack TypeScript approach.
CategoryTechnologyVersion/SpecRationale
FrameworkNext.js (App Router)15.3.5Enables a full-stack, monolithic architecture. React Server Components (RSCs) are used for fast, secure data fetching, drastically reducing client-side API calls.
LanguageTypeScript5.xProvides static typing for code safety, reducing bugs and improving maintainability.
DatabaseNeon (Serverless Postgres)LatestA modern, cost-effective, and scalable Postgres database that pairs perfectly with serverless deployment platforms like Vercel.
ORMPrisma6.11.1Offers a best-in-class, type-safe API for database interactions, preventing SQL injection and simplifying queries.
AuthenticationNext-Auth.jsv5 (beta)The industry standard for Next.js. Handles complex security (password hashing, sessions, CSRF) out-of-the-box.
StylingTailwind CSS3.4.xA utility-first CSS framework that allows for rapid, consistent, and maintainable UI development without writing custom CSS.
UI Componentsshadcn/ui & SonnerLatestProvides a set of beautiful, accessible, and unstyled base components that we have themed with our custom palette. Sonner provides professional toast notifications.
Video DeliveryBunny.net StreamN/ASecurely hosts and streams video content.
DeploymentVercelN/AThe creators of Next.js, providing zero-configuration deployments, automatic scaling, and CI/CD.
3. Database Architecture Deep Dive (prisma/schema.prisma)
The database schema is the backbone of the application. After initial design, it was intentionally de-normalized to optimize for cost and performance on a serverless platform, directly addressing the client's budget concerns.
Key Strategy: Using JSON fields to reduce table count from 8 to 4.
This significantly reduces database storage and simplifies the queries for our primary use cases, resulting in lower compute costs on Neon.
Final Schema:
Generated prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

enum Grade {
  FIRST_YEAR
  SECOND_YEAR
  THIRD_YEAR
}

model User {
  id          String @id @default(cuid())
  studentId   String @unique
  phone       String @unique
  name        String
  password    String
  parentPhone String
  grade       Grade
  isAdmin     Boolean @default(false)
  
  // OPTIMIZATION: Replaced Exam/ExamResult tables with a single JSON field.
  examHistory Json?

  enrollments Enrollment[]
  // ...
}

model Course {
  id             String   @id @default(cuid())
  title          String
  description    String
  thumbnailUrl   String
  targetGrade    Grade
  // CRITICAL FIX: Added to support multiple video libraries.
  bunnyLibraryId String 

  lessons     Lesson[]
  enrollments Enrollment[]
  // ...
}

model Enrollment {
  id              String   @id @default(cuid())
  userId          String
  courseId        String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // OPTIMIZATION: Replaced LessonProgress table with a simple array of strings.
  completedLessonIds String[]

  // ...
  @@unique([userId, courseId])
}

model Lesson {
  id           String @id @default(cuid())
  title        String
  order        Int
  bunnyVideoId String
  courseId     String
  course       Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // OPTIMIZATION: Replaced Material table.
  materials    Json?
  // ...
}
Use code with caution.
Prisma
4. Authentication & Authorization Flow
Security is handled in a layered approach.
Password Hashing: In lib/actions.ts, the signup function uses bcrypt.hash() to securely hash user passwords. Passwords are never stored in plaintext.
Credential Verification: In lib/auth.ts, the CredentialsProvider's authorize function is the gatekeeper. It finds a user by studentId or phone and uses bcrypt.compare() to securely verify the provided password against the stored hash.
Session Management: Next-Auth creates a secure, HTTP-only JWT (JSON Web Token) cookie to manage user sessions. The callbacks in lib/auth.ts are used to enrich this token with essential user data (id, isAdmin, grade) to make it available throughout the app without extra database calls.
Route Protection: The src/middleware.ts file acts as the primary application firewall.
It intercepts all incoming requests.
It checks for a valid session token.
It strictly enforces that any route not under (auth) or (landing) is protected.
Unauthenticated users are forcefully redirected to /login.
Authenticated users are redirected away from login/signup pages.
5. Application Feature Breakdown
This section maps core features to their implementation files.
FeaturePrimary FilesKey Logic & Rationale
Student Signup/Loginapp/(auth)/login/page.tsx, app/(auth)/signup/page.tsx, lib/actions.tsUses useActionState to call Server Actions (signup, login). Securely handles form state and calls Next-Auth.
Student Dashboardapp/(student)/dashboard/page.tsxServer Component fetches courses for the student's grade and their enrollments in a single transaction (prisma.$transaction).
Student Enrollmentapp/(student)/dashboard/_components/enroll-button.tsx, lib/actions.tsThe EnrollButton calls the enrollInCourse Server Action, which creates the Enrollment record. The dashboard UI conditionally renders the button.
Video Playerapp/courses/[courseId]/page.tsx, lib/bunny.ts, components/course/video-player.tsxThe page component orchestrates everything. It verifies enrollment, calls getSignedBunnyUrl (which uses crypto to generate a token), and passes the secure URL to the client-side VideoPlayer.
Lesson Completionapp/courses/[courseId]/_components/completion-button.tsx, lib/actions.tsThe button calls the toggleLessonComplete action, which updates the completedLessonIds array in the Enrollment model and revalidates the page path.
Admin Course Mgmtapp/admin/courses/page.tsx, app/admin/courses/_components/create-course-form.tsx, lib/actions.tsAdmin page fetches all courses. The form component calls the createCourse action, which saves the course (including its bunnyLibraryId) to the DB.
Admin Lesson Mgmtapp/admin/courses/[courseId]/page.tsx, .../add-lesson-form.tsx, lib/actions.tsThe dynamic page fetches course details and lessons. The form calls the createLesson action, which associates a new lesson with the course.
Admin Exam Mgmtapp/admin/students/[studentId]/page.tsx, .../add-exam-form.tsx, lib/actions.tsThe dynamic page fetches student data. The form calls the addExamResult action, which appends a new object to the examHistory JSON array on the User model.
Toast Notificationsapp/layout.tsx, components/ui/sonner.tsx, all form componentsThe <Toaster> is placed in the root layout. All form components use useEffect to watch the state returned by useActionState and trigger toast.success() or toast.error().
6. Security & Performance Strategy
Performance:
Server-Centric: By using RSCs and Server Actions, data fetching and mutations happen on the server, close to the database. This minimizes network latency and the amount of JavaScript shipped to the client.
Efficient Queries: We use prisma.$transaction and include statements to fetch all necessary data in the fewest possible queries. A Set is used for fast lookups on the student dashboard.
Scoped Revalidation: revalidatePath is used with specific paths to avoid over-fetching or re-rendering unnecessary parts of the application.
Security:
Credential Security: No plaintext passwords are ever stored or transmitted.
Session Security: Next-Auth's default secure JWT cookies are used.
Route Protection: Middleware provides robust, top-level route protection.
Data Access Control: Pages like the course player have an additional, explicit check to ensure a user is enrolled in the specific resource they are trying to access (if (!enrollment) { ... }).
Video Security: The use of expiring signed URLs is the single most important video security feature, preventing unauthorized sharing and downloading of video streams.
7. Deployment & Maintenance Guide
7.1. Pre-Deployment Checklist
env Variables: Create a .env.production file or use the Vercel project dashboard to set ALL environment variables:
DATABASE_URL (use the Production connection string from Neon)
NEXTAUTH_SECRET (must be the same as in development)
AUTH_TRUST_HOST=true (or AUTH_URL=https://your-domain.com)
BUNNY_API_KEY
NEXT_PUBLIC_BUNNY_LIB_G1_SHARH
NEXT_PUBLIC_BUNNY_LIB_G2_SHARH
... (all 6 library IDs)
Database Migration: For the first deployment, you can use npx prisma db push. For subsequent updates to the schema after launch, it is safer to use versioned migrations:
Run npx prisma migrate dev --name your-change-name locally.
Commit the new migration file in the prisma/migrations folder.
The build command on Vercel should be modified to npx prisma migrate deploy && next build.
7.2. Long-Term Maintenance & Future Enhancements
PDF/Material Uploads: The materials JSON field on the Lesson model is currently unused. A future feature would be to implement file uploads (e.g., to Vercel Blob or Bunny.net Storage) and populate this field.
Pagination: Admin pages that list all courses or students should have pagination implemented if the number of records grows significantly, to avoid slow initial load times.
Password Reset: The current MVP does not include a "forgot password" flow. This would be a critical feature to add for a production application.
UI Testing: Implementing automated end-to-end tests with a framework like Playwright or Cypress would ensure that new changes do not break existing functionality.
Current date: Thursday, July 10, 2025, 8:36 AM EEST
