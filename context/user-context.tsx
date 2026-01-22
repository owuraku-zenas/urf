import { createContext, useContext } from "react"

export const UserContext = createContext<{ user: { role: string } | null }>({ user: null })

export function useUser() {
  return useContext(UserContext)
}