"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  createAdminUserService,
  getAdminUsersService,
  type AdminUser,
  type AuthUser,
  type CreateUserPayload,
} from "../../api/authService"

function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem("user")
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    return null
  }
}

function getTokenFromStorage(): string | null {
  return localStorage.getItem("token")
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersError, setUsersError] = useState("")
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "patient",
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")

  const fetchUsers = async () => {
    const token = getTokenFromStorage()
    if (!token) {
      setUsersError("Missing login token. Please log in again.")
      return
    }

    setUsersError("")

    try {
      const fetchedUsers = await getAdminUsersService(token)
      setUsers(fetchedUsers)
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : "Failed to fetch users.")
    }
  }

  useEffect(() => {
    const parsedUser = getStoredUser()

    if (!parsedUser) {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.replace("/login")
      return
    }

    if (parsedUser.role !== "admin") {
      router.replace("/dashboard")
      return
    }

    setUser(parsedUser)
  }, [router])

  useEffect(() => {
    if (user) {
      void fetchUsers()
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.replace("/login")
  }

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateError("")
    setCreateLoading(true)

    const token = getTokenFromStorage()
    if (!token) {
      setCreateError("Missing login token. Please log in again.")
      setCreateLoading(false)
      return
    }

    try {
      await createAdminUserService(createForm, token)

      setCreateForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "patient",
      })
      await fetchUsers()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create user.")
    } finally {
      setCreateLoading(false)
    }
  }

  if (!user) {
    return <main className="p-6">Loading admin dashboard...</main>
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff7ed_0%,#f0fdfa_50%,#eff6ff_100%)] p-4 sm:p-6">
      <section className="mx-auto w-full max-w-6xl space-y-6 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-xl backdrop-blur sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700">
              {user.clinicName} ({user.clinicCode})
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Manage users for your clinic.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">Create User</h2>

          <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Full name"
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={createForm.phone}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <select
              value={createForm.role}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  role: e.target.value as CreateUserPayload["role"],
                }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="patient">patient</option>
              <option value="receptionist">receptionist</option>
              <option value="doctor">doctor</option>
            </select>
            <button
              type="submit"
              disabled={createLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2"
            >
              {createLoading ? "Creating..." : "Create User"}
            </button>
          </form>

          {createError ? <p className="mt-3 text-sm text-red-600">{createError}</p> : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-900">All Added Users</h2>
          </div>

          {usersError ? <p className="mb-3 text-sm text-red-600">{usersError}</p> : null}

          {users.length === 0 ? (
            <p className="text-sm text-slate-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-3 font-semibold text-slate-700">Name</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Email</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Phone</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2 pr-3">{u.name}</td>
                      <td className="py-2 pr-3">{u.email}</td>
                      <td className="py-2 pr-3">{u.phone ?? "-"}</td>
                      <td className="py-2 pr-3 uppercase">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
