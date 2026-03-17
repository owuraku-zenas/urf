# Church Membership & Attendance Tracking App: Comprehensive Feature Extension Plan

## 0. Environment & Database Separation (Complete)
- [x] **Set up dedicated development and testing databases** (e.g., `urf_dev`, `urf_test`) to avoid impacting production data.
- [x] **Configure environment variables** (`.env.local`, `.env.test`, `.env.production`) for separate database URLs.
- [x] **Document how to switch between databases** for development, testing, and production.
- [x] **Test your local/dev environment with the new database before making any schema or code changes.**
- [x] **Schedule regular database backups** (especially before migrations).
- [x] **Test backup and restore procedures** to ensure you can recover from migration errors.

---

## Purpose
This plan outlines the steps to extend the current church management system with robust semester-based tracking, analytics, and SMS automation. This document has been heavily expanded to be highly specific regarding database relationships, full CRUD (Create, Read, Update, Delete) implementation, and data migrations.

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

## 3. Database Schema: Relational Expansion
*These steps are critical for permanently linking all app data to specific semesters.*

- [ ] **Establish `Semester` <-> `Attendance` Relationship:**
    - Update `Attendance` model in `schema.prisma`.
    - Add field `semesterId String?`.
    - Add relation: `semester Semester? @relation(fields: [semesterId], references: [id])`.
    - *(Optional but recommended)* Make `semesterId` required after initial data migration.
- [ ] **Establish `Semester` <-> `Event` Relationship:**
    - Since attendance is tied to events, update `Event` model in `schema.prisma`.
    - Add field `semesterId String?`.
    - Add relation: `semester Semester? @relation(fields: [semesterId], references: [id])`.
- [ ] **Establish `Semester` <-> `Member` Relationship (For Commitment tracking):**
    - Create a new join model `SemesterCommitment` to track a member's status per semester.
    - Fields: `id`, `memberId`, `semesterId`, `status` (COMMITTED, UNCOMMITTED, AT_RISK), `overrideReason` (if admin overrides).
    - Establish relations to both `Member` and `Semester`.
- [ ] **Run Prisma Migrations:**
    - Run `npx prisma migrate dev --name add-semester-relations`.
    - Generate prisma client `npx prisma generate`.

---

## 4. Semester Selection & Context (Complete)
- [x] **Add semester selector UI** (dropdown or top bar) visible on all analytics/reporting/admin pages.
- [x] **Store selected semester in context or global state.**
- [x] **Ensure all queries, analytics, and reports use the selected semester as a filter.**
- [x] **Default to the active semester on login.**

---

## 5. Attendance & Event CRUD Optimization
- [ ] **Create/Update Event (Backend)**: Modify `POST /api/events` and `PATCH /api/events/[id]` to require and save `semesterId`.
- [ ] **Create/Update Attendance (Backend)**: Modify attendance logging logic to automatically attach the `active` (or currently selected) `semesterId` to every new `Attendance` record.
- [ ] **Read Events & Attendance (Backend)**: Update `GET` queries to accept a `semesterId` query parameter, filtering out data from outside the selected semester window.
- [ ] **Auto-calculate commitment status** per member per semester (committed, uncommitted, below threshold).
- [ ] **Implement attendance thresholds** (configurable per semester).
- [ ] **Allow admin override** of commitment status, with logging (admin_id, timestamp, reason).
- [ ] **Update UI (Frontend)**: Update the events calendar and attendance logging pages to explicitly show the active semester they are recording against.

---

## 6. Member Classification & Level Tracking
- [ ] **Track first-time attendees** per service, per semester.
- [ ] **Add academic level field** to member profiles; infer from admission year and active semester.
- [ ] **Report new Level 100 members** per semester.
- [ ] **Update Member CRUD**: Add academic level and admission year to Member Creation (`POST`) and Edit (`PATCH`) forms.

---

## 7. Data Migration: Historical Cleanup
*Before enforcing `semesterId` as mandatory on Attendance/Event tables, historical data must be cleaned.*

- [ ] **Create a "Legacy" or "Initial" Semester** in the database.
- [ ] **Write a Node.js data migration script** (`scripts/migrate-historical-semesters.ts`):
    - Find all `Event` records missing a `semesterId`. Assign them to the Legacy semester (or map them based on their exact `date` if previous semester dates are known).
    - Find all `Attendance` records missing a `semesterId` and do the same.
- [ ] **Execute migration script in production/staging**.
- [ ] *(Optional)* Update `schema.prisma` to make `semesterId` strictly required (`String` instead of `String?`), then create a final migration.

---

## 8. Analytics & Reporting UI (Multi-Semester)
- [ ] **Update Dashboards (Read/GET)** to dynamically fetch data based on the Global Semester Context `id`:
    - Show totals: Total events, total attendances, unique attendees.
    - Show commitment breakdowns.
    - Compare across semesters (e.g., Spring vs Fall).
- [ ] **Add export options** (PDF, CSV) for all reports.

---

## 9. Birth Date Handling & Automation
- [ ] **Update Member Schema**: Store only day and month for birth dates (no year).
- [ ] **Add disclaimer in UI** for birth date entry.
- [ ] **Implement daily birthday check job** (backend script or cron job).
- [ ] **Send birthday SMS and notify admins** on dashboard.

---

## 10. SMS System
- [ ] **Build SMS composition UI** with recipient filters (semester, commitment, academic level).
- [ ] **Integrate with local SMS provider** via API.
- [ ] **Backend APIs**: Create `POST /api/sms/send` and `GET /api/sms/logs`.
- [ ] **Support manual and scheduled SMS** (including birthdays and event reminders).
- [ ] **Show delivery status and logs** in the UI.

---

## 11. Testing & Migration
- [ ] **Test all new features in staging/dev environment.**
- [ ] **Validate data integrity after migration.**

---

## 12. Conclusion & Summary
- All changes must be backward compatible.
- The core of this structural upgrade relies on establishing explicit Prisma relations to the `Semester` model across `Event`, `Attendance`, and `Member` (via `SemesterCommitment`), allowing for robust, isolated semantic querying across different academic periods.
