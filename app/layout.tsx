import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { MainNav } from "@/components/main-nav"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import { Toaster as SonnerToaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "URF - University Revival Fellowship",
  description: "University Revival Fellowship Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background")} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="w-full max-w-7xl mx-auto px-5 flex h-16 items-center justify-between">
                <MainNav />
              </div>
            </header>
            <main className="flex-1">
              <div className="w-full max-w-7xl mx-auto px-5 py-10">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
