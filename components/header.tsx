"use client"

import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { MainNav } from "@/components/main-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, LogOut, Users } from "lucide-react"
import Link from "next/link"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isLoginPage = pathname === "/login"
  const isAdmin = session?.user?.role === "ADMIN"

  if (isLoginPage) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-5 flex h-16 items-center relative">
        {/* Logo - left */}
        <div className="flex items-center gap-4 min-w-[120px]">
          <Link href="/">
            <img src="/church-logo.png" alt="Church Logo" className="h-12 w-auto object-contain" />
          </Link>
        </div>
        {/* Nav - center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <MainNav />
        </div>
        {/* User menu - right */}
        <div className="flex items-center gap-4 min-w-[120px] ml-auto">
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/users/profile" passHref legacyBehavior>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <a>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </a>
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link href="/users" passHref legacyBehavior>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <a>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Manage Users</span>
                      </a>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
} 