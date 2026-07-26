import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { AppointmentsPage } from "./pages/appointments/AppointmentsPage";
import { BookAppointmentPage } from "./pages/appointments/BookAppointmentPage";
import { MedicalRecordsPage } from "./pages/medical-records/MedicalRecordsPage";
import { LabResultsPage } from "./pages/lab-results/LabResultsPage";
import { PrescriptionsPage } from "./pages/prescriptions/PrescriptionsPage";
import { BillingPage } from "./pages/billing/BillingPage";
import { InsurancePage } from "./pages/insurance/InsurancePage";
import { ChatPage } from "./pages/chat/ChatPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Forgot Password</h1>
                <p className="mt-2 text-gray-600">This page is under construction.</p>
              </div>
            </div>
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="mt-2 text-gray-600">This page is under construction.</p>
              </div>
            </div>
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/book"
        element={
          <ProtectedRoute>
            <BookAppointmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-records"
        element={
          <ProtectedRoute>
            <MedicalRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab-results"
        element={
          <ProtectedRoute>
            <LabResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/radiology"
        element={
          <ProtectedRoute>
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Radiology</h1>
                <p className="mt-2 text-gray-600">This page is under construction.</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescriptions"
        element={
          <ProtectedRoute>
            <PrescriptionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insurance"
        element={
          <ProtectedRoute>
            <InsurancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="mt-2 text-gray-600">This page is under construction.</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
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
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#333",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  padding: "12px 16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
                success: {
                  iconTheme: { primary: "#10b981", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
