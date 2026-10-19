# INIZERP — School Management SaaS: Project Audit Report

**Audit Date:** October 2026  
**Project:** InizERP (School Management Multi-Tenant SaaS Platform)  
**Codebase Repositories Analyzed:** `/backend` & `/frontend`  
**Stack Paradigm:** Full-Stack TypeScript — Next.js 16 (React 19) + Express 5 + PostgreSQL (Prisma ORM 6)

---

## 1. Executive Summary

This codebase constitutes the foundation of a modern, multi-tenant School Management ERP and SaaS platform named **InizERP** (formerly Akkhor/InizsoftHub).

### Key High-Level Findings:

1. **Technology Paradigm Clarification (PERN vs MERN):**
   Although the initial project specification mentioned the "MERN" stack, the actual existing implementation is **PERN / Modern TypeScript**:

   - **Frontend:** Next.js 16.2.10 (App Router, React 19.2.4, Tailwind CSS v4, Radix UI / Shadcn, TanStack React Query v5, Zustand v5).
   - **Backend:** Node.js, Express 5.2.1, TypeScript 6.0, Prisma ORM 6.19.3.
   - **Database:** PostgreSQL (with over 50 relational models, composite indexes, and Prisma migrations).
     _Recommendation:_ Do not force a conversion to MongoDB/Mongoose. School ERP systems and billing transactions are deeply relational (Schools → Academic Years → Classes → Sections → Students → Enrollments → Fees → Invoices → Payments → Allocations). The existing PostgreSQL + Prisma architecture is already substantially structured and provides ACID compliance, foreign key integrity, and relational indexing.

2. **Current State of Implementation:**

   - **Super Admin Platform:** **~85% complete**. School onboarding, school management, user listings, plan creation UI, feature definitions, system settings, notifications, and analytics are largely functional.
   - **School Admin Platform:** **~45% complete**. Academics (Years, Classes, Sections, Subjects), Admissions, Student Directory, and Timetables are implemented on both frontend and backend. However, **12 core operational modules** (Attendance, Exams, Exam Results, Fees, Invoices, Fee Collections, Homework, Announcements, Events, Leave Requests, Staff, Guardians) have complete backend services but **empty folders / missing UI pages** on the frontend.
   - **Teacher Portal:** **~10% complete**. Only a one-line placeholder dashboard exists (`<h1>Teacher Dashboard</h1>`). All teacher functionality (Class roster, taking attendance, creating homework, entering marks) is missing from the frontend, and backend routes are locked behind `SCHOOL_ADMIN`.
   - **Student Portal:** **~0% complete**. Logging in as a student triggers a **404 error** because `frontend/src/app/(dashboard)/student/dashboard/page.tsx` does not exist. Student portal APIs are not exposed.
   - **Parent Portal:** **~5% complete**. Only a one-line placeholder dashboard and notifications page exist. Child selection, fee payments, attendance tracking, and report cards are missing.
   - **Subscription & Billing Engine:** **Incomplete / Disconnected**. Plans can be created and subscriptions assigned manually by Super Admin, but:
     - No online payment gateway (Stripe/Razorpay) exists.
     - No manual payment verification workflow exists.
     - Subscription plans are **not enforced**: schools can create unlimited students and teachers regardless of plan limits (`maxStudents`, `maxTeachers`, `maxAdmins`).
     - Subscriptions do not automatically provision or gatekeep feature modules (`SchoolModule`).

3. **Critical Vulnerabilities & Bugs Found:**
   - **CRITICAL SECURITY FLAW:** Unauthenticated `GET /api/seed` endpoint in `backend/src/app.ts` executes a raw database `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` across all 40+ tables. Anyone who issues an HTTP GET to `/api/seed` completely wipes the entire database!
   - **ROLE AUTHORIZATION BUG:** All 25 school submodules in `backend/src/modules/school/` have `router.use(authorize("SCHOOL_ADMIN"))` hardcoded at the router level. Teachers, students, and parents receive `403 Forbidden` on every single academic, attendance, homework, and fee endpoint.
   - **TENANT STATUS CHECK HOLE:** `tenantMiddleware` does not verify if a school is active or has an active subscription after login. Suspended schools can continue operating if users have existing JWTs.
   - **STATIC ASSET MISMATCH:** School logos are saved with path `/public/uploads/...` in the database, but Express serves static files from `/uploads/...`, resulting in broken images.

