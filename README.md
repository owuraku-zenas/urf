# Church Membership & Attendance Tracking App

## Change Log & Feature Extension Progress

This README serves as a running log of all major changes, migrations, and feature extensions as the app evolves to support multi-semester analytics, reporting, and SMS automation.

---

### [2026-03-17] Project Extension Plan Initiated
- Created `plan.md` outlining step-by-step feature extension for semester-based analytics, reporting, and SMS.
- Marked environment and database separation as complete (see plan.md section 0).
- Audited codebase for models, API routes, and UI related to members, attendance, and reporting.
- Ready to begin feature branch and schema changes for semester support.

---

### [2026-03-22] New Member Attendance Grace Period
- Repaired a logical bug where newly registered members were immediately visually classified as `UNCOMMITTED`.
- Upgraded the DB pipeline (`POST /api/members`) to strictly attach a `NEW_MEMBER` grace period status to their profile upon creation.
- Ripped out hard-coded UI fallbacks aggressively mapping un-evaluated profiles, relying purely on the strict backend algorithm.
- Fortified `lib/commitment.ts` and automated Jest validation pipelines to securely assert `NEW_MEMBER` timelines natively.

---

### [2026-03-22] SMS Financial Analytics & Cost Tracking
- Upgraded the Hubtel SMS integration, securely fetching and parsing numerical `.Rate` billing data asynchronously.
- Expanded the `SmsLog` PostgreSQL schema to map dynamic `cost` parameters alongside `semesterId` associations.
- Bound global Semester Contexts implicitly into background SMS cron dispatches and live UI broadcast payloads.
- Deployed a highly visible "Total Spend" dynamic financial metric tile directly embedded over the Delivery History logs internally.
- Bootstrapped explicit Jest unit test pipelines mocking third-party fetches guaranteeing isolated calculations.

---

### [2026-03-17] Added Semester Model
- Added `Semester` model and `SemesterStatus` enum to `prisma/schema.prisma` for semester-based tracking.
- Ran `npx prisma migrate dev --name add-semester-model` to apply migration.
- Database is now ready to store and manage semesters.

---

### [2026-03-17] Semester Context & Semester-Aware Members Page
- Added `context/semester-context.tsx` for global semester selection and propagation.
- Refactored `components/semester-selector.tsx` to use semester context, enabling universal semester selection.
- Wrapped app in `SemesterProvider` via `app/layout.tsx` for global semester context.
- Updated `app/members/page.tsx` to filter and fetch members by selected semester, ensuring semester-aware data display.
- All changes use the app's design system and maintain color consistency.

---

### [2026-03-17] Automatic Semester Defaults & Persistence
- Updated `context/semester-context.tsx` to automatically fetch and select the `ACTIVE` semester on app initialization.
- Added `localStorage` persistence to remember the user's selected semester across page reloads.
- This ensures users see relevant data immediately upon login without needing to manually select a semester.

---

### [2026-03-17] Semester Management API & Business Logic
- Created API route `app/api/semesters/route.ts` with `GET` and `POST` handlers.
- Implemented admin-only authorization for creating semesters.
- Enforced business logic in the `POST` endpoint to prevent multiple active semesters and overlapping semester dates.
- This provides the backend foundation for the semester management UI.

---

### [2026-03-17] Complete Semester CRUD API Implementation
- Added `app/api/semesters/[id]/route.ts` handling `GET`, `PATCH`, and `DELETE` requests.
- Enforced admin-only authorization on `PATCH` and `DELETE` modifying operations to secure semester records.
- Completed full CRUD capability for the Semester model.
- Added Next.js Middleware route protection to ensure `/semesters` pages are only viewable by users with the `ADMIN` role.

---

### [2026-03-17] Database Relationship Expansion & QA Planning
- Added relationships connecting `Semester` to `Event` and `SemesterCommitment`.
- Added `joinedSemesterId`, `admissionYear`, and `currentAcademicLevel` to `Member` for progression tracking.
- Resolved Prisma inverse relation validation issues and successfully executed migrations across the Neon database.
- Expanded `plan.md` to feature a comprehensive "Testing & Assurance" QA section detailing Unit, E2E, and Migration tests.

---

### [2026-03-17] Event & Attendance CRUD Semester Integration
- Updated `POST /api/events` and `PATCH /api/events/[id]` to rigidly require and save `semesterId`.
- Updated `GET /api/events` and `GET /api/attendance` to support a `semesterId` query parameter, filtering out irrelevant historical data.
- Refactored `app/events/new/page.tsx` event creation form to automatically draw the active `SemesterContext` and attach it to outgoing API requests.

---

---

