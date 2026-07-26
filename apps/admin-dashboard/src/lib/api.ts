import { api } from "./utils";
import type {
  ApiResponse,
  PaginatedResponse,
  Organization,
  Subscription,
  PlatformUser,
  AuditLog,
  DashboardStats,
  Notification,
  SystemMetrics,
} from "../types";

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: { id: string; email: string; firstName: string; lastName: string; role: string } }>>("/auth/login", { email, password }).then((r) => r.data.data),

  getProfile: () =>
    api.get<ApiResponse<{ id: string; email: string; firstName: string; lastName: string; role: string }>>("/auth/profile").then((r) => r.data.data),

  logout: () =>
    api.post("/auth/logout").then((r) => r.data.data),
};

export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>("/admin/dashboard/stats").then((r) => r.data.data),

  getSystemHealth: () =>
    api.get<ApiResponse<SystemMetrics>>("/admin/dashboard/system-health").then((r) => r.data.data),
};

export const organizationService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Organization>>("/admin/organizations", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Organization>>(`/admin/organizations/${id}`).then((r) => r.data.data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<Organization>>(`/admin/organizations/${id}/status`, { status }).then((r) => r.data.data),

  approve: (id: string) =>
    api.patch<ApiResponse<Organization>>(`/admin/organizations/${id}/approve`).then((r) => r.data.data),

  reject: (id: string, reason: string) =>
    api.patch<ApiResponse<Organization>>(`/admin/organizations/${id}/reject`, { reason }).then((r) => r.data.data),

  getStats: () =>
    api.get<ApiResponse<{ total: number; active: number; pending: number; suspended: number; byType: Record<string, number> }>>("/admin/organizations/stats").then((r) => r.data.data),
};

export const userService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<PlatformUser>>("/admin/users", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<PlatformUser>>(`/admin/users/${id}`).then((r) => r.data.data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<PlatformUser>>(`/admin/users/${id}/status`, { status }).then((r) => r.data.data),
};

export const subscriptionService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Subscription>>("/admin/subscriptions", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Subscription>>(`/admin/subscriptions/${id}`).then((r) => r.data.data),

  update: (id: string, data: Partial<Subscription>) =>
    api.patch<ApiResponse<Subscription>>(`/admin/subscriptions/${id}`, data).then((r) => r.data.data),

  getStats: () =>
    api.get<ApiResponse<{ distribution: { plan: string; count: number }[]; revenue: { month: string; amount: number }[]; expiringSoon: Subscription[] }>>("/admin/subscriptions/stats").then((r) => r.data.data),
};

export const analyticsService = {
  getUserGrowth: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ month: string; count: number }[]>>("/admin/analytics/user-growth", { params }).then((r) => r.data.data),

  getRevenue: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ month: string; revenue: number }[]>>("/admin/analytics/revenue", { params }).then((r) => r.data.data),

  getFeatureUsage: () =>
    api.get<ApiResponse<{ feature: string; usage: number }[]>>("/admin/analytics/feature-usage").then((r) => r.data.data),

  getApiUsage: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ endpoint: string; calls: number; avgResponseTime: number }[]>>("/admin/analytics/api-usage", { params }).then((r) => r.data.data),

  getGeographic: () =>
    api.get<ApiResponse<{ region: string; organizations: number; users: number }[]>>("/admin/analytics/geographic").then((r) => r.data.data),
};

export const auditService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<AuditLog>>("/admin/audit-logs", { params }).then((r) => r.data),
};

export const settingsService = {
  getPlatformSettings: () =>
    api.get<ApiResponse<Record<string, unknown>>>("/admin/settings/platform").then((r) => r.data.data),

  updatePlatformSettings: (data: Record<string, unknown>) =>
    api.patch<ApiResponse<Record<string, unknown>>>("/admin/settings/platform", data).then((r) => r.data.data),

  getEmailConfig: () =>
    api.get<ApiResponse<Record<string, unknown>>>("/admin/settings/email").then((r) => r.data.data),

  updateEmailConfig: (data: Record<string, unknown>) =>
    api.patch<ApiResponse<Record<string, unknown>>>("/admin/settings/email", data).then((r) => r.data.data),

  getPaymentConfig: () =>
    api.get<ApiResponse<Record<string, unknown>>>("/admin/settings/payment").then((r) => r.data.data),

  updatePaymentConfig: (data: Record<string, unknown>) =>
    api.patch<ApiResponse<Record<string, unknown>>>("/admin/settings/payment", data).then((r) => r.data.data),

  getFeatureToggles: () =>
    api.get<ApiResponse<Record<string, boolean>>>("/admin/settings/features").then((r) => r.data.data),

  updateFeatureToggles: (data: Record<string, boolean>) =>
    api.patch<ApiResponse<Record<string, boolean>>>("/admin/settings/features", data).then((r) => r.data.data),

  triggerBackup: () =>
    api.post<ApiResponse<{ backupId: string; status: string }>>("/admin/settings/backup").then((r) => r.data.data),
};

export const notificationService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Notification>>("/admin/notifications", { params }).then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch<ApiResponse<Notification>>(`/admin/notifications/${id}/read`).then((r) => r.data.data),

  markAllRead: () =>
    api.patch<ApiResponse<null>>("/admin/notifications/read-all").then((r) => r.data.data),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>("/admin/notifications/unread-count").then((r) => r.data.data),
};