---

## 2. Technology Stack & Dependencies Audit

### 2.1 Backend Architecture

| Component                 | Technology                                                                                    | Version                      | Purpose & State                                                                                 |
| :------------------------ | :-------------------------------------------------------------------------------------------- | :--------------------------- | :---------------------------------------------------------------------------------------------- |
| **Runtime**               | Node.js (TypeScript)                                                                          | `>=20.0.0`                   | Server runtime via `tsx` / `ts-node`                                                            |
| **HTTP Framework**        | Express.js                                                                                    | `^5.2.1`                     | Main REST API server                                                                            |
| **Database & ORM**        | PostgreSQL + Prisma ORM                                                                       | `^6.19.3`                    | Relational database access & migrations                                                         |
| **Authentication**        | JWT (`jsonwebtoken`)                                                                          | `^9.0.3`                     | Access token (15m) & Refresh token (7d)                                                         |
| **Password Hashing**      | `bcryptjs` + `bcrypt`                                                                         | `^3.0.3` / `^6.0.0`          | **Issue:** Duplicate packages installed (see Section 6)                                         |
| **Validation**            | Zod                                                                                           | `^4.4.3`                     | Request body & query parameter validation schemas                                               |
| **File Uploads**          | Multer                                                                                        | `^2.2.0`                     | Multipart form-data parser with disk storage                                                    |
| **Security**              | Helmet, CORS, express-rate-limit                                                              | `^8.3.0`, `^2.8.6`, `^8.5.2` | HTTP headers, origin checks, IP rate limiting                                                   |
| **Scheduling**            | node-cron                                                                                     | `^4.6.0`                     | Background cron triggers (e.g. notification expirations)                                        |
| **Logging & Compression** | Morgan, Compression                                                                           | `^1.11.0`, `^1.8.1`          | Dev HTTP logger and gzip response compression                                                   |
| **Artifact / Dead Code**  | NestJS packages (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/cli`) | `^11.1.28`                   | **Unused leftover:** NestJS dependencies are installed but not used; backend is pure Express 5. |

### 2.2 Frontend Architecture

| Component          | Technology              | Version             | Purpose & State                                       |
| :----------------- | :---------------------- | :------------------ | :---------------------------------------------------- |
| **Framework**      | Next.js (App Router)    | `16.2.10`           | React 19 meta-framework with server/client components |
| **UI Library**     | React                   | `19.2.4`            | View library                                          |
| **Styling**        | Tailwind CSS v4         | `^4.1.11`           | Theme tokens, utility classes, `@tailwindcss/postcss` |
| **Design System**  | Radix UI + Lucide React | `^1.6.1`, `^1.24.0` | Primitives for dialogs, popovers, dropdowns, icons    |
| **Server State**   | TanStack React Query    | `^5.101.2`          | Remote data fetching, caching, query invalidation     |
| **Client State**   | Zustand                 | `^5.0.14`           | Auth state (`auth.store.ts`), search, sidebar state   |
| **Form Handling**  | React Hook Form + Zod   | `^7.84.0`, `^4.4.3` | Controlled form inputs with `@hookform/resolvers`     |
| **Data Tables**    | TanStack React Table    | `^8.21.3`           | Sorting, pagination, and filtering in tables          |
| **Visualizations** | Recharts                | `^3.9.2`            | Revenue, enrollment, and attendance charts            |
| **Notifications**  | Sonner                  | `^2.0.7`            | Toast feedback notifications                          |

---

## 3. Database Architecture & Models Audit

The schema is defined in `backend/prisma/schema.prisma` targeting PostgreSQL. It contains **50+ models** and **17 enums**.

### 3.1 Model Catalog & Relationship Matrix

```mermaid
erDiagram
    School ||--o{ User : "has many"
    School ||--o{ Subscription : "has many"
    School ||--o{ SchoolModule : "enables"
    School ||--o{ Class : "defines"
    School ||--o{ AcademicYear : "manages"
    School ||--o{ Fee : "configures"
    School ||--o{ Invoice : "issues"

    SubscriptionPlan ||--o{ PlanModule : "contains"
    SubscriptionPlan ||--o{ Subscription : "subscribes"
    ERPModule ||--o{ PlanModule : "belongs to"
    ERPModule ||--o{ SchoolModule : "activated for"

    User ||--o{ RefreshToken : "owns"
    User ||--o{ UserRole : "assigned"
    User ||--o| Student : "profile"
    User ||--o| Teacher : "profile"
    User ||--o| Parent : "profile"

    Role ||--o{ RolePermission : "has"
    Permission ||--o{ RolePermission : "defines"
    Role ||--o{ UserRole : "granted to"

    Class ||--o{ Section : "contains"
    Student ||--o{ Enrollment : "enrolled in"
    Class ||--o{ Enrollment : "enrolls"
    Section ||--o{ Enrollment : "assigned to"
    AcademicYear ||--o{ Enrollment : "in year"

    Student ||--o{ Attendance : "records"
    Student ||--o{ Invoice : "billed"
    Invoice ||--o{ PaymentAllocation : "allocated"
    Payment ||--o{ PaymentAllocation : "allocates"
```

### 3.2 Detailed Model Inventory

1. **Multi-Tenancy & Platform Governance:**

   - `School`: Tenant root model with branding (`name`, `code`, `slug`, `logo`, `primaryColor`), settings (`startHour`, `closeHour`, `timezone`, `currency`), and status (`TRIAL`, `ACTIVE`, `SUSPENDED`).
   - `SubscriptionPlan`: SaaS pricing tier (`price`, `durationInDays`, `maxStudents`, `maxTeachers`, `maxAdmins`, `isActive`).
   - `PlanModule`: Join table between `SubscriptionPlan` and `ERPModule`.
   - `Subscription`: School subscription record (`startDate`, `endDate`, `status`, `amount`, `discount`, `tax`, `finalAmount`).
   - `ERPModule`: Global catalog of SaaS modules (`DASHBOARD`, `STUDENTS`, `TEACHERS`, `ATTENDANCE`, `FEES`, etc.).
   - `SchoolModule`: Tenant-level feature toggle assigning `ERPModule` to a specific `School`.
   - `Setting`: Super admin and system key-value configuration.
   - `AuditLog`: Action tracking (`action`, `entity`, `entityId`, `ipAddress`, `userAgent`).

2. **Identity & Dynamic RBAC:**

   - `User`: Central authentication identity (`email`, `password`, `role`, `schoolId`, `failedLogins`, `lockedUntil`, `status`).
   - `RefreshToken`: Stored SHA-256 hash of refresh tokens with expiry and device tracking.
   - `Role`: Custom tenant role (`name`, `key`, `schoolId`, `isSystem`).
   - `Permission`: Granular system capabilities (`key`, `module`, `name`).
   - `RolePermission` & `UserRole`: Join models for dynamic permissions.

3. **Academic Structure & Operations:**

   - `AcademicYear`, `Class`, `Section`, `Subject`: Academic taxonomy.
   - `Teacher`: Linked to `User` and `School`; relations with `Timetable` and `ClassTeacher`.
   - `Student`: Linked to `User`, `Parent`, `Guardian`; holds `admissionNo`, `rollNo`, `admissionDate`.
   - `Parent` & `Guardian`: Family contacts linked to `Student`.
   - `Enrollment`: Links a `Student` to an `AcademicYear`, `Class`, and `Section` with status (`ACTIVE`, `COMPLETED`, `TRANSFERRED`).
   - `Admission`: Prospective applicant workflow with statuses (`SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`).
   - `Timetable`: Weekly schedule slots (`dayOfWeek`, `startTime`, `endTime`, `roomId`, `classId`, `subjectId`, `teacherId`).

4. **Daily School Activities & Records:**

   - `Attendance`: Per-student daily attendance (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`, `HALF_DAY`).
   - `Homework` & `HomeworkSubmission`: Assignments, attachments, student submissions, grades, and feedback.
   - `Exam`, `Result`, `Mark`: Examination schedules, grading scales, subject-wise marks.
   - `LeaveRequest`: Staff or student leave requests with approval workflow.

5. **Financial & Accounts:**

   - `Fee`: Fee structure definitions (`name`, `amount`, `dueDate`, `frequency`).
   - `Invoice`: Issued student fee bills (`invoiceNo`, `totalAmount`, `paidAmount`, `balance`, `status`).
   - `Payment`: Recorded payment transactions (`receiptNo`, `amount`, `method`, `status`).
   - `PaymentAllocation`: Maps payments to invoice line items.
   - `Expense` & `Payroll`: Operational campus spending and staff salaries (Models present in Prisma, but no controllers/routes).

6. **Campus Logistics (Schema Only - No APIs):**
   - `LibraryBook` & `LibraryIssue`: Book catalog and checkout history.
   - `TransportRoute` & `TransportAssignment`: Vehicle routes and student bus allocations.
   - `Hostel` & `HostelAllocation`: Dorm rooms and student bed allocations.
   - `InventoryItem` & `InventoryTransaction`: Stock tracking.
   - `Communication` & `Document`: Direct messaging and file storage.

---

## 4. Current Feature Implementation Breakdown

### 4.1 Super Admin Module Status

| Feature / Page           | Backend Route                             | Frontend Page                 | Implementation Status | Notes                                                    |
| :----------------------- | :---------------------------------------- | :---------------------------- | :-------------------- | :------------------------------------------------------- |
| **Auth & Login**         | `POST /api/auth/login`                    | `/login`                      | **Complete**          | Rate-limited, locks after 5 attempts, issues JWT         |
| **Dashboard**            | `GET /api/super-admin/dashboard`          | `/super-admin/dashboard`      | **Complete**          | Aggregates schools, users, revenue, active subscriptions |
| **School Management**    | `GET/POST /api/super-admin/schools`       | `/super-admin/schools`        | **Complete**          | Multi-step form, logo upload, school admin creation      |
| **School Detail & Tabs** | `GET /api/super-admin/schools/:id/*`      | `/super-admin/schools/[id]/*` | **Complete**          | Overview, Admins, Activity, Features, Subscriptions tabs |
| **Feature Management**   | `GET/POST /api/super-admin/features`      | `/super-admin/features`       | **Complete**          | Create, edit, categorize modules, toggle school features |
| **Subscription Plans**   | `GET/POST /api/super-admin/plans`         | `/super-admin/plans`          | **Partial**           | Plan CRUD works; cannot attach modules via dialog        |
| **Subscriptions**        | `GET/POST /api/super-admin/subscriptions` | `/super-admin/subscriptions`  | **Partial**           | Manual subscription CRUD works; no payment gateway       |
| **User Directory**       | `GET/POST /api/super-admin/users`         | `/super-admin/users`          | **Complete**          | Filter by role/school, status toggle, password reset     |
| **Audit Logs**           | `GET /api/super-admin/audit-logs`         | `/super-admin/audit-logs`     | **Complete**          | View and CSV export of system audit trails               |
| **Analytics**            | `GET /api/super-admin/analytics`          | `/super-admin/analytics`      | **Complete**          | Growth trends, school distributions, revenue charts      |
| **System Settings**      | `GET/PUT /api/super-admin/settings`       | `/super-admin/settings`       | **Complete**          | General, security, maintenance mode toggle               |
| **Notifications**        | `GET/POST /api/super-admin/notifications` | `/super-admin/notifications`  | **Complete**          | Broadcast notices, audience filtering, status tracking   |

### 4.2 School Admin Module Status

| Feature / Page           | Backend Route                               | Frontend Page                        | Implementation Status | Notes                                                     |
| :----------------------- | :------------------------------------------ | :----------------------------------- | :-------------------- | :-------------------------------------------------------- |
| **School Dashboard**     | `GET /api/school/dashboard`                 | `/school-admin/dashboard`            | **Complete**          | Metrics cards, attendance breakdown, upcoming exams       |
| **Academic Years**       | `GET/POST /api/school/academic-years`       | `/school-admin/academic-years`       | **Complete**          | CRUD, set current academic year                           |
| **Classes & Sections**   | `GET/POST /api/school/classes`, `/sections` | `/school-admin/classes`, `/sections` | **Complete**          | Class creation, section capacity constraints              |
| **Subjects**             | `GET/POST /api/school/subjects`             | `/school-admin/subjects`             | **Complete**          | Theory/Practical types, passing marks, credit hours       |
| **Admissions**           | `GET/POST /api/school/admissions`           | `/school-admin/admissions`           | **Complete**          | Multi-step admission form, approval to student conversion |
| **Students Directory**   | `GET/POST /api/school/students`             | `/school-admin/students`             | **Complete**          | Student creation, enrollment, avatar upload, parent link  |
| **Timetables**           | `GET/POST /api/school/timetables`           | `/school-admin/timetables`           | **Complete**          | Period conflict detection, room & day schedule grid       |
| **Parents Directory**    | `GET/POST /api/school/parents`              | `/school-admin/parents`              | **Complete**          | Parent listing, linked students count                     |
| **Enrollments**          | `GET/POST /api/school/enrollments`          | `/school-admin/enrollments`          | **Complete**          | Class promotion, status management                        |
| **Notifications**        | `GET/POST /api/school/notifications`        | `/school-admin/notifications`        | **Complete**          | School-level notice broadcasts                            |
| **Teachers Directory**   | `GET/POST /api/school/teachers`             | `/school-admin/teachers`             | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Attendance Tracking**  | `GET/POST /api/school/attendance`           | `/school-admin/attendance`           | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Exams Management**     | `GET/POST /api/school/exams`                | `/school-admin/exams`                | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Exam Results & Marks** | `GET/POST /api/school/results`              | `/school-admin/results`              | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Fee Structures**       | `GET/POST /api/school/fees`                 | `/school-admin/fees`                 | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Invoices**             | `GET/POST /api/school/invoices`             | `/school-admin/invoices`             | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Fee Payments**         | `GET/POST /api/school/payments`             | `/school-admin/payments`             | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Payment Allocations**  | `GET/POST /api/school/payment-allocations`  | `/school-admin/payment-allocations`  | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Homework Management**  | `GET/POST /api/school/homework`             | `/school-admin/homework`             | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Leave Requests**       | `GET/POST /api/school/leave-requests`       | `/school-admin/leave-requests`       | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Announcements**        | `GET/POST /api/school/announcements`        | `/school-admin/announcements`        | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Events**               | `GET/POST /api/school/events`               | `/school-admin/events`               | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Staff Directory**      | `GET/POST /api/school/staff`                | `/school-admin/staff`                | **Incomplete**        | Backend complete; frontend folder is empty                |
| **Guardians Directory**  | `GET/POST /api/school/guardians`            | `/school-admin/guardians`            | **Incomplete**        | Backend complete; frontend folder is empty                |

### 4.3 Teacher, Student & Parent Role Status

| Role        | Planned Capabilities                                                                   | Backend Route Status                                | Frontend Route Status                              | Current Functional State |
| :---------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------- | :------------------------------------------------- | :----------------------- |
| **Teacher** | Dashboard, My Classes, Attendance Marker, Assignments/Homework, Exam Grading           | **Blocked** (`SCHOOL_ADMIN` required on all routes) | Only stub dashboard (`<h1>Teacher Dashboard</h1>`) | **Non-functional**       |
| **Student** | Dashboard, Timetable, Homework Submissions, Attendance Report, Exam Results, Invoices  | **Blocked** (`SCHOOL_ADMIN` required on all routes) | **Missing entirely** (`/student/dashboard` 404s)   | **Completely broken**    |
| **Parent**  | Dashboard, Children Switcher, Child Attendance, Report Cards, Fee Payment, Leave Apply | **Blocked** (`SCHOOL_ADMIN` required on all routes) | Only stub dashboard (`<h1>Parent Dashboard</h1>`)  | **Non-functional**       |

---

## 5. UI Design System & Coding Conventions Audit

### 5.1 Design Tokens & Theming

The application uses the custom **Akkhor School Aesthetic** with Tailwind CSS v4 and CSS variables defined in `frontend/src/app/globals.css`:

- **Primary Brand Color:** Warm Gold/Amber (`hsl(38 96% 50%)` / `#FFA000`)
- **Secondary Brand Color:** Deep Royal Navy (`hsl(222 47% 18%)` / `#042954`)
- **Sidebar Tokens:** Deep Navy background (`--sidebar: 212 91% 17%`), Warm Gold icons (`--sidebar-icon: 38 96% 50%`), white text with gold active indicators.
- **Card Surfaces:** Clean white cards with `border-border` (`220 14% 91%`), subtle shadows, rounded corners (`rounded-xl` / `rounded-2xl`).
- **Typography:** Sans-serif with clear font scaling (`text-xs font-semibold uppercase tracking-wider` for table headers and section tags; `text-2xl font-bold` for page titles).

### 5.2 Architectural Conventions in Code

1. **Frontend Architecture (Feature-Sliced Directory Structure):**
   - Each major domain has its own folder under `frontend/src/features/<scope>/<feature>/`:
     - `api/` — Axios API functions (`*.api.ts`)
     - `components/` — Feature UI widgets and modals
     - `hooks/` — React Query hooks (`use*.ts`)
     - `schemas/` — Zod form validation schemas
     - `types/` — TypeScript interfaces and DTOs
   - Pages in `frontend/src/app/(dashboard)/...` act as thin wrappers around feature components.
2. **State Management:**
   - **Zustand:** Used for global client-only states:
     - `auth.store.ts`: Current user, token, hydration state.
     - `sidebar.store.ts`: Collapsed state, mobile drawer, enabled features cache.
     - `search.store.ts`: Global topbar search query.
   - **TanStack React Query:** Used for server state with query keys organized in `frontend/src/lib/react-query/queryKeys.ts`.
3. **Backend Architecture (Layered Domain Modules):**
   - Standard domain module pattern:
     - `<module>.controller.ts`: Translates HTTP requests to service calls.
     - `<module>.service.ts`: Business logic and Prisma queries.
     - `<module>.schema.ts`: Zod validation schemas for body and params.
     - `<module>.routes.ts`: Router definition with middleware chain.
     - `<module>.types.ts`: Domain types and interfaces.

---

## 6. Bugs, Security Vulnerabilities & Code Quality Issues

### 6.1 Critical & High-Severity Security Issues

#### 1. CRITICAL: Unauthenticated Database Wipe Route (`/api/seed`)

- **Location:** `backend/src/app.ts` (Lines 144–166)
- **Vulnerability:** The route `GET /api/seed` has **no authentication or authorization middleware**. It invokes `child_process.exec("npx tsx prisma/seed.ts")`.
- **Impact:** `prisma/seed.ts` begins with `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` on every single table in the database. Anyone accessing `http://<host>/api/seed` in production will permanently delete all school, student, and financial records.
- **Remediation:** Remove this route entirely from `app.ts`. Database seeding must only be executed via CLI scripts (`npm run seed`).

#### 2. HIGH: Premature Role Lockout on All School Routes

- **Location:** `backend/src/modules/school/**/*.routes.ts` (Across 25 route files)
- **Vulnerability:** Every single school route file specifies:
  ```typescript
  router.use(authenticate);
  router.use(tenantMiddleware);
  router.use(authorize("SCHOOL_ADMIN"));
  ```
- **Impact:** Teachers, students, and parents cannot access any API endpoints (such as `homework`, `attendance`, `exams`, `results`, `timetables`, `fees`). If a teacher attempts to submit attendance, they receive `403 Forbidden`.
- **Root Cause:** A separate helper file `backend/src/helpers/authorization.helper.ts` was written to validate student and teacher access (`ensureStudentAccess`, `ensureTeacherAccess`), but was never connected to the routes.

#### 3. HIGH: Suspended School Tenant Security Bypass

- **Location:** `backend/src/middleware/tenant.middleware.ts`
- **Vulnerability:** `tenantMiddleware` checks `req.user.schoolId`, but **does not query the database to verify if the school is `ACTIVE` or `TRIAL`**, nor whether the subscription is active.
- **Impact:** The school status check only runs during initial login in `auth.service.ts`. If a Super Admin suspends a delinquent school or its subscription expires, existing active user sessions can continue to read and write records until their JWT expires.
- **Remediation:** Cache or verify `School.status` and `Subscription.status` in tenant middleware.

---

### 6.2 Medium & Operational Deficiencies

#### 4. Disconnect Between Subscription Plans and Feature Modules

- **Location:** `backend/src/modules/super-admin/schools/schools.service.ts` & `subscriptions.service.ts`
- **Issue:**
  - When a school is created in `createSchoolService`, it automatically runs `prisma.schoolModule.createMany` giving the school **all active ERP modules for free**.
  - When a subscription plan is assigned, it writes to `Subscription`, but does **not** update or synchronize `SchoolModule`.
  - There is no backend `featureGuard` middleware checking `schoolModule.enabled` when API routes are hit. A school on a "Basic" plan can still access "Exams" or "Finance" endpoints if they know the URL.

#### 5. Unenforced Usage Quotas

- **Location:** `SubscriptionPlan` model vs `students.service.ts`, `teachers.service.ts`, `users.service.ts`
- **Issue:** `SubscriptionPlan` defines `maxStudents`, `maxTeachers`, and `maxAdmins`, but these fields are never checked. A school on a Basic plan with `maxStudents: 300` can create 5,000 students without any error or block.

#### 6. Broken Asset URL Mapping

- **Location:** `backend/src/modules/super-admin/schools/schools.service.ts` (Line 108) vs `backend/src/app.ts` (Line 115)
- **Issue:**
  - `schools.service.ts` saves the logo path as `/public/uploads/${file.filename}`.
  - `app.ts` serves static assets at `/uploads` (e.g., `http://localhost:5000/uploads/...`).
  - Frontend `image-url.ts` prepends the backend host, requesting `http://localhost:5000/public/uploads/...`, which produces an HTTP 404 for uploaded school logos.

#### 7. Duplicate Dependencies & Library Inconsistencies

- **Location:** `backend/package.json`
- **Issue:** Both `bcrypt` (`^6.0.0`, C++ native addon) and `bcryptjs` (`^3.0.3`, pure JS) are installed.
  - `auth.service.ts` and `seed.ts` use `bcryptjs`.
  - `schools.service.ts` uses `bcrypt`.
  - Mixing both creates potential compilation issues on different platforms and inconsistent password hashing rounds.
- **Unused NestJS packages:** `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/cli`, `@nestjs/testing` are present in `package.json` and `backend/src/app.module.ts`, bloating `node_modules` by over 40MB without being used.

#### 8. Dead Code & Empty Files

- `backend/src/routes/index.ts`: Entirely commented out.
- `backend/src/types/rbac.types.ts`: 0 bytes empty file.
- `backend/src/helpers/tenant.helper.ts`: 0 bytes empty file.
- `backend/src/helpers/pagination.helper.ts`: 0 bytes empty file (leading to repetitive pagination logic across 25 services).
- `frontend/text.js`: 84 lines of scratch JavaScript code left in the frontend directory.
- `frontend/src/app/(public)/forgot-password/page.tsx`: Uses `setTimeout` mock instead of an actual API endpoint.
- `frontend/src/app/(public)/reset-password/`: Folder exists but contains no `page.tsx`.

---

## 7. Audit Conclusions & Strategic Recommendations

1. **Retain PostgreSQL + Prisma:** The relational integrity already in place is far superior for School ERPs compared to converting to MongoDB.
2. **Immediate Remediation Required:** Patch the critical `/api/seed` wipe vulnerability and unlock school routes for teachers, students, and parents.
3. **Build the SaaS Tiering & Monetization Engine:** Complete the dynamic subscription plans (Basic, Standard, Premium), build the Feature Gatekeeper middleware, enforce usage limits, and integrate Razorpay/Stripe plus manual payment verification.
4. **Complete the Frontend Portals:** Build the missing teacher, student, and parent pages and implement the 12 empty School Admin feature screens.

_(See `IMPLEMENTATION_PLAN.md` for the complete development blueprint and phased execution roadmap)._
