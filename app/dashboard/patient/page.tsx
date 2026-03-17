"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  bookAppointmentService,
  getMyPrescriptionsService,
  getMyAppointmentsService,
  type AuthUser,
  type BookAppointmentPayload,
  type PatientAppointment,
  type Prescription,
} from "../../api/authService"

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

export default function PatientDashboardPage() {
  const router = useRouter()
  const user = getStoredUser()
  const timeSlots = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "15:00-16:00",
    "16:00-17:00",
  ]
  const [form, setForm] = useState<BookAppointmentPayload>({
    appointmentDate: "",
    timeSlot: "",
  })
  const [appointments, setAppointments] = useState<PatientAppointment[]>([])
  const [appointmentsError, setAppointmentsError] = useState("")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [prescriptionsError, setPrescriptionsError] = useState("")

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.replace("/login")
      return
    }

    if (user.role !== "patient") {
      router.replace("/dashboard")
    }
  }, [router, user])

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setAppointmentsError("")
    try {
      const list = await getMyAppointmentsService(token)
      setAppointments(list)
    } catch (error) {
      setAppointmentsError(
        error instanceof Error ? error.message : "Failed to fetch appointments."
      )
    }
  }

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setPrescriptionsError("")
    try {
      const list = await getMyPrescriptionsService(token)
      setPrescriptions(list)
    } catch (error) {
      setPrescriptionsError(
        error instanceof Error ? error.message : "Failed to fetch prescriptions."
      )
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.replace("/login")
  }

  const handleBookAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const token = localStorage.getItem("token")
    if (!token) {
      return
    }

    try {
      await bookAppointmentService(form, token)
      setForm({
        appointmentDate: "",
        timeSlot: "",
      })
      await fetchAppointments()
    } catch {}
  }

  if (!user || user.role !== "patient") {
    return <main className="p-6">Loading patient dashboard...</main>
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff7ed_0%,#f0fdfa_50%,#eff6ff_100%)] p-6">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Patient Dashboard</h1>
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

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">Book Appointment</h2>

          <form onSubmit={handleBookAppointment} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={form.appointmentDate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  appointmentDate: e.target.value,
                }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />

            <select
              value={form.timeSlot}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  timeSlot: e.target.value,
                }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              required
            >
              <option value="" disabled>
                Select time slot
              </option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2"
            >
              Book Appointment
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">My Appointments</h2>

          {appointmentsError ? (
            <p className="mt-3 text-sm text-red-600">{appointmentsError}</p>
          ) : null}

          {appointments.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No appointments found.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-3 font-semibold text-slate-700">Date</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Time Slot</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b">
                      <td className="py-2 pr-3">{appointment.appointmentDate.split("T")[0]}</td>
                      <td className="py-2 pr-3">{appointment.timeSlot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">My Prescriptions</h2>
            <button
              type="button"
              onClick={() => {
                void fetchPrescriptions()
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Load Prescriptions
            </button>
          </div>

          {prescriptionsError ? (
            <p className="mt-3 text-sm text-red-600">{prescriptionsError}</p>
          ) : null}

          {prescriptions.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No prescriptions found.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-3 font-semibold text-slate-700">Name</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Dosage</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Duration</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id} className="border-b">
                      <td className="py-2 pr-3">{prescription.name}</td>
                      <td className="py-2 pr-3">{prescription.dosage}</td>
                      <td className="py-2 pr-3">{prescription.duration}</td>
                      <td className="py-2 pr-3">{prescription.notes}</td>
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
