# Exhaustive User Acceptance Testing (UAT) Plan: URF Management System

This document provides a comprehensive list of all functional features to be verified in the URF Management System.

## 1. Dashboard & Global Context
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 1.1 | **Semester Selector** | Selector appears in navigation; switching immediately filters ALL dashboard metrics and charts. |
| 1.2 | **KPI Cards** | Displays accurate counts for Total Members, Average Attendance, and Commitment segments based on context. |
| 1.3 | **Upcoming Birthdays** | Displays members with birthdays in the next 14 days; no manual "Send" button (automated via cron). |
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
| 2.7 | **Member List Pagination** | Pagination controls allow switching pages and changing "rows-per-page" (10, 20, 50, All) without lag. |
| 2.8 | **Member Attendance Context** | Individual member profile history can be dynamically filtered by the selected Academic Semester. |
| 2.9 | **Form Validation** | Zod schemas reject malformed data (e.g., invalid phone/email) and show descriptive error messages. |

## 3. Attendance & Event Lifecycle
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 3.1 | **Event Creation** | Events (Sunday Service, Mid-week, etc.) are strictly bound to the active semester. |
| 3.2 | **Marking Attendance** | Recording a member as `PRESENT`/`ABSENT` triggers an async update of their commitment ratio. |
| 3.3 | **Historical Edits** | Can edit attendance for past events; commitment statuses for that semester reflect the change. |
| 3.4 | **Attendance Baseline** | Commitment ratios correctly exclude any events that occurred *prior* to a member's `Join Date`. |
| 3.5 | **Event List Filtering** | Admins can filter the event list by type or date range within the selected semester scope. |

## 4. SMS Communication Suite
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 4.1 | **Batch Composer** | Support for multi-select, character count calculator, and dynamic loading of templates. |
| 4.2 | **Dynamic Templates** | Create/Edit/Save reusable snippets with `{{name}}` variable support; `BIRTHDAY` template is system-restricted. |
| 4.3 | **SMS Audience Filtering** | Quick-filters (Cell Group, Level 100s, Committed Only) correctly populate the recipient list. |
| 4.4 | **Grouped Delivery History** | Logs are grouped by `Batch ID` via Accordion; UI live-updates immediately after a new broadcast. |
| 4.5 | **Financial Tracking** | "Total Spend" (GHS/USD) metric displays cumulative cost of SMS dispatches for the selected semester. |
| 4.6 | **Birthday Auto-Cron** | Daily automated dispatch using `BIRTHDAY` template; includes personalization and a system-level fallback. |
| 4.7 | **SMS Template Modals** | Templates are managed via modern Shadcn UI modals rather than native browser `prompt`/`confirm` dialogs. |

## 5. Advanced Analytics & Reporting
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 5.1 | **Comparative Growth Chart** | Visualizes Member Joins vs. Attendance metrics across different semesters. |
| 5.2 | **Commitment Trends** | Sankey or Pie chart showing movement between Committed, At Risk, and Uncommitted segments. |
| 5.3 | **Cell Group Leaderboard** | Ranking of Cell Groups based on their average attendance percentage for the term. |
| 5.4 | **Event Type Analysis** | Breakdown of attendance performance by event category (e.g., Special Service vs. Regular). |
| 5.5 | **Invitation Network Tree** | Interactive graph showing the growth of the church through personal invitations. |
| 5.6 | **Growth Velocity** | Dashboard shows net-new member additions specific to the selected semester timeframe. |

## 6. Admin & User Management
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 6.1 | **User Invitation Flow** | Admin creates a user; system triggers an invite email with a secure token to the `/set-password` page. |
| 6.2 | **Semester CRUD** | Admin can Create, Update, or Delete semesters; system blocks overlapping dates or multiple actives. |
| 6.3 | **RBAC (Middleware)** | Regular users are strictly blocked from `/semesters`, `/admin/sms`, and User management views. |
| 6.4 | **Super-Admin Locks** | Only the Super Admin (`urfzone4@gmail.com`) can perform destructive actions like `DELETE` on a Semester. |

## 7. Exports & Documentation
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 7.1 | **PDF Report Generation** | Professional PDF export including Member Directories and Dashboard Charts. |
| 7.2 | **CSV Data Export** | Accurate export of Semester Comparison tables and Member lists with all progression fields. |
| 7.3 | **Environment Parity** | All migrations are synced; `.env` contains necessary Hubtel and SMTP credentials. |

## 8. UI/UX & Feedback
| ID | Feature / Scenario | Success Criteria |
|:---|:---|:---|
| 8.1 | **Universal Toasters** | Success/Error notifications (Toasts) appear after every CRUD action (Member, Semester, SMS). |
| 8.2 | **Mobile Navigation** | Navigation sidebar is fully functional and reflects RBAC permissions on mobile devices. |
