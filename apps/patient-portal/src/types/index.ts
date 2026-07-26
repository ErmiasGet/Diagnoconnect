export interface User {
  id: string;
  email: string;
  role: "patient" | "admin" | "doctor" | "nurse" | "lab_tech" | "receptionist";
  patient?: Patient;
}

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: string;
  city: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  profileImage?: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  profileImage?: string;
  schedule?: DoctorSchedule[];
  consultationFee: number;
  bio?: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  chiefComplaint?: string;
  diagnosis?: string;
  notes?: string;
  doctor?: Doctor;
  patient?: Patient;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  status: "scheduled" | "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show";
  reason?: string;
  notes?: string;
  doctor?: Doctor;
  patient?: Patient;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  medications: PrescriptionMedication[];
  notes?: string;
  doctor?: Doctor;
  visit?: Visit;
  createdAt: string;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  turnaroundTime?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  visitId?: string;
  testId: string;
  testName: string;
  result: string;
  referenceRange?: string;
  unit?: string;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  labTest?: LabTest;
  createdAt: string;
}

export interface LabRequest {
  id: string;
  patientId: string;
  visitId: string;
  tests: LabTest[];
  status: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
}

export interface RadiologyRequest {
  id: string;
  patientId: string;
  visitId: string;
  type: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  report?: RadiologyReport;
  createdAt: string;
}

export interface RadiologyReport {
  id: string;
  requestId: string;
  findings: string;
  impression: string;
  recommendations?: string;
  images?: string[];
  createdAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  status: "pending" | "partial" | "paid" | "overdue" | "cancelled";
  dueDate?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "cash" | "card" | "insurance" | "transfer";
  status: "pending" | "completed" | "failed" | "refunded";
  reference?: string;
  createdAt: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface InsurancePolicy {
  id: string;
  patientId: string;
  providerId: string;
  policyNumber: string;
  coveragePercentage: number;
  maxCoverage: number;
  startDate: string;
  endDate: string;
  provider?: InsuranceProvider;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  policyId: string;
  invoiceId: string;
  amount: number;
  status: "submitted" | "processing" | "approved" | "denied" | "paid";
  policy?: InsurancePolicy;
  invoice?: Invoice;
  createdAt: string;
}

export interface EmrRecord {
  id: string;
  patientId: string;
  visitId?: string;
  type: "soap" | "progress" | "discharge" | "referral";
  content: SoapNote | Record<string, unknown>;
  doctor?: Doctor;
  createdAt: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  doctor?: Doctor;
  patient?: Patient;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  upcomingAppointments: number;
  activePrescriptions: number;
  pendingLabResults: number;
  outstandingBalance: number;
  recentVisits: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
