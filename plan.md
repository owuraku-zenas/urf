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
- [ ] Add `semesterId String?` to the `Event` model in `schema.prisma`.
- [ ] Establish relation: `semester Semester? @relation(fields: [semesterId], references: [id])` inside the `Event` model.
- [ ] Update `Semester` model to include a reverse relation: `events Event[]`.

### B. The `Attendance` <-> `Semester` Relationship
*Decided against direct linkage.* Attendance is implicitly linked to a Semester entirely through the `Event` it is attached to. No `semesterId` goes on the `Attendance` model.

### C. The `Member` <-> `Semester` Relationship
*Members exist across semesters, but their "commitment level" changes per semester. We need a join table.*
- [ ] Create new model `SemesterCommitment`.
- [ ] Add fields: 
  - `id String @id @default(cuid())`
  - `memberId String`
  - `semesterId String`
  - `status CommitmentStatus @default(UNCOMMITTED)` (Enum: COMMITTED, UNCOMMITTED, AT_RISK)
  - `overrideReason String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- [ ] Establish relations to `Member` and `Semester`.
- [ ] Add compound unique constraint: `@@unique([memberId, semesterId])` to ensure one commitment record per member per semester.

### D. Run Migrations
- [ ] Run `npx prisma migrate dev --name add-exhaustive-semester-relations`.
- [ ] Run `npx prisma generate` to update the TypeScript client.

---

## 4. Semester Selection & Context (Complete)
- [x] **Add semester selector UI** (dropdown or top bar) visible on all analytics/reporting/admin pages.
- [x] **Store selected semester in context or global state.**
- [x] **Ensure all queries, analytics, and reports use the selected semester as a filter.**
- [x] **Default to the active semester on login.**

---

## 5. Exhaustive CRUD Updates for Existing Models

### A. Event CRUD Updates
- [ ] **Create (POST `/api/events`)**: 
  - Update validation schema to require `semesterId`.
  - Pass `semesterId` payload to `prisma.event.create()`.
- [ ] **Read (GET `/api/events`)**: 
  - Accept `?semesterId=xyz` parameter.
  - Update `prisma.event.findMany()` where clause to filter by `semesterId`.
- [ ] **Update (PATCH `/api/events/[id]`)**: 
  - Allow `semesterId` to be updated if an event was miscategorized.
- [ ] **Frontend**: Update the Event Creation modal/form to include a hidden field or automatic assignment of the currently active/selected semester from Context.

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
- [x] **UI Update**: Change frontend date picker to only request `Month` and `Day` with a visual disclaimer about privacy.
- [x] **Schema Update**: Ensure `dateOfBirth` doesn't strictly depend on a valid year, or mock the year to `1970` uniformly.
- [x] **Cron Job Job**: Implement a daily cron script (using Vercel Cron or GitHub Actions) that queries `prisma.member.findMany` where birth month/day equals today.
- [ ] **Integration**: Connect Cron result to SMS backend.

---

## 10. SMS System
- [ ] **Provider Integration**: Select local provider, store API keys in `.env`, create `lib/sms.ts` wrapper.
- [ ] **Backend APIs (`/api/sms/send`)**:
  - Accept payload: `message`, `recipientIds`, `filters`.
  - Fetch user phone numbers.
  - Dispatch to provider, return tracking IDs.
- [ ] **Build SMS UI**:
  - Create `/admin/sms` page.
  - Add Member Multi-Select table, with quick-filters for "All Commited", "All Level 100s", "All in active semester".
  - Text area for composition with character count formatting.
- [ ] **Logs Model**: Add an `SmsLog` model to prisma to track sent messages and statuses.
- [ ] **Show Logs UI**: Display delivery history.

---

## 11. Testing & Quality Assurance
*Comprehensive test coverage is required to ensure these critical relational changes do not compromise the integrity of the application.*

### A. Unit Testing (Backend Logic)
- [ ] **Setup Test Environment**: Ensure `.env.test` correctly targets `urf_test` database.
- [ ] **Test Commitment Logic**: Write isolated Jest tests for `lib/commitment.ts`. Provide mock attendance data and assert that the correct threshold triggers the transition between UNCOMMITTED and COMMITTED per semester.
- [ ] **Test Utility Functions**: Write unit tests for the level progression algorithm (e.g., verifying `admissionYear` 2024 evaluates correctly in `academicYear` 2026).

### B. Integration Testing (APIs & Database)
- [ ] **Semester CRUD API Tests**:
  - Test `POST /api/semesters` blocking date overlaps.
  - Test `POST /api/semesters` enforcing single active status.
  - Test Admin authorization bounds (expecting 401s for non-admin users).
- [ ] **Event & Attendance API Tests**:
  - Test `POST /api/events` successfully capturing the provided `semesterId`.
  - Test `POST /api/attendance` correctly inheriting `semesterId` from the active context.
  - Test `GET /api/events` filtering by specific `semesterId` parameters.

### C. End-to-End Testing (Frontend UI)
- [ ] **Semester Switching Workflow**: Use Playwright/Cypress to log in as Admin, create a semester, and toggle the global Semester Context dropdown to verify the React state updates dynamically across all dashboard charts and list views.
- [ ] **Member Creation & Level Selection**: Create an E2E test verifying a new member can be created successfully with the new `admissionYear` and `joinedSemesterId` dropdowns.
- [ ] **Admin Protected Routes**: E2E test to navigate directly to `/semesters` URL as an unauthorized base user to confirm the middleware redirects to `/`.

### D. Migration Testing
- [ ] **Dry-Run Historical Migration**: Run the `migrate-historical-semesters.ts` script against a copy of the production database (`urf_test`) before executing in production.
- [ ] **Assertion**: Assert that `0` records remain where `semesterId === null` in the `Event` table.

---

## 12. Conclusion & Summary
- All changes must be backward compatible.
- The core of this structural upgrade relies on establishing explicit Prisma relations to the `Semester` model across `Event`, `Attendance`, and `Member` (via `SemesterCommitment`), allowing for robust, isolated semantic querying and accurate reporting across different academic periods.
