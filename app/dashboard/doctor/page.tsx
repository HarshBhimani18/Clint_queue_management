"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import type { AuthUser } from "../../api/authService"

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  const rawUser = localStorage.getItem("user")
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    return null
  }
}

export default function DoctorDashboardPage() {
  const router = useRouter()
  const user = getStoredUser()

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.replace("/login")
      return
    }

    if (user.role !== "doctor") {
      router.replace("/dashboard")
    }
  }, [router, user])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.replace("/login")
  }

  if (!user || user.role !== "doctor") {
    return <main className="p-6">Loading doctor dashboard...</main>
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff7ed_0%,#f0fdfa_50%,#eff6ff_100%)] p-6">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Doctor Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Welcome {user.name}.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  )
}
