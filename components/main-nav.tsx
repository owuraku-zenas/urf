"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname?.startsWith(path)) return true
    return false
  }

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={`text-sm font-medium transition-colors hover:text-blue-600 ${
          isActive("/") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        Dashboard
      </Link>
      <Link
        href="/members"
        className={`text-sm font-medium transition-colors hover:text-blue-600 ${
          isActive("/members") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        Members
      </Link>
      <Link
        href="/events"
        className={`text-sm font-medium transition-colors hover:text-blue-600 ${
          isActive("/events") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        Events
      </Link>
      <Link
        href="/attendance"
        className={`text-sm font-medium transition-colors hover:text-blue-600 ${
          isActive("/attendance") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        Attendance
      </Link>
      <Link
        href="/cell-groups"
        className={`text-sm font-medium transition-colors hover:text-blue-600 ${
          isActive("/cell-groups") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        Cell Groups
      </Link>
      <Link
        href="/reports"
        className={`text-sm font-medium transition-colors hover:text-blue-600 ${
          isActive("/reports") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        Reports
      </Link>
    </nav>
  )
}
