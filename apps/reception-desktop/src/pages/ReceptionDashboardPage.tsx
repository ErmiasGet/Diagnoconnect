import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, ClipboardList, TrendingUp, Clock, Activity, ArrowRight, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../lib/api';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function ReceptionDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => { const r = await dashboardAPI.getStats(); return r.data.data; },
    refetchInterval: 30000,
  });

  const s = stats || {
    totalPatients: 0, todayAppointments: 0, todayVisits: 0,
    activeDoctors: 0, pendingLabResults: 0, pendingBills: 0,
    queueLength: 0, revenue: { today: 0, thisWeek: 0, thisMonth: 0 },
  };

  const quickLinks = [
    { to: '/register-patient', label: 'Register Patient', icon: <UserPlus size={20} />, color: 'bg-primary-50 text-primary-600 hover:bg-primary-100' },
    { to: '/queue', label: 'View Queue', icon: <Users size={20} />, color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
    { to: '/visits', label: 'Create Visit', icon: <ClipboardList size={20} />, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reception Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back — here's today's overview</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's Appointments" value={s.todayAppointments} icon={<ClipboardList size={24} className="text-white" />} color="bg-blue-500" />
        <StatCard label="Patients in Queue" value={s.queueLength} icon={<Users size={24} className="text-white" />} color="bg-orange-500" />
        <StatCard label="Total Patients" value={s.totalPatients.toLocaleString()} icon={<Activity size={24} className="text-white" />} color="bg-green-500" trend="↑ 8% this month" />
        <StatCard label="Revenue Today" value={`Br ${s.revenue?.today?.toLocaleString() || 0}`} icon={<TrendingUp size={24} className="text-white" />} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${link.color}`}>
                {link.icon}
                <span className="font-medium text-sm">{link.label}</span>
                <ArrowRight size={16} className="ml-auto" />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Queue Status</h3>
            <Link to="/queue" className="text-primary-600 text-sm font-medium hover:underline">View Full Queue →</Link>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : s.queueLength > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Current Patient</p>
                    <p className="text-sm text-gray-500">In consultation</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">IN PROGRESS</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-gray-900">{Math.max(0, s.queueLength - 1)}</p>
                    <p className="text-xs text-gray-500">Waiting</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-gray-900">~{Math.max(0, s.queueLength - 1) * 15}m</p>
                    <p className="text-xs text-gray-500">Est. Wait</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-gray-900">{s.activeDoctors}</p>
                    <p className="text-xs text-gray-500">Doctors Active</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No patients in queue</p>
                <p className="text-gray-300 text-sm mt-1">All clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Alerts & Notifications</h3>
        </div>
        <div className="space-y-2">
          {s.pendingBills > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <AlertCircle size={18} className="text-yellow-600" />
              <span className="text-sm text-yellow-800">{s.pendingBills} pending bills require attention</span>
            </div>
          )}
          {s.pendingLabResults > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <AlertCircle size={18} className="text-blue-600" />
              <span className="text-sm text-blue-800">{s.pendingLabResults} lab results pending review</span>
            </div>
          )}
          {(!s.pendingBills && !s.pendingLabResults) && (
            <p className="text-gray-400 text-sm text-center py-4">No alerts at this time</p>
          )}
        </div>
      </div>
    </div>
  );
}
