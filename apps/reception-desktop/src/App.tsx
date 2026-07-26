import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import ReceptionDashboardPage from './pages/ReceptionDashboardPage';
import FastRegistrationPage from './pages/FastRegistrationPage';
import QueueDisplayPage from './pages/QueueDisplayPage';
import VisitManagementPage from './pages/VisitManagementPage';
import Sidebar from './components/Sidebar';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI) {
      electronAPI.onNavigate((path: string) => navigate(path));
    }
  }, [navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isAuthenticated && <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isAuthenticated ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><ReceptionDashboardPage /></ProtectedRoute>} />
          <Route path="/register-patient" element={<ProtectedRoute><FastRegistrationPage /></ProtectedRoute>} />
          <Route path="/queue" element={<ProtectedRoute><QueueDisplayPage /></ProtectedRoute>} />
          <Route path="/visits" element={<ProtectedRoute><VisitManagementPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><ReceptionDashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
