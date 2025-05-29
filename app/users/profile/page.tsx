"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setNewName(data.user.name);
      } else {
        toast.error("Failed to load user info");
      }
      setLoading(false);
    }
    fetchUser();
  }, []);


  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setChanging(true);
    const res = await fetch("/api/users/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setChanging(false);
    if (res.ok) {
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to change password.");
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setUpdatingName(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditingName(false);
        
        // Update the session with the new name
        await updateSession({
          user: {
            ...session?.user,
            name: data.user.name,
          },
        });
        
        // Refresh the router to update all components using session data
        router.refresh();
        
        toast.success("Name updated successfully");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update name");
      }
    } catch (error) {
      toast.error("Failed to update name");
    } finally {
      setUpdatingName(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950 shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
            <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
          {editingName ? (
            <form onSubmit={handleUpdateName} className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={updatingName}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {updatingName ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingName(false);
                  setNewName(user?.name || "");
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</div>
              <button
                onClick={() => setEditingName(true)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Edit
              </button>
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
          <span className="mt-1 text-xs font-medium rounded px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {user?.role}
          </span>
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-800" />
        <div>
          <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Current Password</label>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full rounded border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">New Password</label>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
              disabled={changing}
            >
              {changing ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 