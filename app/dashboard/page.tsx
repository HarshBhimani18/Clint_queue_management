"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import type { AuthUser } from "../api/authService"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const rawUser = localStorage.getItem("user")

    if (!rawUser) {
      router.replace("/login")
      return
    }

    try {
      const user = JSON.parse(rawUser) as AuthUser
      switch (user.role) {
        case "admin":
          router.replace("/dashboard/admin")
          break
        case "patient":
          router.replace("/dashboard/patient")
          break
        case "receptionist":
          router.replace("/dashboard/receptionist")
          break
        case "doctor":
          router.replace("/dashboard/doctor")
          break
        default:
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          router.replace("/login")
      }
    } catch {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.replace("/login")
    }
  }, [router])

  return <main className="p-6">Redirecting...</main>
}
