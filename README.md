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

---

### How to Use This Log
- Every time a major change is made (e.g., migration, new model, new UI, new API), add a dated entry here.
- Summarize what was changed, why, and any important notes for future developers or admins.
- Use this as a quick reference for project history and onboarding.

---

## Next Steps
- [ ] Create and switch to feature branch: `feature/semester-tracking`
- [ ] Add Semester model to Prisma schema
- [ ] Update Attendance and Member models for semester support
- [ ] Implement semester selection UI and context
- [ ] Update all analytics and reports to be semester-aware

See `plan.md` for the full roadmap.
