import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "What's New — URF",
  description: "All updates to the URF Management System, newest first.",
}

type ChangeType = "NEW" | "FIX" | "IMPROVEMENT"

interface Change {
  type: ChangeType
  title: string
  body: string
  note?: string
}

interface Release {
  date: string
  displayDate: string
  changes: Change[]
}

const TYPE_STYLES: Record<ChangeType, { label: string; bg: string; text: string }> = {
  NEW:         { label: "NEW",         bg: "bg-blue-50",   text: "text-blue-700"  },
  FIX:         { label: "FIX",         bg: "bg-green-50",  text: "text-green-700" },
  IMPROVEMENT: { label: "IMPROVEMENT", bg: "bg-amber-50",  text: "text-amber-800" },
}

const releases: Release[] = [
  {
    date: "2026-06-03",
    displayDate: "June 3, 2026",
    changes: [
      {
        type: "FIX",
        title: "Committed count on members page now shows the correct number",
        body: "The Committed, At Risk, and Uncommitted cards were showing wrong counts because each member's commitment status was being read from whichever record happened to come back first, regardless of semester. The page now picks the commitment record that matches the selected semester specifically, and falls back to the most recent record when no match exists. The cards also re-fetch automatically when you switch semesters.",
      },
      {
        type: "FIX",
        title: "Historical members now show as Committed, not New Member",
        body: "Members with join dates before any recorded semester (e.g. joined in 2018-2022) were being labelled as New Members indefinitely because the system had no attendance data to evaluate them. They now start as Committed by default, which reflects that they have been part of URF for years. If they start attending events in the current semester, their status will update based on actual attendance. To apply this fix to existing members, go to Semesters and click Run Migration.",
        note: "The Migration button is in the Maintenance section at the bottom of the Semesters page.",
      },
      {
        type: "IMPROVEMENT",
        title: "Academic level now calculates correctly for all students, including alumni",
        body: "The calculation previously stopped at Level 400 and returned blank for anyone who had been studying more than 4 years. It now supports Levels 100 through 600 and correctly shows ALUMNI. Two optional fields were added to each member profile: Academic Year Start Month (which month their university year begins, defaults to August) and Programme Duration (how many years the course lasts, defaults to 4). These determine when the level advances and when the member becomes an alumnus.",
        note: "Check any members you know are in Level 500 or 600 and confirm their level is displaying correctly. You can update the admission month and duration on the member edit page.",
      },
      {
        type: "NEW",
        title: "Attendance page now filters events by selected semester",
        body: "Changing the semester in the selector at the top of the Attendance page now updates the event dropdown to show only events from that semester. Previously it showed all events from all time, making it hard to find the right event when recording historical attendance.",
      },
      {
        type: "NEW",
        title: "Archive semesters for long-standing members",
        body: "Admins can now create a special Archive Semester covering historical dates. Members whose join date falls within that range are automatically given Committed status rather than being labelled as New Members. The archive semester type is set with a checkbox when creating or editing a semester.",
        note: "Go to Semesters, create a semester covering your historical date range (e.g. 2015 to the day before your first real semester), and tick the Archive Semester checkbox. Then click Run Migration to update existing members.",
      },
      {
        type: "FIX",
        title: "Members list now shows everyone regardless of selected semester",
        body: "When a past semester was selected, the Members page was only showing members who joined in that specific semester, hiding all others. The dashboard might show 32 members while the list showed only 8. This has been fixed. The Members page now always shows the full list.",
      },
      {
        type: "IMPROVEMENT",
        title: "All users can now switch between semesters",
        body: "The semester dropdown was previously disabled for non-admin users, locking them into the current active semester only. Now everyone can switch to any past or current semester to view data from that period. Your selection is remembered across page reloads.",
      },
      {
        type: "NEW",
        title: "Events and attendance records can be added to past semesters",
        body: "Creating a new event now includes an explicit semester selector. You can assign it to any semester, including closed ones. The attendance page also filters by the selected semester, making it easy to fill in historical records. There are no restrictions on writing data to any semester.",
      },
    ],
  },
  {
    date: "2026-03-21",
    displayDate: "March 21, 2026",
    changes: [
      {
        type: "FIX",
        title: "Live Hubtel SMS and production stability",
        body: "Replaced the simulated SMS provider with a fully operational Hubtel integration. Fixed a critical 500 error on the Members and Cell Groups pages. Resolved Prisma connection pool exhaustion caused by Next.js hot-reloads during long sessions.",
      },
    ],
  },
  {
    date: "2026-03-20",
    displayDate: "March 20, 2026",
    changes: [
      {
        type: "NEW",
        title: "Reusable SMS message templates",
        body: "The SMS dashboard now has a Templates tab where you can create, edit, and delete message templates for common broadcasts. Templates support {{name}}, which is replaced with each recipient's first name when sent. The Birthday template is system-protected and cannot be deleted. Templates can be loaded into the composer with one click.",
      },
      {
        type: "IMPROVEMENT",
        title: "Delivery history grouped by broadcast batch",
        body: "SMS delivery history is now grouped by broadcast session in expandable accordion sections rather than a flat list of every individual message. Each batch shows total recipients, overall cost, and the exact message sent. Cell group filtering was also added to the recipient selection grid.",
      },
    ],
  },
  {
    date: "2026-03-19",
    displayDate: "March 19, 2026",
    changes: [
      {
        type: "NEW",
        title: "Automated birthday SMS (daily cron)",
        body: "Every day at 8 AM UTC, the system checks for members with today's birthday and sends them the Birthday SMS template automatically. No action required. The message is personalised with the member's first name. You can change the birthday message at any time by editing the Birthday template in the SMS dashboard.",
      },
      {
        type: "NEW",
        title: "Upcoming birthdays widget on dashboard",
        body: "The dashboard now shows members with birthdays in the next 14 days. Clicking a member's name opens the SMS composer pre-filled with their details so you can send a personal message quickly.",
      },
      {
        type: "IMPROVEMENT",
        title: "New analytics charts: Comparative Growth and Commitment Trends",
        body: "Two new charts were added. Comparative Growth shows member joins alongside average attendance percentages across different semesters on one axis. Commitment Trends tracks how the number of Committed, At Risk, and Uncommitted members shifts over time.",
      },
    ],
  },
  {
    date: "2026-03-18",
    displayDate: "March 18, 2026",
    changes: [
      {
        type: "NEW",
        title: "SMS broadcast system with Hubtel integration",
        body: "Admins can send bulk SMS messages to any subset of members from the SMS Admin dashboard. Recipients can be filtered by cell group, commitment status, academic level, or active semester. Each broadcast tracks delivery status and cost per message. The Delivery History tab shows a full log of all broadcasts.",
      },
      {
        type: "IMPROVEMENT",
        title: "Semesters integrated across events, attendance, and reports",
        body: "Events can be reassigned to a different semester after creation. The event list, attendance records, and all report pages now correctly filter by the selected semester. Semester context carries through consistently everywhere in the system.",
      },
    ],
  },
  {
    date: "2026-03-17",
    displayDate: "March 17, 2026",
    changes: [
      {
        type: "NEW",
        title: "Semester-based tracking system",
        body: "All data in the system is now organised around academic semesters. Create semesters, set one as Active, and close others when the period ends. Attendance records, member scores, and all reports filter by the selected semester. The semester selector in the header lets you switch context at any time.",
      },
      {
        type: "NEW",
        title: "Automatic commitment scoring",
        body: "The system automatically grades each member's engagement every time attendance is recorded. Members with 70% or more attendance are COMMITTED. Between 40% and 70% is AT RISK. Below 40% is UNCOMMITTED. Newly joined members receive a NEW MEMBER grace status until enough events have passed to calculate a fair score. Admins can override any status with a written reason.",
      },
      {
        type: "NEW",
        title: "Member academic progression and cell group tracking",
        body: "Member profiles now include Admission Year, which the system uses to calculate their current academic level (100 through 400 at launch). Members are assigned to the semester in which they joined and can be linked to the person who invited them, building an invitation network visible on the dashboard.",
      },
      {
        type: "NEW",
        title: "Analytics dashboard and report exports",
        body: "The dashboard shows live KPIs for the selected semester: total members, average attendance rate, and commitment counts. Charts cover member growth, attendance by event type, cell group distribution, and the invitation network. Three dedicated report pages cover Member Growth, Attendance Trends, and Semester Comparison. All reports can be exported as PDF or CSV.",
      },
    ],
  },
]

