"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    // Show form immediately
    setShowForm(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/users/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Password set successfully! You can now log in.");
      setPassword("");
      setConfirm("");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to set password.");
    }
  };

  return (
    <div className="fixed inset-0 flex z-[9999]">
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
              <h1 className="text-3xl font-bold tracking-tight">Set Your Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter a new password to activate your account
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors" disabled={loading}>
                {loading ? "Setting..." : "Set Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  );
} 