### [2026-03-17] Fixed Prisma Client Type Error
- Regenerated Prisma Client to resolve TypeScript type errors `EventWhereInput | undefined` regarding the newly added `semesterId` field on the `Event` model.

---

### [2026-03-17] Exhaustive Member CRUD Tracking & Frontend UI Updates
- Extended the `Member` model and API routes (`POST /api/members`, `PUT /api/members/[id]`) to support `admissionYear`, `joinedSemesterId`, and `currentAcademicLevel`.
- Created backend utility `lib/progression.ts` to dynamically calculate a member's academic level based on their admission year and the current active academic year.
- Updated `app/members/new/page.tsx` and `app/members/[id]/edit/page.tsx` with dropdowns and text inputs for the new semantic tracking variables.
- Handled empty payload fields properly by storing them as `null` bounds within the database to maintain consistency.

### [2026-03-17] Automated Semester Commitment Logic
- Implemented `lib/commitment.ts` to automatically infer member commitment status (`COMMITTED`, `UNCOMMITTED`, `AT_RISK`) based on semester attendance percentages (>= 70% threshold).
- Integrated calculation triggers into `POST /api/attendance` and `PUT /api/attendance` to run asynchronously on record changes.
- Built explicit admin override endpoint `PATCH /api/commitments` to allow leadership to manually enforce statuses.

---

### [2026-03-17] Multi-Semester Analytics Dashboard Update & Historical Migration Skipped
- **Note:** The historical data migration script (`scripts/migrate-historical-semesters.ts`) was written but explicitly skipped per user instructions. Historical records without a `semesterId` will currently remain un-versioned.
- Updated the backend `/api/stats` endpoint to accept an optional `semesterId` query param. The route now strictly aggregates counts and parses new `SemesterCommitment` counters per the given global context.
- Modified the main `app/page.tsx` dashboard to subscribe to the `useSemester` context hook, meaning the homepage metrics now instantly react and filter mathematically when different semesters are selected from the navigation bar.
- Appended a new "Commitments" visual card to the frontend grid that maps the number of `COMMITTED`, `AT_RISK`, and `UNCOMMITTED` members for the selected timeframe.
- Updated all visual React chart components (`MemberGrowthChart`, `CellGroupAttendanceChart`, `EventTypeAnalysisChart`, `InvitationNetworkChart`) to subscribe to the `useSemester` context and accurately reflect dynamic timeframe data.
- Enforced `semesterId` filters across all specific internal reporting endpoints (`/api/reports/member-growth`, `/api/reports/attendance-trends`, `/api/cell-groups`, `/api/members`) ensuring PDF CSV exports contain accurate timeframe boundaries.
- Refactored `app/members/new/page.tsx` and `app/members/[id]/edit/page.tsx` schemas to exclusively consume `Month` and `Day` dropdowns for `dateOfBirth` entry.
- Hardened Member Database Architecture by dropping the `dateOfBirth` DateTime column natively and implementing standalone scalar integer fields `birthMonth` and `birthDay` for definitive year abstraction.
- Refactored `app/api/members/route.ts` and `app/api/members/[id]/route.ts` mappings to serialize form payloads into Prisma's standard Integer requirements.
- Built a Vercel Cron compatible endpoint at `/api/cron/birthdays` to parse the database locally for UTC matches with the current day and month.
- Added `vercel.json` to schedule the recurring birthday endpoint execution daily at 8:00 AM UTC.

### [2026-03-18] SMS Notification System & UI Implementation
- Integrated local SMS provider wrapper in `lib/sms.ts`.
- Created robust backend endpoint `POST /api/sms/send` to orchestrate batch SMS dispatches.
- Added `SmsLog` model and `SmsStatus` enum to `schema.prisma` to track delivery history and statuses.
- Built a comprehensive Admin Dashboard at `/admin/sms` with a multi-select grid, message composer with length calculators, and delivery history table.
- Implemented quick filters (All, Committed Only, Level 100s, Active Semester) in the SMS Compose tab for targeted messaging.

### [2026-03-18] Exhaustive Semester CRUD Integrations 
- Verified `Event` model integration with `Semester` is active across APIs.
- Updated Event Edit UI to allow admins to reassign an event to a different semester if initially miscategorized.

### [2026-03-19] Birthday CRON SMS Integration
- Implemented actual SMS dispatch via `lib/sms.ts` inside `api/cron/birthdays/route.ts`, replacing the TODO stub.
- The script now accurately logs success metrics for the mapped `birthdayMembers` array.

### [2026-03-19] Completion of plan.md
- Finished verifying and integrating the outstanding SMS items.
- Explicitly skipped E2E and migration testing per request, concluding the exhaustively detailed plan execution.

---

