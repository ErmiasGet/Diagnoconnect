export const API_VERSION = 'v1';
export const APP_NAME = 'DiagnoConnect';
export const APP_TAGLINE = 'Connecting Patients, Hospitals, Doctors and Diagnostic Centers on One Intelligent Platform';

export const ORG_TYPES = ['HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER', 'PHARMACY', 'PRIVATE_PRACTICE', 'LABORATORY', 'RADIOLOGY_CENTER', 'DENTAL_CLINIC', 'EYE_CLINIC'] as const;

export const USER_ROLES = ['SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'NURSE', 'PHARMACIST', 'CASHIER', 'INSURANCE_OFFICER', 'PATIENT', 'SUPPORT'] as const;

export const SUBSCRIPTION_PLANS = {
  FREE: { name: 'Free', maxUsers: 5, maxPatients: 1000, monthlyPrice: 0, features: ['basic_emr', 'appointments'] },
  BASIC: { name: 'Basic', maxUsers: 15, maxPatients: 5000, monthlyPrice: 5000, features: ['basic_emr', 'appointments', 'laboratory', 'billing'] },
  PROFESSIONAL: { name: 'Professional', maxUsers: 50, maxPatients: 25000, monthlyPrice: 15000, features: ['basic_emr', 'appointments', 'laboratory', 'billing', 'pharmacy', 'radiology', 'insurance', 'telemedicine'] },
  ENTERPRISE: { name: 'Enterprise', maxUsers: -1, maxPatients: -1, monthlyPrice: 50000, features: ['all'] },
} as const;

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
  IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-800' },
  WAITING: { bg: 'bg-orange-100', text: 'text-orange-800' },
  PAID: { bg: 'bg-green-100', text: 'text-green-800' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-]{10,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  medicalRecordNumber: /^MRN-[A-Z0-9]+-[A-Z0-9]+$/,
};

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const BLOOD_GROUPS = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'] as const;
export const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-', B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-', O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
};

export const GENDER_LABELS: Record<string, string> = { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' };

export const VISIT_STATUS_FLOW = [
  'REGISTERED', 'IN_QUEUE', 'IN_PROGRESS', 'LAB_PENDING', 'LAB_COMPLETED',
  'RADIOLOGY_PENDING', 'RADIOLOGY_COMPLETED', 'PHARMACY_PENDING',
  'BILLING_PENDING', 'COMPLETED'
] as const;

export const CURRENCY = { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' };
