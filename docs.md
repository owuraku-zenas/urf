# App Documentation: Church Membership & Attendance Tracking App

## Overview
Universal Radiant Family (URF) is a comprehensive Church Membership and Attendance Tracking application. It is designed to streamline administrative tasks, ensure accurate member record-keeping, facilitate attendance taking, and enable powerful analytics over time. 

The application is structured around a "Semester" system, making it easy to track attendance trends, membership growth, and generate reports within bound timeframes (e.g., Spring 2026, Fall 2026).

## Core Features

### 1. Semester-Based Tracking & Analytics
All data within the application is contextualized by Semesters.
- **Global Semester Context:** The application auto-detects and sets the "Active" semester upon login, but allows users to easily toggle their view to analyze historical data from past closed semesters.
- **Reporting & Trends:** Attendance data and membership reports automatically filter to reflect the currently selected semester's scope, providing admins with precise organizational insights.

### 2. Member Management & Tracking
- **Profiles & Progression**: Full registry of church members tracking complex details like `admissionYear`, `joinedSemesterId`, and computed semantic `academicLevel`.
- **Commitment Algorithms**: The system dynamically grades members as `COMMITTED`, `AT_RISK`, or `UNCOMMITTED` automatically based on calculated semester attendance ratios.

### 3. Attendance & Event Logging
- **Event Scoping**: Create typed events (Sunday Service, Mid-week, etc.) strictly bound to the active academic semester.
- **Real-time Attendance**: Record `PRESENT` or `ABSENT` flags per member, which synchronously updates their overall semester commitment standing.

### 4. Cell Group Management
- **Community Segmentation**: Architect members into specific discrete 'Cell Groups' for pastoral care.
- **Macro-Tracking**: View attendance metrics, performance, and leaderboards isolated strictly by Cell Group boundaries.

### 5. Deep Reporting & Analytics
- **Visual Dashboards**: Track real-time growth, event attendance averages, and network invitation trees using interactive Recharts components.
- **PDF Export Engine**: Generate formal aesthetic offline PDF reports of member directories, global attendance trends, and analytical charts with one click.

### 6. SMS & Communication Automation
- **Message Templates**: Integrated a reusable template management system directly into the SMS dashboard. Administrators can create, edit, and quickly populate the SMS composer area using saved templates to prevent repetitive manual entry.
- **Dynamic Birthday Templates**: The automated daily chron job queries the core database for the specific `BIRTHDAY` template identifier, allowing end-users to change the system-wide birthday message at any time without developer assistance.
- **Batch Messaging**: Dedicated administrative panels for mass SMS operations targeting dynamically filtered cell groups, commitment tiers, and demographic subsets.
- **Financial Analytics**: Tracks individual SMS broadcast costs generated natively from Hubtel transmissions. Administrators can view a global "Total Spend" metric aggregated and filtered cleanly by specific Academic Semesters.
- **Delivery History**: Complete delivery transaction logs grouped dynamically by broadcast batch, containing recipient-specific tracking and personalized message preview snippets.
- **Cron Automations**: Built-in scheduled logic executing fully automated Birthday dispatches mapped seamlessly against real-time membership birth-month arrays.
- **Secure Invites**: Encrypted password-reset and secure platform invitation emails triggered universally upon initial User administrative creation.
- **Provider Gateway**: Active HTTP bindings mapping local payload executions transparently to the Hubtel SMS network API.

### 7. Role-Based Access Control (RBAC)
- **Admin Isolation**: Strict middleware and UI rendering lockouts keeping sensitive operations (like Semester configuration, User Management, and SMS blasts) gated solely to verified Admin credentials.

## Architecture Details
- **Frontend/Backend:** Built seamlessly with Next.js App Router.
- **Database Architecture:** Uses a structured relational database controlled via Prisma ORM (`Semester`, `Member`, `Attendance` models).
- **Authentication:** Relies on NextAuth v5 (Auth.js) connecting to the Prisma database backend. Passwords are encrypted utilizing bcrypt.
