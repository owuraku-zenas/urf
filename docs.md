# App Documentation: Church Membership & Attendance Tracking App

## Overview
Universal Radiant Family (URF) is a comprehensive Church Membership and Attendance Tracking application. It is designed to streamline administrative tasks, ensure accurate member record-keeping, facilitate attendance taking, and enable powerful analytics over time. 

The application is structured around a "Semester" system, making it easy to track attendance trends, membership growth, and generate reports within bound timeframes (e.g., Spring 2026, Fall 2026).

## Core Features

### 1. Semester-Based Tracking & Analytics
All data within the application is contextualized by Semesters.
- **Global Semester Context:** The application auto-detects and sets the "Active" semester upon login, but allows users to easily toggle their view to analyze historical data from past closed semesters.
- **Reporting & Trends:** Attendance data and membership reports automatically filter to reflect the currently selected semester's scope, providing admins with precise organizational insights.

### 2. Role-Based Access Control (RBAC)
Security and data integrity are central to the application.
- **Admin Users:** Have explicit and exclusive control over system configurations. Creating new semesters, closing existing ones, and viewing sensitive administrative panels are strictly locked behind Admin boundaries (both UI and API).
- **Standard Users:** Can utilize the application for daily functioning like logging attendance and viewing metrics, without the risk of accidentally altering global configuration states.

### 3. Member & Attendance Management
- Fully integrated databases allowing seamless connection between members and their week-to-week attendance.

### 4. SMS & Communication Automation
- Dedicated administrative panels for batch SMS operations to dynamically filtered cell groups, commitments, and demographic subsets.
- Built-in `Cron Job` algorithms executing fully automated Birthday dispatches mapped seamlessly against real-time membership records.
- Encrypted "Invitee" password-reset email logic triggered universally upon initial User administrative creation.

## Architecture Details
- **Frontend/Backend:** Built seamlessly with Next.js App Router.
- **Database Architecture:** Uses a structured relational database controlled via Prisma ORM (`Semester`, `Member`, `Attendance` models).
- **Authentication:** Relies on NextAuth v5 (Auth.js) connecting to the Prisma database backend. Passwords are encrypted utilizing bcrypt.
