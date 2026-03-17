"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { loginService } from "../api/authService"

export default function LoginPage() {
  const router = useRouter()
  const [data, setData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await loginService(data)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("token", response.token)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Server error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Login</h1>

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={data.email}
          onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full rounded border px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={data.password}
          onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))}
          className="w-full rounded border px-3 py-2"
          required
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
            </button>
      </form>
    </main>
  )
}