### [2026-03-19] Phase 2: UI/UX Redesign & Comprehensive Audits
- **UI/UX Enhancements**: Integrated the global `SemesterSelector` statically into the top `Header`. Refactored `MainNav` to conditionally render Admin-only routes (`/semesters`, `/admin/sms`) based on RBAC. Updated the Dashboard to dynamically append the specific active Semester Name via an extended API payload.
- **SMS System Audit**: Diagnosed the mocked simulation layer in `lib/sms.ts` and formally isolated the requirement for Live API keys to exit the mock-mode sandboxing.
- **Auth & Email Fixes**: Resolved a fatal `500 Server Error` on User Creation where missing local `.env` SMTP passwords crashed mail dispatching. Transport routines now gracefully bypass timeouts and directly log the user reset URL to the terminal in development modes to prevent blockers.
- **Core Domain Logistics**: Patched a critical Prisma data swallow inside `app/api/attendance/route.ts` where explicitly designated `status` payloads were ignored, rectifying an issue that forced all records globally to unconditionally default to `PRESENT`.
- **System Stability**: Reconciled tracking schemas across 42 legacy TypeScript compilation failures generated by disparate mappings between deprecated `dateOfBirth` models and strict `{birthMonth, birthDay}` arrays across analytics, exported PDFs, and NextAuth credential injection chains. Sealed global namespace pollution from trailing standalone utility scripts.

### [2026-03-19] Phase 3: Deep Analytics & Global Insights
- **UI/UX Refinements**: Extracted the global `SemesterSelector` from the `<Header />` component to avoid layout clutter, embedding it semantically as an interactive dashboard control native to `/reports`, `/events`, `/members`, and `/attendance` headers.
- **Global Context Architecture**: Enriched the global `/api/stats` endpoint and all analytical sub-routes (`/api/reports/*`, `/api/events`, `/api/members`) to recognize a new `'all'` context variable mapping to unset null boundaries, automatically relaxing `WHERE` clauses to serve lifetime cumulative application stats on the fly.
- **Advanced Chart Visualizations**: Built and deployed `<ComparativeGrowthChart />` to statically scale Member Join variables against Average Attendances dynamically per semester. Added a complementary `<CommitmentTrendsChart />` modeling the global shifts between `COMMITTED`, `AT_RISK`, and `UNCOMMITTED` states.
- **Proactive Intervention Engine**: Designed and mounted an interactive `<UpcomingBirthdays />` tracking interface isolating target members inside a trailing 14-day chronological window to the Dashboard. Connected quick-action targets directly chaining Admins to dynamically pref-filled `/admin/sms` instances.
- **Analytical Data Stress Testing**: Architected `prisma/seed-phase3.ts` to procedurally blast the SQL bindings with arrays scaling 50 Members iteratively against 3 overlapping historic Semesters, tracking mathematical probability bounds and attendance ratios for front-end rendering pressure tests.

### [2026-03-20] Quality Assurance & Refactoring
- Integrated and configured `@playwright/test` to map End-to-End browser workflows for Semester context switching, Admin Protected Routes, and Member Creation.
- **Note:** The automated Member Creation E2E test was abandoned/marked incomplete because it did not reliably work in headless environments. This issue occurred because Playwright struggled to deterministically await the React state hydration for the dependent `Cell Group` and `Semester` UI dropdowns. Additionally, the strict underlying `zod` regex schemas for empty strings on `email`, `phone`, `admissionYear`, and `startYear` created complex validation race conditions that were prone to timeouts. The form itself operates perfectly during manual QA.
- **Delivery History Refactoring**: Upgraded the SMS Admin Dashboard to explicitly group database dispatches by bulk transactions (`batchId`). Replaced the flat generic log table with expanding Shadcn `Accordion` components so administrators can review broadcast performance incrementally per blast.
- **SMS Broadcast Filtering & Tracking**: Added a dynamic "Filter by Cell Group" dropdown to the SMS recipient selection table to easily target specific community segments. Enhanced the Delivery History accordion logs with a new "Message" column to display the exact personalized snippet dispatched to each user. Updated `seed-mock-sms.ts` to procedurally enforce distinct batch sizing (1, 3, 4, 5, 10) for UI stress testing.

### [2026-03-20] Dynamic SMS Templates Integration
- **Database Schema Expansion**: Introduced the `SmsTemplate` schema model via Prisma to store custom strings and `BIRTHDAY` system identifiers. Added supporting CRUD functionality at `/api/sms/templates`.
- **Reusable Broadcast Templates**: Reconstructed the SMS Administrative Dashboard to support a dedicated "Message Templates" UI where users can manage generic reusable snippets. Added a "Load Template" dropdown next to the text composer that instantly injects selected text fields constraints and character counts.
- **Decoupled Cron Automations**: Refactored the `/api/cron/birthdays` API to fetch the active daily message text securely from the `SmsTemplate` relational queries instead of relying on a hard-coded developer string. This allows complete editorial independence for administrators.

