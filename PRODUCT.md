# Product

## Register

product

## Users

**Primary users:** Attendance coordinators, cell group leaders, and administrators at Universal Radiant Family (URF) — a university-based Christian fellowship in Ghana.

**Usage context:** The system is used during and immediately after church services, often on a phone or laptop in a busy environment. An attendance coordinator opens the app after Sunday service and needs to mark 30+ members as present or absent in under two minutes. A cell group leader checks who in their group is at risk of falling off. A senior admin reviews semester analytics to prepare a pastoral report. An SMS officer broadcasts a message to all Level 100 students before midterm week.

**Who they are NOT:** This is not a public-facing product. General church members do not use the system. There is no consumer-facing interface. Every user is an operational team member with a specific job to do.

**Roles:**
- `ADMIN` — full access: semesters, SMS broadcasts, user invitations, all analytics
- `USER` — operational access: member records, event creation, attendance marking, reports
- Super Admin (`urfzone4@gmail.com`) — sole authority to delete semesters

## Product Purpose

URF Management System is the operational backbone of a university church fellowship. It tracks who shows up, how consistently, and what that means for each member's engagement trajectory. It connects people to semesters, attendance records to commitment scores, and leadership to actionable communication tools.

**The system does seven things:**

1. **Member registry** — Full profiles: name, phone, email, university, programme, hostel, cell group, join date, birthday (month and day only), academic level, admission details, who invited them.
2. **Semester management** — Academic semesters define all analytics. One active semester at a time. Closed semesters remain queryable. Archive semesters capture pre-system historical members.
3. **Event and attendance tracking** — Events (Sunday Service, Midweek, Prayer, Special) belong to a semester. Attendance is marked per member per event. The system automatically recalculates each member's commitment percentage on every save.
4. **Commitment scoring** — Members are automatically graded: COMMITTED (≥70% attendance), AT_RISK (≥40%), UNCOMMITTED (<40%), NEW_MEMBER (grace period), LEGACY (historical, no calculation). Admins can override with a written reason.
5. **SMS communication** — Batch broadcasts via Hubtel with audience filtering (by cell group, commitment status, academic level), message templates with `{{name}}` personalisation, delivery history grouped by batch, cost tracking per semester. Automated birthday SMS via daily cron job.
6. **Analytics and reporting** — Dashboard KPIs, member growth charts, attendance trends by event type, semester comparison, cell group distribution, invitation network graph, commitment trend over time. PDF and CSV export.
7. **User management** — Admin invite flow with secure email tokens, password reset, RBAC middleware enforcing route-level access.

**What success looks like:** A coordinator opens the app after service, selects the event, marks attendance for their cell group, and closes the app. The commitment scores updated automatically. No confusion, no errors, no wasted time.

## Brand Personality

Grounded, reliable, purposeful. The interface should feel like a trusted operational tool that already knows the community — it surfaces what matters and gets out of the way. Warm enough to reflect that this is a people-oriented ministry context, precise enough to handle real data with confidence. Not formal or cold. Not casual or playful. Think: a well-designed internal tool at an organisation that takes its work seriously.

In three words: **clear, grounded, trustworthy.**

## Anti-references

- **Generic SaaS aesthetic** (Notion, Jira, Linear clones): identical white cards, blue primary everywhere, rounded-corner everything, "startup clean" sameness. The system should feel specific to its context, not like any other webapp.
- **Heavy enterprise software** (SAP, Oracle, legacy admin panels): grey density, table-on-table, nested modals, form fields that never end. No visual breathing room, no hierarchy, no humanity.
- **Consumer/social apps** (Instagram, Duolingo, mobile-first playfulness): bright primary colors, bouncing animations, oversized tap targets, gamification. This is a focused management tool, not a consumer product.
- **Church website clichés**: doves, halos, golden gradients, stock photography of raised hands or congregation silhouettes, decorative scripture quotes as UI elements, light blue + white + gold color schemes. The product is administrative — the spirituality lives in the community it serves, not in the interface.

## Features Reference

### Core workflows
- Semester creation and management (single active, date-range validation, archive type)
- Member CRUD with auto-calculated academic level (admissionYear + admissionMonth + programDuration)
- Attendance marking per event (bulk upsert, automatic commitment recalculation)
- Cell group organisation and metrics
- SMS broadcasts with Hubtel integration, batch tracking, cost analytics
- Automated birthday SMS via Vercel cron (daily 8AM UTC)
- User invite/reset via SMTP email

### Data entities
Member · Semester · SemesterCommitment · Event · Attendance · CellGroup · SmsLog · SmsTemplate · User

### Commitment statuses
COMMITTED · AT_RISK · UNCOMMITTED · NEW_MEMBER · LEGACY

### Event types
SUNDAY · MIDWEEK · PRAYER · SPECIAL

### Access levels
- All users: members, events, attendance, cell groups, reports, semester selector
- Admin only: semester CRUD, SMS broadcasts, SMS templates, user management
- Super admin only: semester delete

## Design Principles

1. **People over records.** Members are people in a community, not database rows. Names, groups, and statuses should feel like they describe real humans — not fields in a table. Show a member's name before their ID; show their cell group before their phone number.

2. **Surface the decision, not the data.** The dashboard should answer: who needs attention right now? Commitment at risk, upcoming birthdays, semester progress. Raw data belongs in detail views, not front-and-center.

3. **Earn every pixel.** Nothing decorates without function. No illustration for illustration's sake, no gradients that don't mean anything, no placeholder content that never resolves. If it isn't helping a task, it is in the way.

4. **Consistency without monotony.** The system spans many page types — lists, forms, charts, attendance grids, SMS composers. They should feel like the same product with different rhythms, not clones of a single template.

5. **Fast in, fast out.** Every primary workflow (mark attendance, add member, send SMS, check dashboard) should complete in the fewest possible interactions. Forms should be pre-filled where context is available. Confirmations should be reserved for destructive actions only.

## Accessibility & Inclusion

WCAG AA minimum. Status indicators (commitment badges, active/inactive, semester type) must pair color with a text label — never color alone. Forms must be keyboard-navigable. The attendance marking interface in particular is used in real-time after events and must be operable on a mobile device without precision tapping. Sufficient contrast ratio on both the light content area and the dark sidebar.
