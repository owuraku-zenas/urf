"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Show form immediately
    setShowForm(true)
  }, [])

  return (
    <div className="fixed inset-0 flex z-[100]">
      {/* Full screen splash image */}
      <div className="absolute inset-0">
        <Image
          src="/picture.jpg"
          alt="Splash Screen"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Sliding form container */}
      <div 
        className={`fixed right-0 top-0 h-full w-full md:w-1/2 bg-white dark:bg-gray-900 transition-transform duration-300 ease-out transform ${
          showForm ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="w-full max-w-[400px] p-8 space-y-8">
            <div className="flex flex-col items-center space-y-2 text-center">
              <Image src="/church-logo.PNG" alt="Church Logo" width={160} height={80} className="object-contain h-20 w-auto" />
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
} 