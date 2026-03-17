"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  createPrescriptionService,
  getDoctorQueueService,
  getMyPrescriptionsService,
  type AuthUser,
  type CreatePrescriptionPayload,
  type DoctorQueueItem,
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

export default function DoctorDashboardPage() {
  const router = useRouter()
  const user = getStoredUser()
  const [form, setForm] = useState<CreatePrescriptionPayload>({
    appointmentId: "",
    name: "",
    dosage: "",
    duration: "",
    notes: "",
  })
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [prescriptionsError, setPrescriptionsError] = useState("")
  const [appointments, setAppointments] = useState<DoctorQueueItem[]>([])
  const [appointmentsError, setAppointmentsError] = useState("")

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

  const handleAddPrescription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await createPrescriptionService(form, token)
      setForm({
        appointmentId: "",
        name: "",
        dosage: "",
        duration: "",
        notes: "",
      })
      await fetchPrescriptions()
    } catch {}
  }

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setAppointmentsError("")
    try {
      const list = await getDoctorQueueService(token)
      const today = new Date().toISOString().split("T")[0]
      const todayOnly = list.filter((item) =>
        item.appointmentDate ? item.appointmentDate.split("T")[0] === today : false
      )
      setAppointments(todayOnly)
    } catch (error) {
      setAppointmentsError(error instanceof Error ? error.message : "Failed to fetch appointments.")
    }
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

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">Add Prescription</h2>

          <form onSubmit={handleAddPrescription} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Appointment ID"
              value={form.appointmentId}
              onChange={(e) => setForm((prev) => ({ ...prev, appointmentId: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Medicine Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Dosage"
              value={form.dosage}
              onChange={(e) => setForm((prev) => ({ ...prev, dosage: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Duration"
              value={form.duration}
              onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
              rows={3}
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white sm:col-span-2"
            >
              Add Prescription
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Today&apos;s Appointments</h2>
            <button
              type="button"
              onClick={() => {
                void fetchAppointments()
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Load Appointments
            </button>
          </div>

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
                    <th className="py-2 pr-3 font-semibold text-slate-700">Appointment ID</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Patient</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Date</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Time Slot</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 pr-3">{item.appointmentId ?? "-"}</td>
                      <td className="py-2 pr-3">{item.patientName ?? "-"}</td>
                      <td className="py-2 pr-3">
                        {item.appointmentDate ? item.appointmentDate.split("T")[0] : "-"}
                      </td>
                      <td className="py-2 pr-3">{item.timeSlot ?? "-"}</td>
                      <td className="py-2 pr-3">{item.status ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Prescriptions</h2>
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
                    <th className="py-2 pr-3 font-semibold text-slate-700">Patient</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Name</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Dosage</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Duration</th>
                    <th className="py-2 pr-3 font-semibold text-slate-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id} className="border-b">
                      <td className="py-2 pr-3">
                        {prescription.patientName ?? prescription.patientId ?? "-"}
                      </td>
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
