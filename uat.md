# User Acceptance Testing (UAT) Plan — URF Management System

This document lists every functional scenario to verify before releasing a build. Each row is a discrete, testable behaviour with a clear pass/fail criterion.

---

## 1. Authentication & User Management

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 1.1 | **Login** | Visit `/login`, enter valid credentials | Redirected to dashboard; session persists on refresh |
| 1.2 | **Login failure** | Enter wrong password | Error message shown; no redirect |
| 1.3 | **User invite** | Admin creates new user at `/users/new` | Invite email sent; link leads to `/set-password` |
| 1.4 | **Set password** | Open invite link, set a password | Account activated; can now log in |
| 1.5 | **Password reset** | Admin triggers reset on a user | Reset email sent; user can set a new password |
| 1.6 | **Change own password** | Logged-in user goes to Profile | Old password required; new password takes effect immediately |
| 1.7 | **RBAC — admin routes** | Log in as USER role; try to navigate to `/semesters` and `/admin/sms` | Redirected away; routes are inaccessible |
| 1.8 | **RBAC — semester selector** | Log in as USER role | Semester selector is visible and shows all semesters (active and closed) |

---

## 2. Semester Management

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 2.1 | **Create regular semester** | Admin opens `/semesters`, creates a semester with valid dates | Semester appears in table; status shows Active or Closed as set |
| 2.2 | **Single active enforcement** | Create a new ACTIVE semester when one already exists | Previous semester auto-closes; new one is Active |
| 2.3 | **Overlapping date rejection** | Try to create a semester with dates that overlap an existing one | API returns a conflict error; semester is not created |
| 2.4 | **Edit semester** | Admin clicks Edit on a semester | Name, dates, and status update correctly |
| 2.5 | **Delete semester (super admin)** | Log in as `urfzone4@gmail.com`; delete a semester | Semester removed; associated data cascade-deleted |
| 2.6 | **Delete blocked (non-super admin)** | Log in as any other admin; try to delete a semester | Request rejected with 403 Forbidden |
| 2.7 | **Create archive semester** | Admin creates a semester, ticks "Archive semester" checkbox | Semester appears in table with amber "Archive" type badge |
| 2.8 | **Edit semester to archive** | Admin edits an existing semester and ticks the archive checkbox | Semester type updates to Archive in the table |
| 2.9 | **Semester selector — all users** | Log in as USER role | Closed semesters appear in the dropdown alongside the active one |
| 2.10 | **Semester selector persistence** | Select a semester, reload the page | Same semester remains selected (stored in localStorage) |

---

## 3. Member Management

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 3.1 | **Create member — basic** | Fill required fields (name, phone, join date, cell group) and save | Member appears in the list |
| 3.2 | **Create member — joined semester auto-assign** | Set a join date that falls within a specific semester's date range | Member's `joinedSemesterId` is set to that semester |
| 3.3 | **Create member — archive semester** | Set a join date within an archive semester's range | Member receives `LEGACY` commitment status |
| 3.4 | **Create member — no matching semester** | Set a join date outside all semester ranges (e.g. 2018) | Member falls back to active/most recent semester and receives `LEGACY` status |
| 3.5 | **NEW_MEMBER grace period** | Create a member with a join date in a regular semester | Status shows `NEW_MEMBER`; no commitment penalty |
| 3.6 | **Academic level — default (August, 4 years)** | Create member with admissionYear=2022, leave month and duration as defaults | Level shows correctly based on current date vs August boundary |
| 3.7 | **Academic level — custom month** | Create member with admissionYear=2022, admissionMonth=January | Level reflects January as the academic year boundary |
| 3.8 | **Academic level — custom duration** | Create member with admissionYear=2018, programDuration=6 | Level shows 600 or ALUMNI correctly; does not cap at 400 |
| 3.9 | **Academic level — ALUMNI** | Create member whose completed years exceed programDuration | Level shows `ALUMNI` |
| 3.10 | **Edit member — level recalculates** | Edit a member's admissionYear or admissionMonth | `currentAcademicLevel` updates on save |
| 3.11 | **Invitation network** | Specify "Invited By" when creating a member | Invitation Network chart on dashboard shows the new node |
| 3.12 | **Manual commitment override** | Admin sets an AT_RISK member to COMMITTED with a reason | Status shows COMMITTED; reason is stored |
| 3.13 | **Members list — all members shown** | Select any closed semester in the global selector | Members list still shows ALL members (not filtered by joinedSemester) |
| 3.14 | **Members list — search and filter** | Search by name/phone; filter by cell group, status, commitment | List narrows correctly; pagination resets to page 1 |
| 3.15 | **Members list — LEGACY badge** | View a member with LEGACY status | Amber "LEGACY" badge is displayed in the commitment column |
| 3.16 | **Form validation** | Submit with invalid phone (wrong format) or missing required fields | Zod error messages appear inline; form does not submit |
| 3.17 | **Delete member** | Admin deletes a member from their profile page | Member removed from list; associated attendance cascade-deleted |

---

