# Exhaustive User Acceptance Testing (UAT) Plan: URF Management System

This document provides a comprehensive list of all functional features to be verified in the URF Management System.

## 1. Dashboard & Global Context
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 1.1 | **Semester Selector** | Selector appears in navigation; switching immediately filters ALL dashboard metrics and charts. |
| 1.2 | **KPI Cards** | Displays accurate counts for Total Members, Average Attendance, and Commitment segments based on context. |
| 1.3 | **Upcoming Birthdays** | Displays members with birthdays in the next 14 days; includes a "Send SMS" quick-action button. |
| 1.4 | **Lifetime View** | Selecting "All Semesters" (if available) aggregates cumulative data since the app's inception. |

## 2. Member & Enrollment Management
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 2.1 | **Member Registration** | Fields for `Admission Year`, `Join Date`, and `Birth Month/Day` persist correctly. |
| 2.2 | **Joined Semester Logic** | New members are auto-assigned to the semester active on their `Join Date`. |
| 2.3 | **Commitment Grace Period** | Newly added members show `NEW_MEMBER` status and are excluded from ratio-based Penalization. |
| 2.4 | **Academic Level Logic** | `Level 100-400` or `Alumnus` is auto-computed; increments correctly during the August transition. |
| 2.5 | **Invitation Network** | Can specify "Invited By" during registration; the Invitation Network chart updates to show the new node. |
| 2.6 | **Manual Status Override** | Admin can manually override a member's commitment status (e.g., set an AT_RISK member to COMMITTED). |

## 3. Attendance & Event Lifecycle
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 3.1 | **Event Creation** | Events (Sunday Service, Mid-week, etc.) are strictly bound to the active semester. |
| 3.2 | **Marking Attendance** | Recording a member as `PRESENT`/`ABSENT` triggers an async update of their commitment ratio. |
| 3.3 | **Historical Edits** | Can edit attendance for past events; commitment statuses for that semester reflect the change. |

## 4. SMS Communication Suite
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 4.1 | **Batch Composer** | Support for multi-select recipients, character count length calculator, and dynamic loading of templates. |
| 4.2 | **Dynamic Templates** | Create/Edit/Save reusable snippets; `BIRTHDAY` template is restricted (system-critical). |
| 4.3 | **Grouped Delivery History** | SMS Logs are grouped by `Batch ID` in an Accordion UI showing individualized success/failure. |
| 4.4 | **Financial Tracking** | "Total Spend" (GHS/USD) metric displays cumulative cost of SMS dispatches for the selected semester. |
| 4.5 | **Birthday Auto-Cron** | Daily automated dispatch based on matching Birth Month/Day using the `BIRTHDAY` template. |

## 5. Advanced Analytics & Reporting
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 5.1 | **Comparative Growth Chart** | Visualizes Member Joins vs. Attendance metrics across different semesters. |
| 5.2 | **Commitment Trends** | Sankey or Pie chart showing movement between Committed, At Risk, and Uncommitted segments. |
| 5.3 | **Cell Group Leaderboard** | Ranking of Cell Groups based on their average attendance percentage for the term. |
| 5.4 | **Event Type Analysis** | Breakdown of attendance performance by event category (e.g., Special Service vs. Regular). |
| 5.5 | **Invitation Network Tree** | Interactive graph showing the growth of the church through personal invitations. |

## 6. Admin & User Management
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 6.1 | **User Invitation Flow** | Admin creates a user; system triggers an invite email with a secure token to the `/set-password` page. |
| 6.2 | **Semester CRUD** | Admin can Create, Update, or Delete semesters; system blocks overlapping dates or multiple actives. |
| 6.3 | **RBAC (Middleware)** | Regular users are strictly blocked from `/semesters`, `/admin/sms`, and User management views. |

## 7. Exports & Documentation
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 7.1 | **PDF Report Generation** | Professional PDF export including Member Directories and Dashboard Charts. |
| 7.2 | **CSV Data Export** | Accurate export of Semester Comparison tables and Member lists with all progression fields. |
| 7.3 | **Environment Parity** | All migrations are synced; `.env` contains necessary Hubtel and SMTP credentials. |
