# Church Membership & Attendance Tracking App: Feature Extension Plan

## 0. Environment & Database Separation (Do This First!)
- [ ] **Set up dedicated development and testing databases** (e.g., `urf_dev`, `urf_test`) to avoid impacting production data.
- [ ] **Configure environment variables** (`.env.local`, `.env.test`, `.env.production`) for separate database URLs.
- [ ] **Document how to switch between databases** for development, testing, and production.
- [ ] **Test your local/dev environment with the new database before making any schema or code changes.**
- [ ] **Schedule regular database backups** (especially before migrations).
- [ ] **Test backup and restore procedures** to ensure you can recover from migration errors.

---

## Purpose
This plan outlines the steps to extend the current church management system with robust semester-based tracking, analytics, and SMS automation, as specified in your requirements. The goal is to incrementally add features without breaking existing workflows or data, and to support analytics and reporting for multiple semesters.

---

## 1. Preparation & Safety
- **Review current codebase**: Audit models, API routes, and UI for member, attendance, and reporting logic.
- **Set up a feature branch**: Work in a new git branch (e.g., `feature/semester-tracking`) to avoid breaking production.
- **Back up the database**: Export current data before making schema changes.

---

## 2. Semester Management
- [ ] **Design & add Semester model** to the database (Prisma schema):
    - Fields: `id`, `name`, `start_date`, `end_date`, `academic_year`, `status` (active, closed)
- [ ] **Create admin UI** for listing, creating, and editing semesters.
- [ ] **Enforce only one active semester** and prevent overlapping dates (backend & UI validation).
- [ ] **Auto-carry forward active members** and reset attendance on new semester creation.
- [ ] **Lock editing of dates once semester is active.**
- [ ] **Prevent deletion of semesters with attendance records.**

---

## 3. Semester Selection & Context
- [ ] **Add semester selector UI** (dropdown or top bar) visible on all analytics/reporting/admin pages.
- [ ] **Store selected semester in context or global state.**
- [ ] **Ensure all queries, analytics, and reports use the selected semester as a filter.**
- [ ] **Default to the active semester on login.**

---

## 4. Attendance & Member Classification
- [ ] **Update Attendance model** to reference `semester_id` and `service_type`.
- [ ] **Implement attendance thresholds** (configurable per semester).
- [ ] **Auto-calculate commitment status** per member per semester (committed, uncommitted, below threshold).
- [ ] **Allow admin override** of commitment status, with logging (admin_id, timestamp, reason).
- [ ] **Update member list/reporting UI** to show commitment status and flags, per semester.
- [ ] **Ensure all attendance and member queries are semester-aware.**

---

## 5. New Member & Academic Level Tracking
- [ ] **Track first-time attendees** per service, per semester.
- [ ] **Add academic level field** to member profiles; infer from admission year and semester.
- [ ] **Report new Level 100 members** per semester.
- [ ] **Track academic level transitions per semester.**

---

## 6. Analytics & Reporting (Multi-Semester)
- [ ] **Update dashboards and reports** to:
    - Filter by semester (using selector)
    - Show all required metrics (totals, committed/uncommitted, new members, academic levels, averages, etc.)
    - Compare across semesters (side-by-side or trend views)
    - Show growth trends (monthly, weekly, per service)
    - Show average attendance per service type, per semester (as a number)
    - Show consistent/inconsistent member counts per semester
- [ ] **Add export options** (PDF, CSV) for all reports.
- [ ] **Ensure all analytics are numeric and easy to compare across semesters.**

---

## 7. Data Migration & Historical Data
- [ ] **Assign all existing attendance and member records to a default/initial semester.**
- [ ] **Write migration scripts for new/changed database fields.**
- [ ] **Validate historical data integrity and immutability.**

---

## 8. Birth Date Handling & Automation
- [ ] **Store only day and month** for birth dates (no year).
- [ ] **Add disclaimer in UI** for birth date entry.
- [ ] **Implement daily birthday check job** (backend script or cron job).
- [ ] **Send birthday SMS and notify admins** on dashboard.

---

## 9. SMS System
- [ ] **Build SMS composition UI** with recipient filters (semester, commitment, academic level).
- [ ] **Integrate with local SMS provider**.
- [ ] **Support manual and scheduled SMS** (including birthdays and event reminders).
- [ ] **Show delivery status and logs** in the UI.

---

## 10. UI/UX Improvements
- [ ] **Add semester context to all relevant screens and navigation.**
- [ ] **Update all relevant screens to respect selected semester context.**
- [ ] **Follow UI/UX guidelines for clarity, confirmation, and context.**
- [ ] **Ensure all admin actions require confirmation.**

---

## 11. Testing & Migration
- [ ] **Test all new features in staging/dev environment.**
- [ ] **Validate data integrity after migration.**
- [ ] **Get feedback from admins before production rollout.**

---

## 12. Documentation & Training
- [ ] **Update README and user guides for new features.**
- [ ] **Document admin workflows for semester management, reporting, and SMS.**
- [ ] **Provide training/demo for admins if needed.**

---

## 13. Environment & Testing Database
- [ ] **Set up a dedicated development and testing database** (e.g., `urf_dev`, `urf_test`) to avoid impacting production data.
- [ ] **Configure environment variables** (`.env.local`, `.env.test`, `.env.production`) for separate database URLs.
- [ ] **Document how to switch between databases** for development, testing, and production.

---

## 14. Feature Flags & Rollback
- [ ] **Implement feature flags** for major new features (e.g., semester analytics, SMS automation) to allow safe rollout and easy rollback if issues arise.
- [ ] **Document how to enable/disable features** for admins and developers.

---

## 15. Data Integrity & Backups
- [ ] **Schedule regular database backups** (especially before migrations).
- [ ] **Test backup and restore procedures** to ensure you can recover from migration errors.

---

## 16. Developer Onboarding & Contribution
- [ ] **Update developer documentation** to include new setup steps for semester features and database migrations.
- [ ] **Add code review checklist** for semester-aware features (e.g., “Does this query respect the selected semester?”).

---

## 17. Monitoring & Error Reporting
- [ ] **Add monitoring/logging** for new semester features and SMS jobs.
- [ ] **Set up error alerts** for failed jobs (e.g., birthday SMS, data migration).

---

## Notes
- All changes should be backward compatible and not disrupt current member/attendance workflows.
- Use feature flags or staged rollout for risky features.
- Keep UI simple and feedback clear for non-technical users.
- Start with database and backend changes, then update the UI, and finally add automation and reporting. Test each step before moving to the next.
