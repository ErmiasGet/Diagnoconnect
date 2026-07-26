import { api } from "./utils";
import type {
  ApiResponse,
  PaginatedResponse,
  Patient,
  Visit,
  Appointment,
  Doctor,
  Prescription,
  LabTest,
  LabResult,
  LabRequest,
  RadiologyRequest,
  Invoice,
  Payment,
  InsuranceProvider,
  InsurancePolicy,
  InsuranceClaim,
  EmrRecord,
  Notification,
  ChatRoom,
  ChatMessage,
  DashboardStats,
  User,
} from "../types";

// Auth Service
export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>("/auth/login", { email, password }).then((r) => r.data.data),

  register: (data: { email: string; password: string; firstName: string; lastName: string; phone: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>("/auth/register", data).then((r) => r.data.data),

  getProfile: () =>
    api.get<ApiResponse<User>>("/auth/profile").then((r) => r.data.data),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/auth/refresh-token", { refreshToken }).then((r) => r.data.data),

  logout: () =>
    api.post("/auth/logout").then((r) => r.data.data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>("/auth/forgot-password", { email }).then((r) => r.data.data),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<null>>("/auth/reset-password", { token, password }).then((r) => r.data.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<null>>("/auth/change-password", { currentPassword, newPassword }).then((r) => r.data.data),
};

// Patient Service
export const patientService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Patient>>("/patients", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Patient>>(`/patients/${id}`).then((r) => r.data.data),

  create: (data: Partial<Patient>) =>
    api.post<ApiResponse<Patient>>("/patients", data).then((r) => r.data.data),

  update: (id: string, data: Partial<Patient>) =>
    api.patch<ApiResponse<Patient>>(`/patients/${id}`, data).then((r) => r.data.data),

  getMedicalHistory: (id: string) =>
    api.get<ApiResponse<Visit[]>>(`/patients/${id}/medical-history`).then((r) => r.data.data),

  getStats: () =>
    api.get<ApiResponse<DashboardStats>>("/patients/stats").then((r) => r.data.data),
};

// Visit Service
export const visitService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Visit>>("/visits", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Visit>>(`/visits/${id}`).then((r) => r.data.data),

  create: (data: Partial<Visit>) =>
    api.post<ApiResponse<Visit>>("/visits", data).then((r) => r.data.data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<Visit>>(`/visits/${id}/status`, { status }).then((r) => r.data.data),

  getTodayVisits: () =>
    api.get<ApiResponse<Visit[]>>("/visits/today").then((r) => r.data.data),
};

// Appointment Service
export const appointmentService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Appointment>>("/appointments", { params }).then((r) => r.data),

  create: (data: Partial<Appointment>) =>
    api.post<ApiResponse<Appointment>>("/appointments", data).then((r) => r.data.data),

  cancel: (id: string, reason?: string) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { reason }).then((r) => r.data.data),

  reschedule: (id: string, data: { date: string; timeSlot: string }) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, data).then((r) => r.data.data),

  checkIn: (id: string) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/check-in`).then((r) => r.data.data),

  getAvailability: (doctorId: string, date: string) =>
    api.get<ApiResponse<string[]>>(`/appointments/availability`, { params: { doctorId, date } }).then((r) => r.data.data),
};

// Doctor Service
export const doctorService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Doctor>>("/doctors", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Doctor>>(`/doctors/${id}`).then((r) => r.data.data),

  getSchedule: (id: string) =>
    api.get<ApiResponse<unknown[]>>(`/doctors/${id}/schedule`).then((r) => r.data.data),

  getAvailability: (id: string, date: string) =>
    api.get<ApiResponse<string[]>>(`/doctors/${id}/availability`, { params: { date } }).then((r) => r.data.data),
};

// Prescription Service
export const prescriptionService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Prescription>>("/prescriptions", { params }).then((r) => r.data),

  create: (data: Partial<Prescription>) =>
    api.post<ApiResponse<Prescription>>("/prescriptions", data).then((r) => r.data.data),

  getByVisit: (visitId: string) =>
    api.get<ApiResponse<Prescription[]>>(`/prescriptions/visit/${visitId}`).then((r) => r.data.data),
};

// Laboratory Service
export const laboratoryService = {
  getTests: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<LabTest>>("/laboratory/tests", { params }).then((r) => r.data),

  getResults: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<LabResult>>("/laboratory/results", { params }).then((r) => r.data),

  createRequest: (data: Partial<LabRequest>) =>
    api.post<ApiResponse<LabRequest>>("/laboratory/requests", data).then((r) => r.data.data),
};

// Radiology Service
export const radiologyService = {
  getRequests: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<RadiologyRequest>>("/radiology/requests", { params }).then((r) => r.data),

  getReports: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<RadiologyRequest>>("/radiology/reports", { params }).then((r) => r.data),
};

// Billing Service
export const billingService = {
  getInvoices: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Invoice>>("/billing/invoices", { params }).then((r) => r.data),

  getPayments: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Payment>>("/billing/payments", { params }).then((r) => r.data),
};

// Insurance Service
export const insuranceService = {
  getProviders: () =>
    api.get<ApiResponse<InsuranceProvider[]>>("/insurance/providers").then((r) => r.data.data),

  getPolicies: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<InsurancePolicy>>("/insurance/policies", { params }).then((r) => r.data),

  getClaims: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<InsuranceClaim>>("/insurance/claims", { params }).then((r) => r.data),
};

// EMR Service
export const emrService = {
  getRecords: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<EmrRecord>>("/emr/records", { params }).then((r) => r.data),

  createRecord: (data: Partial<EmrRecord>) =>
    api.post<ApiResponse<EmrRecord>>("/emr/records", data).then((r) => r.data.data),

  getSoapNotes: (visitId: string) =>
    api.get<ApiResponse<EmrRecord[]>>(`/emr/soap-notes/visit/${visitId}`).then((r) => r.data.data),
};

// Notification Service
export const notificationService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Notification>>("/notifications", { params }).then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`).then((r) => r.data.data),

  markAllRead: () =>
    api.patch<ApiResponse<null>>("/notifications/read-all").then((r) => r.data.data),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>("/notifications/unread-count").then((r) => r.data.data),
};

// Chat Service
export const chatService = {
  getRooms: () =>
    api.get<ApiResponse<ChatRoom[]>>("/chat/rooms").then((r) => r.data.data),

  getMessages: (roomId: string, params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<ChatMessage>>(`/chat/rooms/${roomId}/messages`, { params }).then((r) => r.data),

  sendMessage: (roomId: string, content: string) =>
    api.post<ApiResponse<ChatMessage>>(`/chat/rooms/${roomId}/messages`, { content }).then((r) => r.data.data),

  createRoom: (participantId: string) =>
    api.post<ApiResponse<ChatRoom>>("/chat/rooms", { participantId }).then((r) => r.data.data),
};

// Report Service
export const reportService = {
  getDashboardStats: () =>
    api.get<ApiResponse<DashboardStats>>("/reports/dashboard").then((r) => r.data.data),
};

// File Service
export const fileService = {
  upload: (file: File, patientId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (patientId) formData.append("patientId", patientId);
    return api.post<ApiResponse<{ url: string; id: string }>>("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  getByPatient: (patientId: string) =>
    api.get<ApiResponse<{ id: string; url: string; name: string; createdAt: string }[]>>(`/files/patient/${patientId}`).then((r) => r.data.data),
};
