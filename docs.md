# App Documentation: URF Management System

## Overview
Universal Radiant Family (URF) is a comprehensive Church Membership and Attendance Tracking application. It is designed to streamline administrative tasks, ensure accurate member record-keeping, facilitate attendance taking, and enable powerful analytics over time.

The application is structured around a **Semester** system, making it easy to track attendance trends, membership growth, and generate reports within bound timeframes (e.g., First Semester 2025/2026, Second Semester 2025/2026).

---

## Core Features

### 1. Semester-Based Tracking & Analytics
All data within the application is contextualised by Semesters.
- **Global Semester Context:** The app auto-detects and sets the Active semester on login. All users (admin and non-admin) can switch to any past closed semester to view or enter historical data.
- **Archive Semesters:** A special "Archive" semester type can be created to act as a catch-all bucket for members who joined before any recorded semester. Members assigned to an archive semester receive a `LEGACY` commitment status.
- **Reporting & Trends:** Attendance data and membership reports automatically filter to reflect the selected semester, or can be set to "All Semesters" for lifetime cumulative data.

### 2. Member Management & Tracking
- **Full Profiles:** Registry tracking name, phone, email, university, programme, hostel, cell group, join date, birthday, and more.
- **Academic Progression:** `admissionYear`, `admissionMonth` (default August), and `programDuration` (default 4 years) are stored per member. The system automatically calculates `currentAcademicLevel` (100 → 200 → … → 600 → ALUMNI) each time a member is saved. The calculation advances once per year on the configured start month.
- **Commitment Status:** Members are automatically graded each time attendance is recorded:
  - `COMMITTED` — ≥ 70% attendance rate in the semester
  - `AT_RISK` — ≥ 40% attendance rate
  - `UNCOMMITTED` — < 40% attendance rate
  - `NEW_MEMBER` — grace period for recently joined members with no events yet
  - `LEGACY` — historical members assigned to an archive semester; never recalculated
- **Manual Override:** Admins can override any commitment status with a written reason.
- **Members List:** Always shows all members regardless of the selected semester. Commitment status shown reflects the member's most recent record.
- **Invitation Network:** Tracks who invited whom; visualised as a force-directed graph on the dashboard.
- **Active Status:** Members who have attended 5 or more events are automatically flagged as Active.

### 3. Attendance & Event Logging
- **Event Creation:** Events (Sunday Service, Midweek, Prayer, Special) can be assigned to any semester — active or closed. The event creation form includes an explicit semester picker that defaults to the currently selected semester.
- **Attendance Marking:** Record `PRESENT` or `ABSENT` per member. Each save asynchronously recalculates the member's commitment percentage for that semester.
- **Semester Filter on Attendance Page:** The attendance page's event dropdown is filtered by the globally selected semester. Switching semester clears the current selection and reloads the relevant events, making it easy to enter historical attendance data.
- **Historical Data Entry:** Admins can create events under old/closed semesters and record attendance for them. There are no server-side restrictions preventing writes to closed semesters.

### 4. Cell Group Management
- **Community Segmentation:** Members are organised into Cell Groups (e.g., Pent, UPSA, Volta Hall).
- **Group Metrics:** View attendance rates and member counts per cell group.

### 5. Deep Reporting & Analytics
- **Dashboard KPIs:** Total members, average attendance, committed/at-risk/uncommitted counts — all filtered by selected semester.
- **Charts:** Member growth, comparative growth (joins vs. attendance), commitment trends, cell group attendance distribution, event type analysis, invitation network.
- **Reports Pages:** Dedicated pages for Member Growth, Attendance Trends, and Semester Comparison.
- **PDF & CSV Export:** One-click export of member directories and attendance reports.

### 6. SMS & Communication Automation
- **Batch Messaging:** Multi-select grid with search and quick filters (Cell Group, Commitment Status, Academic Level, Active Semester).
- **Message Templates:** Create and manage reusable templates. The `BIRTHDAY` template is system-protected.
- **Personalisation:** `{{name}}` token is replaced with each recipient's first name at send time.
- **Delivery History:** Sends are grouped by `batchId` in an expandable accordion. Each batch shows recipient count, total cost, and per-message status.
- **Financial Tracking:** Cost per SMS is fetched from Hubtel's response and stored. "Total Spend" is shown per semester.
- **Birthday Cron:** Vercel cron job runs daily at 8 AM UTC. Fetches members with today's birthday and sends the `BIRTHDAY` template automatically.

### 7. User Management & RBAC
- **Invite Flow:** Admin creates a user account → system sends a secure invite email → user sets their own password via `/set-password`.
- **Password Reset:** Admin can trigger a password reset email for any user at any time.
- **Roles:** `ADMIN` — full access including semesters, SMS, and user management. `USER` — read/write access to members, events, and attendance; no access to admin-only routes.
- **Super Admin Lock:** Only `urfzone4@gmail.com` can delete semesters.

---

## Data Model Summary

| Model | Key Fields |
|---|---|
| **Member** | name, phone, email, joinDate, cellGroupId, admissionYear, admissionMonth (default 8), programDuration (default 4), currentAcademicLevel, isActive |
| **Semester** | name, startDate, endDate, academicYear, status (ACTIVE/CLOSED), isArchive |
| **SemesterCommitment** | memberId, semesterId, status (COMMITTED/AT_RISK/UNCOMMITTED/NEW_MEMBER/LEGACY), overrideReason |
| **Event** | name, type, date, semesterId, preparations, feedback |
| **Attendance** | memberId, eventId, date, status (PRESENT/ABSENT) |
| **SmsLog** | recipientId, phoneNumber, message, status, batchId, cost, semesterId |
| **SmsTemplate** | name, content, isSystem, type |
| **CellGroup** | name, description |
| **User** | email, password, role (ADMIN/USER), status (INVITED/ACTIVE) |

---

## Architecture
- **Framework:** Next.js 15 (App Router) — frontend and API routes in one codebase
- **Database:** PostgreSQL on Neon, managed via Prisma ORM
- **Auth:** NextAuth v5 (JWT sessions, credentials provider, bcrypt passwords)
- **SMS:** Hubtel SMS API (`smsc.hubtel.com`)
- **Email:** Nodemailer via SMTP (invite and password reset)
- **Deployment:** Vercel (with cron job support via `vercel.json`)

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `NEXTAUTH_URL` | Public base URL for auth callbacks |
| `EMAIL_SERVER_HOST/PORT/USER/PASSWORD` | SMTP credentials |
| `EMAIL_FROM` | Sender email address |
| `SMS_CLIENT_ID` | Hubtel client ID |
| `SMS_SECRET` | Hubtel client secret |
| `SMS_SENDER_ID` | SMS sender name (default: "URF") |
| `CRON_SECRET` | Header secret for Vercel cron verification |
| `NEXT_PUBLIC_BASE_URL` | Public base URL for invite/reset links |
