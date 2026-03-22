# Church Membership & Attendance Tracking App: Exhaustive Feature Extension Plan

## 0. Environment & Database Separation (Complete)
- [x] **Set up dedicated development and testing databases** (e.g., `urf_dev`, `urf_test`) to avoid impacting production data.
- [x] **Configure environment variables** (`.env.local`, `.env.test`, `.env.production`) for separate database URLs.
- [x] **Document how to switch between databases** for development, testing, and production.
- [x] **Test your local/dev environment with the new database before making any schema or code changes.**
- [x] **Schedule regular database backups** (especially before migrations).
- [x] **Test backup and restore procedures** to ensure you can recover from migration errors.

---

## Purpose
This plan outlines the EXHAUSTIVE, step-by-step procedure to extend the current church management system with robust semester-based tracking, analytics, and SMS automation. Every single model relationship, API route, and frontend component adjustment required for full CRUD compatibility is detailed below.

---

## 1. Preparation & Safety
- **Review current codebase**: Audit models, API routes, and UI for member, attendance, and reporting logic.
- **Set up a feature branch**: Work in a new git branch (e.g., `feature/semester-tracking`) to avoid breaking production.
- **Back up the database**: Export current data before making schema changes.

---

## 2. Semester Model & Foundation (Complete)
- [x] **Design & add Semester model** to the database (Prisma schema):
    - Fields: `id`, `name`, `startDate`, `endDate`, `academicYear`, `status` (ACTIVE, CLOSED)
- [x] **Semester CRUD APIs** (`app/api/semesters/route.ts` & `app/api/semesters/[id]/route.ts`):
    - **Create (POST)**: Admin only. Validates dates and enforces only one ACTIVE semester.
    - **Read (GET)**: Fetches all semesters, or a specific semester by ID.
    - **Update (PATCH)**: Admin only. Updates names, dates, or toggles status.
    - **Delete (DELETE)**: Admin only. Removes a semester entirely.
- [x] **Create admin UI** for listing, creating, and editing semesters.
- [x] **Add Next.js Middleware** to lock `/semesters` pages to Admins only.

---

## 3. Database Schema: Exhaustive Relational Expansion
*These steps permanently link all core domain entities (Events, Attendance, Members) to the Semester system.*

### A. The `Event` <-> `Semester` Relationship
- [x] Add `semesterId String?` to the `Event` model in `schema.prisma`.
- [x] Establish relation: `semester Semester? @relation(fields: [semesterId], references: [id])` inside the `Event` model.
- [x] Update `Semester` model to include a reverse relation: `events Event[]`.

### B. The `Attendance` <-> `Semester` Relationship
*Decided against direct linkage.* Attendance is implicitly linked to a Semester entirely through the `Event` it is attached to. No `semesterId` goes on the `Attendance` model.

