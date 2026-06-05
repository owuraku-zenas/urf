"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname?.startsWith(path)) return true
    return false
  }

  type NavItem = {
    href: string
    label: string
    subItems?: { href: string; label: string }[]
  }

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard" },
    { href: "/members", label: "Members" },
    { href: "/events", label: "Events" },
    { href: "/attendance", label: "Attendance" },
    { href: "/cell-groups", label: "Cell Groups" },
    {
      href: "/reports",
      label: "Reports",
      subItems: [
        { href: "/reports/attendance-trends",   label: "Attendance Trends"    },
        { href: "/reports/member-growth",       label: "Member Growth"        },
        { href: "/reports/semester-comparison", label: "Semester Comparison"  },
        { href: "/reports/retention",           label: "Retention"            },
        { href: "/reports/invitations",         label: "Invitations"          },
        { href: "/reports/demographics",        label: "Demographics"         },
      ]
    },
  ]
  if (isAdmin) {
    navItems.push({ href: "/semesters", label: "Semesters" })
    navItems.push({ href: "/admin/sms", label: "SMS Admin" })
  }

  return (
    <div className="flex items-center w-full">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex justify-center items-center w-full space-x-4 lg:space-x-6 h-full">
        {navItems.map((item) => (
          <div key={item.href} className="relative group flex items-center h-full py-4 -my-4">
            <Link
              href={item.href}
              className={`text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary ${
                isActive(item.href) ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
              {item.subItems && <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:rotate-180" />}
            </Link>
            {item.subItems && (
              <div className="absolute left-0 top-full hidden group-hover:block z-50 pt-2 min-w-[200px]">
                <div className="bg-popover text-popover-foreground border rounded-md shadow-md p-1 flex flex-col gap-1">
                  {item.subItems.map(subItem => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors ${
                        isActive(subItem.href) ? "bg-accent/50 text-accent-foreground" : ""
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <nav className="flex flex-col space-y-4 mt-4">
            {navItems.map((item) => (
              <div key={item.href} className="flex flex-col">
                <Link
                  href={item.href}
                  className={`text-sm font-medium flex items-center justify-between transition-colors hover:text-primary py-2 ${
                    isActive(item.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                  {item.subItems && <ChevronDown className="h-4 w-4 opacity-70" />}
                </Link>
                {item.subItems && (
                  <div className="flex flex-col pl-4 border-l border-border ml-2 mt-1 space-y-2">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`text-sm font-medium transition-colors hover:text-primary py-1 ${
                          isActive(subItem.href) ? "text-primary" : "text-muted-foreground"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
