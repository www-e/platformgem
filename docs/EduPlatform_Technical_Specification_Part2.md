# 4. Authentication & Authorization Flow

Security is handled in a layered approach.

- **Password Hashing**:  
  In `lib/actions.ts`, the signup function uses `bcrypt.hash()` to securely hash user passwords. Passwords are never stored in plaintext.

- **Credential Verification**:  
  In `lib/auth.ts`, the `CredentialsProvider`'s authorize function is the gatekeeper. It finds a user by `studentId` or `phone` and uses `bcrypt.compare()` to securely verify the provided password against the stored hash.

- **Session Management**:  
  Next-Auth creates a secure, HTTP-only JWT (JSON Web Token) cookie to manage user sessions. The callbacks in `lib/auth.ts` are used to enrich this token with essential user data (`id`, `isAdmin`, `grade`) to make it available throughout the app without extra database calls.

- **Route Protection**:  
  The `src/middleware.ts` file acts as the primary application firewall.  
  It intercepts all incoming requests.  
  It checks for a valid session token.  
  It strictly enforces that any route not under `(auth)` or `(landing)` is protected.  
  Unauthenticated users are forcefully redirected to `/login`.  
  Authenticated users are redirected away from login/signup pages.

---

# 5. Application Feature Breakdown

This section maps core features to their implementation files.

### Feature | Primary Files | Key Logic & Rationale

#### Student Signup/Login  
`app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `lib/actions.ts`  
Uses `useActionState` to call Server Actions (`signup`, `login`). Securely handles form state and calls Next-Auth.

#### Student Dashboard  
`app/(student)/dashboard/page.tsx`  
Server Component fetches courses for the student's grade and their enrollments in a single transaction (`prisma.$transaction`).

#### Student Enrollment  
`app/(student)/dashboard/_components/enroll-button.tsx`, `lib/actions.ts`  
The `EnrollButton` calls the `enrollInCourse` Server Action, which creates the Enrollment record. The dashboard UI conditionally renders the button.

#### Video Player  
`app/courses/[courseId]/page.tsx`, `lib/bunny.ts`, `components/course/video-player.tsx`  
The page component orchestrates everything. It verifies enrollment, calls `getSignedBunnyUrl` (which uses crypto to generate a token), and passes the secure URL to the client-side `VideoPlayer`.

#### Lesson Completion  
`app/courses/[courseId]/_components/completion-button.tsx`, `lib/actions.ts`  
The button calls the `toggleLessonComplete` action, which updates the `completedLessonIds` array in the Enrollment model and revalidates the page path.

#### Admin Course Mgmt  
`app/admin/courses/page.tsx`, `app/admin/courses/_components/create-course-form.tsx`, `lib/actions.ts`  
Admin page fetches all courses. The form component calls the `createCourse` action, which saves the course (including its `bunnyLibraryId`) to the DB.

#### Admin Lesson Mgmt  
`app/admin/courses/[courseId]/page.tsx`, `.../add-lesson-form.tsx`, `lib/actions.ts`  
The dynamic page fetches course details and lessons. The form calls the `createLesson` action, which associates a new lesson with the course.

#### Admin Exam Mgmt  
`app/admin/students/[studentId]/page.tsx`, `.../add-exam-form.tsx`, `lib/actions.ts`  
The dynamic page fetches student data. The form calls the `addExamResult` action, which appends a new object to the `examHistory` JSON array on the User model.

#### Toast Notifications  
`app/layout.tsx`, `components/ui/sonner.tsx`, all form components  
The `<Toaster>` is placed in the root layout. All form components use `useEffect` to watch the state returned by `useActionState` and trigger `toast.success()` or `toast.error()`.

---

# 6. Security & Performance Strategy

## Performance:

- **Server-Centric**:  
  By using RSCs and Server Actions, data fetching and mutations happen on the server, close to the database. This minimizes network latency and the amount of JavaScript shipped to the client.

- **Efficient Queries**:  
  We use `prisma.$transaction` and `include` statements to fetch all necessary data in the fewest possible queries. A `Set` is used for fast lookups on the student dashboard.

- **Scoped Revalidation**:  
  `revalidatePath` is used with specific paths to avoid over-fetching or re-rendering unnecessary parts of the application.

## Security:

- **Credential Security**:  
  No plaintext passwords are ever stored or transmitted.

- **Session Security**:  
  Next-Auth's default secure JWT cookies are used.

- **Route Protection**:  
  Middleware provides robust, top-level route protection.

- **Data Access Control**:  
  Pages like the course player have an additional, explicit check to ensure a user is enrolled in the specific resource they are trying to access (`if (!enrollment) { ... }`).

- **Video Security**:  
  The use of expiring signed URLs is the single most important video security feature, preventing unauthorized sharing and downloading of video streams.

---

# 7. Deployment & Maintenance Guide

## 7.1. Pre-Deployment Checklist

- **env Variables**:  
  Create a `.env.production` file or use the Vercel project dashboard to set ALL environment variables:

  - `DATABASE_URL` (use the Production connection string from Neon)  
  - `NEXTAUTH_SECRET` (must be the same as in development)  
  - `AUTH_TRUST_HOST=true` (or `AUTH_URL=https://your-domain.com`)  
  - `BUNNY_API_KEY`  
  - `NEXT_PUBLIC_BUNNY_LIB_G1_SHARH`  
  - `NEXT_PUBLIC_BUNNY_LIB_G2_SHARH`  
  - ... (all 6 library IDs)

- **Database Migration**:

  - For the first deployment, you can use `npx prisma db push`.  
  - For subsequent updates to the schema after launch, it is safer to use versioned migrations:
    - Run `npx prisma migrate dev --name your-change-name` locally.  
    - Commit the new migration file in the `prisma/migrations` folder.  
    - The build command on Vercel should be modified to:  
      `npx prisma migrate deploy && next build`.

## 7.2. Long-Term Maintenance & Future Enhancements

- **PDF/Material Uploads**:  
  The `materials` JSON field on the Lesson model is currently unused. A future feature would be to implement file uploads (e.g., to Vercel Blob or Bunny.net Storage) and populate this field.

- **Pagination**:  
  Admin pages that list all courses or students should have pagination implemented if the number of records grows significantly, to avoid slow initial load times.

- **Password Reset**:  
  The current MVP does not include a "forgot password" flow. This would be a critical feature to add for a production application.

- **UI Testing**:  
  Implementing automated end-to-end tests with a framework like Playwright or Cypress would ensure that new changes do not break existing functionality.
