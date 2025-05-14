"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname?.startsWith(path)) return true
    return false
  }

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/members", label: "Members" },
    { href: "/events", label: "Events" },
    { href: "/attendance", label: "Attendance" },
    { href: "/cell-groups", label: "Cell Groups" },
    { href: "/reports", label: "Reports" },
  ]

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        isActive(href) ? "text-primary" : "text-muted-foreground"
      }`}
      onClick={() => setIsOpen(false)}
    >
      {label}
    </Link>
  )

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex justify-center w-full space-x-4 lg:space-x-6">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} />
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
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