## 4. Events

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 4.1 | **Create event — active semester** | Go to `/events/new`, leave semester on the active one | Event saved under active semester |
| 4.2 | **Create event — previous semester** | Select a closed semester in the semester picker on the form | Event saved under the closed semester; visible when that semester is selected |
| 4.3 | **Create event — All Semesters selected globally** | Set global selector to "All Semesters", then create an event | Form still works; semester dropdown defaults to Active semester |
| 4.4 | **Event list filter** | Select a specific semester in the global selector | Event list only shows events belonging to that semester |
| 4.5 | **Edit event** | Admin edits event name, type, date, or semester | Changes persist; re-assigned events appear under the new semester |
| 4.6 | **Delete event** | Admin deletes an event | Event removed; associated attendance records cascade-deleted |

---

## 5. Attendance

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 5.1 | **Attendance page — semester filter** | Select a semester in the global selector | Event dropdown on attendance page shows only events from that semester |
| 5.2 | **Attendance page — switch semester** | Change the global semester selector | Event dropdown clears and reloads with new semester's events |
| 5.3 | **Mark attendance** | Select an event, click "Mark Attendance", mark members as PRESENT/ABSENT | Records saved; navigating back shows correct marks |
| 5.4 | **Commitment recalculation** | After marking attendance, view a member's profile | Commitment status (COMMITTED/AT_RISK/UNCOMMITTED) has updated |
| 5.5 | **LEGACY member — no recalculation** | Mark attendance for an event; one of the members has LEGACY status | LEGACY member's commitment status remains LEGACY after the save |
| 5.6 | **Historical attendance** | Select an old closed semester; create or select an event; mark attendance | Attendance saves correctly; commitment for that semester updates |
| 5.7 | **Attendance baseline** | Member's join date is after some events in a semester | Commitment ratio only counts events on or after the join date |
| 5.8 | **Bulk attendance** | POST to `/api/attendance/bulk` with a list of members | All records upserted; commitment recalculated for each member |

---

## 6. SMS Communication

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 6.1 | **Compose and send** | Admin goes to `/admin/sms`, selects recipients, types a message, and sends | SMS dispatched via Hubtel; SmsLog records created with SENT status |
| 6.2 | **Name personalisation** | Use `{{name}}` in the message body | Each recipient receives the message with their first name substituted |
| 6.3 | **Audience filters** | Apply "Committed Only", "Level 100s", or cell group filter | Recipient grid narrows to matching members |
| 6.4 | **Load template** | Select a template from the dropdown in the composer | Template text loads into the message box |
| 6.5 | **Create/edit/delete template** | Go to Templates tab; perform CRUD operations | Changes reflect immediately; BIRTHDAY template cannot be deleted |
| 6.6 | **Delivery history — grouping** | Send a broadcast; go to Delivery History tab | Sends are grouped by batchId in accordion; message and cost visible per row |
| 6.7 | **Financial tracking** | View Delivery History | Total spend for the selected semester is displayed |
| 6.8 | **Birthday cron** | On a day where a member has a birthday, trigger `/api/cron/birthdays` | BIRTHDAY template sent to matching member; SmsLog record created |

---

## 7. Reporting & Analytics

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 7.1 | **Dashboard KPIs** | Switch semesters using the global selector | Member count, attendance %, and commitment counts update immediately |
| 7.2 | **Member Growth chart** | View `/reports/member-growth` | Monthly join trend reflects selected semester |
| 7.3 | **Attendance Trends chart** | View `/reports/attendance-trends` | Breakdown by event type (SUNDAY/MIDWEEK/PRAYER) shows correct averages |
| 7.4 | **Semester Comparison** | View `/reports/semester-comparison` | Side-by-side metrics for each semester; "All Semesters" option works |
| 7.5 | **Invitation Network** | View dashboard | Force-directed graph renders all member-to-member invite relationships |
| 7.6 | **Upcoming Birthdays widget** | View dashboard | Shows members with birthdays in the next 14 days; quick SMS link works |
| 7.7 | **PDF export** | Click export on a members or attendance view | PDF downloads with correct data |
| 7.8 | **CSV export** | Click CSV export on members list | File downloads with name, status, phone, email, cell group, join date |

---

## 8. Cell Groups

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 8.1 | **Create cell group** | Admin creates a new cell group | Appears in list; selectable on member forms |
| 8.2 | **Edit cell group** | Admin edits name or description | Changes persist |
| 8.3 | **Delete cell group** | Admin deletes a cell group with no members | Group removed from list |
| 8.4 | **Cell group member count** | View cell groups list | Member count shown per group |

---

## 9. UI / UX

| ID | Scenario | Steps | Pass Criteria |
|:---|:---|:---|:---|
| 9.1 | **Toast notifications** | Perform any CRUD action | Success or error toast appears; auto-dismisses |
| 9.2 | **Loading states** | Navigate to a page with data | Spinner shown while data loads; no layout shift on completion |
| 9.3 | **Pagination** | Members list with more than 10 members | Page controls work; rows-per-page selector (10, 20, 50, All) functions |
| 9.4 | **Mobile navigation** | Open app on a mobile viewport | Navigation is accessible; RBAC-gated items hidden for USER role |
| 9.5 | **Semester selector — disabled state** | Verify selector is no longer disabled for non-admin users | Selector is interactive for all logged-in users |