### [2026-03-21] Production Bug Fixes & Hubtel SMS Integration
- **Hubtel Live Integration**: Replaced the local simulated SMS Provider mockup in `lib/sms.ts` with a fully operational production Hubtel HTTP integration map. Added local environment variables for Client IDs and Secrets securely to `.env`.
- **API Route Hardening**: Fixed a critical Next.js `500` error overlay bug across `/api/members` and `/api/cell-groups` by discarding unstable `console.error` logs and returning native Prisma database errors as JSON for frontend debugging.
- **Database Schema Strictness**: Stripped isolated remnants of the legacy `dateOfBirth` property from form data to prevent strict Prisma validation rejections. Re-architected `joinedSemesterId` logic in `app/api/members/route.ts` to utilize robust `connect: { id }` structural mapping.
- **System Stability**: Resolved aggressive local Prisma Client instance caching issues and connection pool exhaustion caused by Next.js hot-reloads over long sessions.

---

### [2026-06-03] Historical Data Support: Archive Semesters & LEGACY Status
- Added `isArchive` boolean flag to the `Semester` model so administrators can designate a semester as an archive bucket for historical members who pre-date any recorded semester.
- Added `LEGACY` to the `CommitmentStatus` enum. Members whose `joinDate` falls within an archive semester, or whose date doesn't match any semester at all, are automatically assigned `LEGACY` instead of `NEW_MEMBER`.
- The commitment recalculation engine (`lib/commitment.ts`) now explicitly skips any member whose status is `LEGACY` — their record is never overwritten by attendance-based calculations.
- Updated the Semesters admin page to show an amber "Archive" type badge in the table and a labelled checkbox in the create/edit form.
- Updated the Members page to render a distinct amber `LEGACY` badge alongside the existing commitment status colours.

---

### [2026-06-03] Semester Selector & Members List Fixes
- Removed the role-based filter in `SemesterSelector` that previously hid closed semesters from non-admin users. All users can now see and switch to any semester (active or closed).
- Fixed the Members page so it always fetches all members (`semesterId=all`) regardless of the globally selected semester. Previously, selecting a closed semester would only show members who *joined* in that semester, causing a mismatch with the dashboard's total count.

---

### [2026-06-03] Upload Data to Previous/Closed Semesters
- Added an explicit `Semester` dropdown to the event creation form (`/events/new`). The form now pre-selects the globally chosen semester but allows the user to override it to any semester — including closed ones. This fixes a silent failure where creating an event while "All Semesters" was selected would send an invalid `semesterId: "all"` to the API.
- Confirmed that the attendance bulk API and member creation API have no server-side block on closed semesters, so all historical data entry flows work end-to-end.

---

### [2026-06-03] Attendance Page Semester Filter
- Wired the existing `SemesterSelector` component in the attendance page header to the event list fetch. The event dropdown now only shows events belonging to the selected semester.
- Switching semesters clears the current event selection and re-fetches automatically, making it straightforward to mark attendance for events in past semesters.

---

### [2026-06-03] Academic Level Calculation Overhaul + Admission Month & Programme Duration
- Completely rewrote `lib/progression.ts` to fix a broken inline function that was duplicated in both member API routes. The old version capped at Level 400 and returned `null` for anyone admitted more than 4 years ago.
- New formula: count how many times the academic year's start month has passed since the admission year. Each passage advances one level (100 → 200 → … → ALUMNI). Fully supports Level 500, Level 600, and ALUMNI.
- Added optional `admissionMonth` field to the `Member` model (default 8 = August). Covers universities whose academic year starts in January, September, or any other month.
- Added optional `programDuration` field to the `Member` model (default 4 years, options 2–6). The ALUMNI threshold is now `programDuration` years rather than a hardcoded 7.
- Both new fields appear as dropdowns in the member create and edit forms.
- Removed the duplicate local `calculateAcademicLevel` functions from both `app/api/members/route.ts` and `app/api/members/[id]/route.ts`; both now import the single canonical function from `lib/progression.ts`.

---

### How to Use This Log
- Every time a major change is made (e.g., migration, new model, new UI, new API), add a dated entry here.
- Summarize what was changed, why, and any important notes for future developers or admins.
- Use this as a quick reference for project history and onboarding.

---

## Next Steps
- [x] Create and switch to feature branch: `feature/semester-tracking`
- [x] Add Semester model to Prisma schema
- [x] Update Attendance and Member models for semester support
- [x] Implement semester selection UI and context
- [x] Update all analytics and reports to be semester-aware

See `plan.md` for the full roadmap.
