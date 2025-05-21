import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import { Toaster as SonnerToaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Header } from "@/components/header"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
})

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
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 relative">
                <div className="w-full max-w-7xl mx-auto px-5 py-10">
                  {children}
                </div>
              </main>
            </div>
            <Toaster />
            <SonnerToaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
