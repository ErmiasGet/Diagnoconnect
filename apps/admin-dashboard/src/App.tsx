import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import OrganizationsPage from "./pages/tenants/OrganizationsPage";
import OrganizationDetailPage from "./pages/tenants/OrganizationDetailPage";
import UsersPage from "./pages/users/UsersPage";
import SubscriptionsPage from "./pages/subscriptions/SubscriptionsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import AuditLogsPage from "./pages/audit-logs/AuditLogsPage";
import SettingsPage from "./pages/settings/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
      <Route path="/organizations/:id" element={<ProtectedRoute><OrganizationDetailPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: "10px", background: "#fff", color: "#0F172A", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }} />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
