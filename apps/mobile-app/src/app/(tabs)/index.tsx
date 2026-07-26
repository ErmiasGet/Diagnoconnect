import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { dashboardAPI } from '../../lib/api';

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <View className={`rounded-2xl p-4 flex-1 min-w-[45%] ${color}`}>
      <Text className="text-sm opacity-80 mb-1">{title}</Text>
      <Text className="text-2xl font-bold">{value}</Text>
    </View>
  );
}

function QuickAction({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity className="bg-white rounded-2xl p-4 items-center flex-1 shadow-sm" onPress={onPress}>
      <Text className="text-3xl mb-2">{icon}</Text>
      <Text className="text-xs font-medium text-gray-700 text-center">{label}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { data, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => { const r = await dashboardAPI.getStats(); return r.data.data; },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const stats = data || {
    totalPatients: 0, todayAppointments: 0, todayVisits: 0,
    activeDoctors: 0, pendingLabResults: 0, pendingBills: 0,
    revenue: { today: 0, thisWeek: 0, thisMonth: 0 },
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="bg-primary-600 pt-14 pb-8 px-6 rounded-b-3xl">
        <Text className="text-white text-lg">Good {getTimeOfDay()},</Text>
        <Text className="text-white text-2xl font-bold">{user?.firstName} {user?.lastName}</Text>
        <Text className="text-primary-200 text-sm mt-1">{user?.role?.replace(/_/g, ' ')}</Text>
      </View>

      <View className="px-5 -mt-4">
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <Text className="text-gray-500 text-sm mb-3">Today's Overview</Text>
          <View className="flex-row flex-wrap gap-3">
            <StatCard title="Appointments" value={stats.todayAppointments} color="bg-blue-500 text-white" />
            <StatCard title="Visits" value={stats.todayVisits} color="bg-teal-500 text-white" />
            <StatCard title="Lab Pending" value={stats.pendingLabResults} color="bg-orange-500 text-white" />
            <StatCard title="Active Doctors" value={stats.activeDoctors} color="bg-purple-500 text-white" />
          </View>
        </View>

        <Text className="text-gray-800 font-semibold text-lg mb-3">Quick Actions</Text>
        <View className="flex-row gap-3 mb-5">
          <QuickAction label="New Patient" icon="➕" onPress={() => {}} />
          <QuickAction label="Book Appt" icon="📅" onPress={() => {}} />
          <QuickAction label="Scan QR" icon="📷" onPress={() => {}} />
          <QuickAction label="Emergency" icon="🚨" onPress={() => {}} />
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <Text className="text-gray-500 text-sm mb-2">Revenue This Month</Text>
          <Text className="text-3xl font-bold text-gray-900">Br {(stats.revenue?.thisMonth || 0).toLocaleString()}</Text>
          <Text className="text-green-600 text-sm mt-1">↑ 12% from last month</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm mb-8">
          <Text className="text-gray-800 font-semibold mb-3">Pending Bills</Text>
          {stats.pendingBills > 0 ? (
            <View className="bg-yellow-50 rounded-xl p-3">
              <Text className="text-yellow-800">{stats.pendingBills} bills pending payment</Text>
            </View>
          ) : (
            <Text className="text-gray-400 text-sm">No pending bills</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
