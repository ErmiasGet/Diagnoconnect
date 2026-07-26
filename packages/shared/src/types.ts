import { ORG_TYPES, USER_ROLES, SUBSCRIPTION_PLANS, BLOOD_GROUPS, VISIT_STATUS_FLOW } from './index';

export type OrgType = typeof ORG_TYPES[number];
export type UserRole = typeof USER_ROLES[number];
export type BloodGroup = typeof BLOOD_GROUPS[number];
export type VisitStatus = typeof VISIT_STATUS_FLOW[number];
export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  logo?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: string;
  isActive: boolean;
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  language: string;
  appointmentDuration: number;
  allowOnlineBooking: boolean;
  enableNotifications: boolean;
  enableTelemedicine: boolean;
  enableInsurance: boolean;
  taxRate: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  organizationId: string;
  organization?: Organization;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor extends User {
  role: 'DOCTOR';
  specialization: string;
  licenseNumber: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  bio?: string;
  availableSlots: DoctorSlot[];
  averageRating: number;
  totalReviews: number;
}

export interface DoctorSlot {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  slotType: 'IN_PERSON' | 'TELEMEDICINE' | 'BOTH';
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email?: string;
  address: string;
  city: string;
  bloodGroup?: BloodGroup;
  medicalRecordNumber: string;
  organizationId: string;
  emergencyContact: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
  allergies: string[];
  chronicConditions: string[];
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  expiryDate: string;
  coveragePercentage: number;
  cardImage?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  doctor?: Doctor;
  organizationId: string;
  date: string;
  time: string;
  duration: number;
  type: 'IN_PERSON' | 'TELEMEDICINE' | 'FOLLOW_UP' | 'EMERGENCY';
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  doctor?: Doctor;
  organizationId: string;
  appointmentId?: string;
  visitNumber: string;
  status: VisitStatus;
  type: 'WALK_IN' | 'APPOINTMENT' | 'EMERGENCY' | 'TELEMEDICINE';
  chiefComplaint: string;
  diagnosis?: string;
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  radiologyOrders: RadiologyOrder[];
  billing: Billing;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  doctorId: string;
  patientId: string;
  medications: PrescriptionMedication[];
  notes?: string;
  isDispensed: boolean;
  dispensedAt?: string;
  dispensedBy?: string;
  createdAt: string;
}

export interface PrescriptionMedication {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  isDispensed: boolean;
}

export interface LabOrder {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  tests: LabTest[];
  status: 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  clinicalNotes?: string;
  resultNotes?: string;
  results: LabResult[];
  orderedAt: string;
  completedAt?: string;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  specimenType: string;
  normalRange?: string;
  unit?: string;
  result?: string;
  isAbnormal?: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface LabResult {
  testId: string;
  testName: string;
  value: string;
  unit: string;
  normalRange: string;
  isAbnormal: boolean;
  notes?: string;
}

export interface RadiologyOrder {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  studyType: string;
  bodyPart: string;
  clinicalIndication: string;
  status: 'ORDERED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  impressions?: string;
  findings?: string;
  reportUrl?: string;
  imageUrls: string[];
  orderedAt: string;
  completedAt?: string;
}

export interface Billing {
  id: string;
  visitId: string;
  patientId: string;
  organizationId: string;
  items: BillingItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERPAID' | 'REFUNDED';
  paymentMethod?: 'CASH' | 'CARD' | 'MOBILE_PAY' | 'INSURANCE' | 'BANK_TRANSFER';
  insuranceClaim?: InsuranceClaim;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isInsuranceCovered: boolean;
}

export interface InsuranceClaim {
  id: string;
  billingId: string;
  insuranceProvider: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount?: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'DENIED';
  submittedAt: string;
  resolvedAt?: string;
  denialReason?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'PRESCRIPTION';
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'APPOINTMENT' | 'LAB_RESULT' | 'PRESCRIPTION' | 'BILLING' | 'SYSTEM' | 'CHAT';
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface QueueEntry {
  id: string;
  patientId: string;
  patient?: Patient;
  visitId: string;
  visit?: Visit;
  queueNumber: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'NORMAL' | 'URGENT' | 'VIP';
  estimatedWaitTime?: number;
  calledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  todayVisits: number;
  activeDoctors: number;
  pendingLabResults: number;
  pendingBills: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  appointmentsByStatus: Record<string, number>;
  visitsByStatus: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  organizationId?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  organization: Organization;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  organizationName: string;
  organizationType: OrgType;
  address: string;
  city: string;
  region: string;
}
