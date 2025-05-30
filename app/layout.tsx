import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import { Toaster as SonnerToaster } from "sonner"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "URF - Universal Radiant Family",
  description: "Universal Radiant Family - Raising Leaders, Mentors and Icons",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 relative">
              <div className="w-full max-w-7xl mx-auto px-5 py-5">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
          <SonnerToaster />
        </AuthProvider>
      </body>
    </html>
  )
}