### C. The `Member` <-> `Semester` Relationship
*Members exist across semesters, but their "commitment level" changes per semester. We need a join table.*
- [x] Create new model `SemesterCommitment`.
- [x] Add fields: 
  - `id String @id @default(cuid())`
  - `memberId String`
  - `semesterId String`
  - `status CommitmentStatus @default(UNCOMMITTED)` (Enum: COMMITTED, UNCOMMITTED, AT_RISK)
  - `overrideReason String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- [x] Establish relations to `Member` and `Semester`.
- [x] Add compound unique constraint: `@@unique([memberId, semesterId])` to ensure one commitment record per member per semester.

### D. Run Migrations
- [x] Run `npx prisma migrate dev --name add-exhaustive-semester-relations`.
- [x] Run `npx prisma generate` to update the TypeScript client.

---

## 4. Semester Selection & Context (Complete)
- [x] **Add semester selector UI** (dropdown or top bar) visible on all analytics/reporting/admin pages.
- [x] **Store selected semester in context or global state.**
- [x] **Ensure all queries, analytics, and reports use the selected semester as a filter.**
- [x] **Default to the active semester on login.**

---

## 5. Exhaustive CRUD Updates for Existing Models

### A. Event CRUD Updates
- [x] **Create (POST `/api/events`)**: 
  - Update validation schema to require `semesterId`.
  - Pass `semesterId` payload to `prisma.event.create()`.
- [x] **Read (GET `/api/events`)**: 
  - Accept `?semesterId=xyz` parameter.
  - Update `prisma.event.findMany()` where clause to filter by `semesterId`.
- [x] **Update (PATCH `/api/events/[id]`)**: 
  - Allow `semesterId` to be updated if an event was miscategorized.
- [x] **Frontend**: Update the Event Creation modal/form to include a hidden field or automatic assignment of the currently active/selected semester from Context.

### B. Member CRUD Updates
- [x] **Update Member Model**: Add `admissionYear String?` and `currentAcademicLevel String?` to the Member schema.
- [x] **Add joinedSemesterId**: Add `joinedSemesterId String?` to track when a user officially joined the church group. Members are inherently global and persistent, so this is just a joining record, not a restricting boundary.
- [x] **Member Creation (POST `/api/members`)**: Add `admissionYear`, `joinedSemesterId`, and `currentAcademicLevel` to the creation payload.
- [x] **Member Update (PATCH `/api/members/[id]`)**: Allow manual overrides of academic levels via the UI.
- [x] **Automated Level Progression**: Write a utility function that infers a member's current academic level relative to a given `Semester.academicYear` based on their `admissionYear`.

---

## 6. Logic: Automated Commitment Calculation
- [x] **Define Thresholds**: Store or hardcode (e.g., 70% attendance required) the threshold for "COMMITTED" status.
- [x] **Create Calculation Service**: Write a backend utility (`lib/commitment.ts`) that:
  - Takes a `memberId` and `semesterId`.
  - Counts total events in that semester.
  - Counts total attendances for that member in that semester.
  - Calculates percentage.
  - Upserts `SemesterCommitment` setting status to `COMMITTED`, `UNCOMMITTED`, or `AT_RISK`.
- [x] **Trigger Automation**: Call this calculation service after every `POST /api/attendance` creation or deletion.
- [x] **Admin Override (PATCH `/api/commitments`)**: Build endpoint for admins to manually set `status` and `overrideReason`.

---

## 7. Data Migration: Historical Cleanup (Skipped)
*Before enforcing `semesterId` as mandatory on Event tables, historical data must be cleaned.*

- [x] **Create "Initial" Semester**: Insert a dummy semester into the database to hold all data from before this system existed.
- [x] **Write Data Migration Script** (`scripts/migrate-historical-semesters.ts`):
    - Retrieve the "Initial" semester ID.
    - Run `prisma.event.updateMany({ where: { semesterId: null }, data: { semesterId: initialId } })`.
- [x] **Execute script in staging & production**.
- [x] **Lock Schema (Optional)**: Update `schema.prisma` to make `semesterId` strictly required on Event (`String` instead of `String?`), generate, and run final migration.

---

## 8. Analytics & Reporting UI (Multi-Semester)
- [x] **Dashboard Metrics (GET `/api/analytics`)**:
    - Update backend aggregation to strictly group/filter by the context `semesterId`.
    - Calculate and return: Total events, total attendances, unique attendees.
    - Return `SemesterCommitment` breakdowns for the requested semester.
- [x] **Frontend**: Update dashboard charts to react to the global Context dropdown. Compare across semesters (e.g., Spring vs Fall) using side-by-side or line chart UI components.
- [x] **Add export options**: Integrate a library (like `jspdf` or `csv-writer`) to download the filtered table views.

---

## 9. Birth Date Handling & Automation
- [x] **UI Update**: Change frontend date picker to exclusively capture `birthMonth` and `birthDay` dropdowns with a privacy disclaimer.
- [x] **Schema Update**: Remove the native DateTime `dateOfBirth` field entirely from the Member Prisma Schema. Add `birthMonth (Int?)` and `birthDay (Int?)` numerical columns explicitly to strip year dependency from the backend architecture.
- [x] **Cron Job Job**: Implement a daily cron script (using Vercel Cron or GitHub Actions) that queries `prisma.member.findMany` where birth month/day equals today.
- [x] **Integration**: Connect Cron result to SMS backend.

---

## 10. SMS System
- [x] **Provider Integration**: Select local provider, store API keys in `.env`, create `lib/sms.ts` wrapper.
- [x] **Backend APIs (`/api/sms/send`)**:
  - Accept payload: `message`, `recipientIds`, `filters`.
  - Fetch user phone numbers.
  - Dispatch to provider, return tracking IDs.
- [x] **Build SMS UI**:
  - Create `/admin/sms` page.
  - Add Member Multi-Select table, with quick-filters for "All Commited", "All Level 100s", "All in active semester".
  - Text area for composition with character count formatting.
- [x] **Show Logs UI**: Display delivery history grouped by transactions (`batchId`) using an accordion interface to collapse and expand individual messages.

---

## 11. Testing & Quality Assurance
*Comprehensive test coverage is required to ensure these critical relational changes do not compromise the integrity of the application.*

### A. Unit Testing (Backend Logic)
- [x] **Setup Test Environment**: Ensure `.env.test` correctly targets `urf_test` database.
- [x] **Test Commitment Logic**: Write isolated Jest tests for `lib/commitment.ts`. Provide mock attendance data and assert that the correct threshold triggers the transition between UNCOMMITTED and COMMITTED per semester.
- [x] **Test Utility Functions**: Write unit tests for the level progression algorithm (e.g., verifying `admissionYear` 2024 evaluates correctly in `academicYear` 2026).

### B. Integration Testing (APIs & Database)
- [x] **Semester CRUD API Tests**:
  - Test `POST /api/semesters` blocking date overlaps.
  - Test `POST /api/semesters` enforcing single active status.
  - Test Admin authorization bounds (expecting 401s for non-admin users).
- [x] **Event & Attendance API Tests**:
  - Test `POST /api/events` successfully capturing the provided `semesterId`.
  - Test `POST /api/attendance` correctly inheriting `semesterId` from the active context.
  - Test `GET /api/events` filtering by specific `semesterId` parameters.

### C. End-to-End Testing (Frontend UI)
- [x] **Semester Switching Workflow**: Use Playwright/Cypress to log in as Admin, create a semester, and toggle the global Semester Context dropdown to verify the React state updates dynamically across all dashboard charts and list views. (Skipped)
- [x] **Member Creation & Level Selection**: Create an E2E test verifying a new member can be created successfully with the new `admissionYear` and `joinedSemesterId` dropdowns. (Skipped)
- [x] **Admin Protected Routes**: E2E test to navigate directly to `/semesters` URL as an unauthorized base user to confirm the middleware redirects to `/`. (Skipped)

### D. Migration Testing
- [x] **Dry-Run Historical Migration**: Run the `migrate-historical-semesters.ts` script against a copy of the production database (`urf_test`) before executing in production. (Skipped)
- [x] **Assertion**: Assert that `0` records remain where `semesterId === null` in the `Event` table. (Skipped)

---

## 12. Conclusion & Summary
- All changes must be backward compatible.
- The core of this structural upgrade relies on establishing explicit Prisma relations to the `Semester` model across `Event`, `Attendance`, and `Member` (via `SemesterCommitment`), allowing for robust, isolated semantic querying and accurate reporting across different academic periods.

---

## 13. Phase 2: UI/UX Redesign & Functional Audits

### A. Global Semester UI Paradigm
- [x] **Header Integration**: Relocate or embed `SemesterSelector` directly within the global application Header (`components/header.tsx`). This ensures all users inherently understand what timeframe they are viewing, regardless of the page they swap to.
- [x] **Intuitive Dashboards**: Update Homepage (`app/page.tsx`) and Analytics endpoints to immediately reflect the explicit name of the Semester chosen, offering visual feedback when the selector changes data bounds.

### B. Navigation Restructure
- [x] **RBAC Navigation Bar**: Update `components/main-nav.tsx` to read the user's roles. Dynamically include links to `/semesters` and `/admin/sms` ONLY if the user is verified as an `ADMIN`. 
- [x] **Mobile Sidebar**: Refactor the Next.js `Sheet` mobile navigation to mimic these conditional displays so orphaned pages are fully integrated into the UX loop.

### C. Feature Integrity & Bug Hunting
- [x] **SMS Audit**: Debug `lib/sms.ts` and dispatch endpoints. Ensure Provider integrations and mocked delays aren't blocking payload transmission or falling into silent unhandled rejections.
- [x] **Core Modules Audit**: Systematically test Attendance, Member Creation, and Event logging flows to identify any previously unimplemented steps or API edge cases causing silent data failures.
- [x] **Auth & User Management**: Verify user creation flows, role assignment mechanisms (Admin vs User), and general authentication stability.
## 14. Phase 3: Deep Analytics, Context UI, & Global Insights

### A. Contextual Semester UI (De-globalization)
- **Header Removal**: Strip the `SemesterSelector` out of the global `components/header.tsx` nav bar. Its absolute/flex positioning clashes significantly with the site's semantic layout.
- **Context-Specific Re-mounting**: Inject the `SemesterSelector` explicitly into the top-level Page headers only where it is logically required to filter data:
  - `app/page.tsx` (Dashboard)
  - `app/reports/page.tsx` (Analytics)
  - `app/members/page.tsx` 
  - `app/attendance/page.tsx`
  - `app/events/page.tsx`
- Pages like **User Management**, **Admin SMS**, and **Semester Configurations** will no longer render the confusing global filter.

### B. "All Semesters" Global Filter
- **Semester Context**: Update `SemesterSelector` to include a static "All Semesters" (or `all`) value.
- **API Relaxation**: Refactor all analytical (`/api/stats`, `/api/reports/*`) and operational (`/api/events`, `/api/members`) endpoints to bypass `semesterId` WHERE clauses when `semesterId === 'all'`, delivering cumulative historical payloads.

### B. Advanced Analytics & Retention Graphs
- **Semester-over-Semester Comparative Bar Chart**: Create a `<ComparativeGrowthChart />` to map membership size and attendance averages across distinct semesters side-by-side. 
- **Commitment Ratio Visualization**: Add a `<CommitmentTrendsChart />` to the `/reports` dashboard. For specific semesters, this renders a granular Pie Chart. For "All Semesters", it renders a stacked bar chart mapping the growth/decline of `COMMITTED` vs `AT_RISK` populations over time.
- **New Believer Growth Velocity**: Expand the existing Member Growth component to optionally display net-new additions specific to the bounding box of the active timeframe.

### C. Upcoming Birthdays Widget
- **Dashboard Quick-Glance**: Implement an `<UpcomingBirthdays />` card natively on the main `app/page.tsx` Dashboard. By querying `birthMonth` and `birthDay` against the current UTC date, the system will highlight members whose birthdays fall within the upcoming 7-14 days.
- **Actionable UI**: Provide a direct 1-click CTA inside the widget to route the admin to the `/admin/sms` composer, automatically pre-filling the birthday member's contact block for quick celebratory outreach.

### D. Workflow & Documentation Enforcement
- **Continuous Integration**: Ensure that periodic `git commit` operations are executed granularly after every major feature transition (UI separation, chart development, endpoint relaxing).
- **Living Documentation**: The `README.md` changelog and `docs.md` feature summaries must be updated synchronously alongside functional code pushes to prevent documentation debt.

---

## 15. Phase 4: Dynamic Communication Templates
- [x] **Schema Definitions**: Integrate Prisma `SmsTemplate` model mapping `name`, `content`, and protected `isSystem`/`type` markers.
- [x] **API Endpoints**: Provision explicit CRUD endpoints (`GET/POST /api/sms/templates` and `PATCH/DELETE /api/sms/templates/[id]`) for UI consumption.
- [x] **Administrative UI Panels**: Extend `sms-dashboard.tsx` with a tertiary "Message Templates" interactive pane mapping generic templates for quick modifications alongside a direct integration into the Message composer text area.
- [x] **Cron Hooking**: Overhaul `app/api/cron/birthdays/route.ts` to natively query and serialize the protected 'BIRTHDAY' template text seamlessly preventing hard-coded bottlenecks.

---

## 16. Phase 5: Logic Refinements & Layout Adjustments
*Goal: Address logical edge cases in attendance scoring and streamline the administrative dashboards.*

### A. Dynamic Attendance Baselines
- [ ] **Algorithm Update (`lib/commitment.ts`)**: Refactor the attendance scoring algorithm. Automatically exclude any `Event` whose `date` occurred prior to a user's explicit `joinDate` when calculating their total expected events. This ensures new members aren't penalized for events they mathematically couldn't attend.

### B. Dashboard Re-structuring
- [ ] **Widget Migration**: Extract the `<UpcomingBirthdays />` widget from `app/page.tsx` and remount it on `app/members/page.tsx`. Per recent updates, it must be placed full-width *underneath* the Member List component, constrained to 5 tracking days instead of 14, and made vertically scrollable to preserve layout space.
- [ ] **Redundant CTA Removal**: Strip the manual "Send SMS" CTA button from the `<UpcomingBirthdays />` component, as the newly integrated cron job (`/api/cron/birthdays`) now handles these dispatches autonomously.
- [ ] **Member Attendance Context**: Integrate the `SemesterSelector` filter natively onto the Member page/attendance history so that an individual member's attendance can be dynamically filtered by academic semester.

### C. Bug Fixes & API Repairs
- [ ] **Event Filtering Breakdown**: Investigate and fix the broken event filters on the frontend.
- [ ] **Semester CRUD Fixes**: Repair the non-functional Edit and Delete buttons on the Semester management page.
- [ ] **SMS Log Hydration**: Ensure the SMS Delivery Logs table correctly live-reloads/updates immediately after a new broadcast dispatch is submitted.
- [ ] **Hubtel Status Desync**: Debug `lib/sms.ts` resolving the false-negative where Hubtel's native `status: 0` (success code) or `0000` is being incorrectly parsed by our backend as a native failure inside `SmsLog`.

### D. Advanced RBAC & Constraints
- [ ] **Strict Active Semester Logic**: Enforce a rigid database or state checking mechanism ensuring only the *latest* semester holds the `ACTIVE` flag, systematically marking all others as `CLOSED`. 
- [ ] **Super-Admin Deletion Locks**: Restrict the ability to `DELETE` a Semester exclusively to the Super Admin account (`urfzone4@gmail.com`). Generic admins will be visually locked out of this action.

### E. UI/UX Modernization & Simplification
- [ ] **Universal Toasters**: Traverse all new, modified, or extended CRUD boundaries (`/api/members`, `/api/semesters`, `/api/sms`) ensuring standard UI implementation of the library "Toaster" successfully notifies users of form success/failures globally across all action responses.
- [ ] **Template Modals**: Rip out the native JavaScript `prompt()`/`confirm()` dialogs currently used for SMS Template creation and replace them with modern, accessible React Modals (Shadcn UI).
- [ ] **New Member Form Simplification**: Remove the manual `currentAcademicLevel` input field entirely. Set `admissionYear` and `startYear` to optional. Build a backend mapping utility to automatically infer their academic level strictly based on the provided admission year.
- [ ] **New Member Grading Strategy**: Introduce a `NEW_MEMBER` status or temporary grace period to prevent newly joined individuals from immediately defaulting to an `UNCOMMITTED` classification before they've had a chance to attend events.
- [ ] **Member List Pagination**: Introduce dynamic array-slicing pagination to the main Member List. Embed a user-selectable "rows-per-page" dropdown (10, 20, 50, All) natively integrated into the filter pane, avoiding monolithic DOM rendering delays.

---

## 17. Phase 6: Zero-Infra Comprehensive Testing Suite
*Goal: Ensure no feature regressions occur during schema changes by writing robust, exhaustive tests for ALL functionalities using a dual-layer approach (Jest Mocks + Playwright), requiring zero external testing DB infrastructure.*

### A. API Unit Tests (Jest + Prisma Mocking)
*Focuses purely on application logic, algorithm validations, and auth boundary checks without hitting a real database.*
- [ ] **Member Profile Validation**: Test Zod payload rejection (missing names, malformed connections).
- [ ] **Commitment Algorithms (`lib/commitment.ts`)**: Test grading percentages transitioning statuses logically across simulated Event logs.
- [ ] **RBAC Isolation**: Unit test API handlers explicitly dropping simulated generic `USER` roles from accessing `/api/semesters` or `/api/sms/send`.
- [ ] **SMS Providers**: Test batch array creation processes and system constraints preventing `BIRTHDAY` template deletion.

### B. Deep E2E Functional Constraints (Playwright)
*Validates real-world relational constraints natively simulating a user interacting with the UI against the local `npm run dev` database loop.*
- [ ] **Member CRUD**: E2E browser tests generating, editing, reading, and deleting Members against valid payload scalar formatting.
- [ ] **Cell Group CRUD**: E2E tests generating, editing, reading, and deleting Cell Groups, assuring aggregate member counts persist correctly.
- [ ] **Semester CRUD**: E2E tests generating, editing, reading, and deleting Semesters, enforcing boundary locks preventing multiple `ACTIVE` flags simultaneously.
- [ ] **Event CRUD**: E2E tests generating, editing, reading, and deleting Events natively bound to active Semester contexts.
- [ ] **Attendance CRUD**: E2E tests simulating `PRESENT`/`ABSENT` data entry workflows and confirming subsequent Pie Chart commitment ratio updates.
- [ ] **SMS Templates CRUD**: E2E tests generating, editing, reading, and deleting custom templates while testing protection bounds around standard `BIRTHDAY` assets.