function TypeChip({ type }: { type: ChangeType }) {
  const s = TYPE_STYLES[type]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  )
}

function ChangeEntry({ change, index }: { change: Change; index: number }) {
  return (
    <li className="grid grid-cols-1 gap-3 md:grid-cols-[5.5rem_1fr] md:gap-6">
      {/* Left: counter + chip */}
      <div className="flex items-start gap-2 md:flex-col md:items-start md:pt-0.5">
        <span className="text-sm font-medium tabular-nums text-slate-400 md:text-xs">
          {String(index + 1).padStart(2, "0")}
        </span>
        <TypeChip type={change.type} />
      </div>

      {/* Right: content */}
      <div className="space-y-2">
        <h3 className="text-[0.9375rem] font-semibold leading-snug text-slate-900">
          {change.title}
        </h3>
        <p className="max-w-[68ch] text-sm leading-relaxed text-slate-600">
          {change.body}
        </p>
        {change.note && (
          <p className="max-w-[68ch] rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-700">Worth knowing: </span>
            {change.note}
          </p>
        )}
      </div>
    </li>
  )
}

export default function WhatsNewPage() {
  const totalChanges = releases.reduce((sum, r) => sum + r.changes.length, 0)

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      {/* Page header */}
      <div className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[1.75rem]">
          What&apos;s New
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          All updates to the URF Management System, newest first.{" "}
          <span className="font-medium text-slate-700">{totalChanges} changes</span> across{" "}
          <span className="font-medium text-slate-700">{releases.length} releases.</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-16">
        {releases.map((release) => (
          <section key={release.date} aria-labelledby={`release-${release.date}`}>
            {/* Release header */}
            <div className="mb-7 flex items-baseline justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Release
                </p>
                <h2
                  id={`release-${release.date}`}
                  className="text-xl font-bold text-slate-900"
                >
                  {release.displayDate}
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {release.changes.length}{" "}
                {release.changes.length === 1 ? "change" : "changes"}
              </span>
            </div>

            {/* Divider */}
            <div className="mb-8 h-px bg-slate-200" />

            {/* Changes */}
            <ol className="space-y-8">
              {release.changes.map((change, i) => (
                <ChangeEntry key={i} change={change} index={i} />
              ))}
            </ol>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-20 border-t border-slate-200 pt-8 text-xs text-slate-400">
        URF Management System — change history from March 2026 onwards.
      </div>
    </main>
  )
}
