import { api } from "./auth"
import axios from "axios"

export type LoginPayload = {
  email: string
  password: string
}

export type UserRole = "admin" | "patient" | "receptionist" | "doctor"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  clinicId: string
  clinicName: string
  clinicCode: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

export type CreatableUserRole = "patient" | "receptionist" | "doctor"

export type CreateUserPayload = {
  name: string
  email: string
  phone: string
  password: string
  role: CreatableUserRole
}

export type AdminUser = {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  clinicId?: string
}

export type BookAppointmentPayload = {
  appointmentDate: string
  timeSlot: string
}

export type PatientAppointment = {
  id: string
  appointmentDate: string
  timeSlot: string
  status?: string
  queueToken?: number | string
}

export type CreatePrescriptionPayload = {
  appointmentId: string
  name: string
  dosage: string
  duration: string
  notes: string
}

export type Prescription = {
  id: string
  patientId?: string
  patientName?: string
  name: string
  dosage: string
  duration: string
  notes: string
}

export type DoctorPatient = {
  id: string
  name: string
  email: string
  phone?: string
}

export type DoctorQueueItem = {
  id: string
  appointmentId?: string
  appointmentDate?: string
  timeSlot?: string
  token?: number | string
  status?: string
  patientName?: string
}

export async function loginService(data: LoginPayload): Promise<LoginResponse> {
  try {
    const res = await api.post("/auth/login", data)
    return res.data as LoginResponse
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Login failed"
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}

export async function createAdminUserService(
  data: CreateUserPayload,
  token: string
): Promise<void> {
  try {
    await api.post("/admin/users", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Failed to create user."
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}

export async function getAdminUsersService(token: string): Promise<AdminUser[]> {
  try {
    const res = await api.get("/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = res.data as AdminUser[] | { users?: AdminUser[] }

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload.users)) {
      return payload.users
    }

    return []
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Failed to fetch users."
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}

export async function bookAppointmentService(
  data: BookAppointmentPayload,
  token: string
): Promise<void> {
  try {
    await api.post("/appointments", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Failed to book appointment."
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}

export async function getMyAppointmentsService(token: string): Promise<PatientAppointment[]> {
  try {
    const res = await api.get("/appointments/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = res.data as PatientAppointment[] | { appointments?: PatientAppointment[] }

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload.appointments)) {
      return payload.appointments
    }

    return []
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Failed to fetch appointments."
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}

export async function createPrescriptionService(
  data: CreatePrescriptionPayload,
  token: string
): Promise<void> {
  try {
    const { appointmentId, ...prescriptionData } = data
    await api.post(`/prescriptions/${encodeURIComponent(appointmentId)}`, prescriptionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Failed to add prescription."
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}

export async function getMyPrescriptionsService(token: string): Promise<Prescription[]> {
  try {
    const res = await api.get("/prescriptions/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = res.data as Prescription[] | { prescriptions?: Prescription[] }

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload.prescriptions)) {
      return payload.prescriptions
    }

    return []
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Failed to fetch prescriptions."
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}

export async function getDoctorPatientsService(token: string): Promise<DoctorPatient[]> {
  try {
    const res = await api.get("/doctor/patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = res.data as DoctorPatient[] | { patients?: DoctorPatient[] }

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload.patients)) {
      return payload.patients
    }

    return []
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Failed to fetch patients."
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}

export async function getDoctorQueueService(token: string): Promise<DoctorQueueItem[]> {
  try {
    const res = await api.get("/doctor/queue", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = res.data as DoctorQueueItem[] | { queue?: DoctorQueueItem[] }

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload.queue)) {
      return payload.queue
    }

    return []
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Failed to fetch doctor queue."
      throw new Error(message)
    }

    throw new Error("Server error. Try again.")
  }
}
