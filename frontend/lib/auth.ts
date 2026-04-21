"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  department: string
  year?: string
  phone: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: "student" | "admin") => Promise<boolean>
  signup: (userData: any) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string, role: "student" | "admin") => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock user data
        const mockUser: User = {
          id: "1",
          name: role === "admin" ? "Admin User" : "John Doe",
          email,
          role,
          department: role === "admin" ? "Student Affairs" : "Computer Science",
          year: role === "student" ? "3rd Year" : undefined,
          phone: "+91 98765 43210",
          avatar: "/placeholder.svg?height=40&width=40&text=User",
        }

        set({ user: mockUser, isAuthenticated: true })
        return true
      },

      signup: async (userData: any) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const newUser: User = {
          id: Date.now().toString(),
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: userData.role,
          department: userData.department,
          year: userData.year,
          phone: userData.phone,
        }

        set({ user: newUser, isAuthenticated: true })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        // Clear user-related data from store
        if (typeof window !== "undefined") {
          // Clear localStorage data
          localStorage.removeItem("auth-storage")
          localStorage.removeItem("campus-buzz-store")
          // Redirect to landing page
          window.location.href = "/"
        }
      },

      updateProfile: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
