export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "platform_admin" | "support";
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: "hospital" | "clinic" | "diagnostic_center" | "pharmacy" | "laboratory";
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logo?: string;
  status: "active" | "pending_approval" | "suspended" | "inactive";
  subscriptionId?: string;
  subscription?: Subscription;
  userCount: number;
  patientCount: number;
  storageUsed: number;
  admin?: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: "free" | "basic" | "professional" | "enterprise";
  status: "active" | "cancelled" | "past_due" | "trialing";
  monthlyPrice: number;
  annualPrice?: number;
  billingCycle: "monthly" | "annual";
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  maxUsers: number;
  maxPatients: number;
  maxStorage: number;
  features: string[];
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "admin" | "doctor" | "nurse" | "lab_tech" | "receptionist";
  status: "active" | "inactive" | "suspended";
  organizationId: string;
  organization?: Organization;
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  organizationId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface SystemMetrics {
  apiResponseTime: number;
  uptime: number;
  activeUsers: number;
  errorRate: number;
  totalRequests: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  totalPatients: number;
  monthlyRevenue: number;
  organizationsChange: number;
  usersChange: number;
  patientsChange: number;
  revenueChange: number;
  recentOrganizations: Organization[];
  subscriptionDistribution: { plan: string; count: number }[];
  topOrganizations: { name: string; users: number; patients: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  organizationsByType: { type: string; count: number }[];
  userGrowthByMonth: { month: string; count: number }[];
  systemHealth: SystemMetrics;
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
