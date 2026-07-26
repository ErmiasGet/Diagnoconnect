import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsAPI } from '../../lib/api';

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
};

export default function AppointmentsScreen() {
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['appointments', filter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filter !== 'ALL') params.status = filter;
      const r = await appointmentsAPI.getAll(params);
      return r.data.data;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const appointments = data || [];
  const filters = ['ALL', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary-600 pt-14 pb-6 px-5">
        <Text className="text-white text-2xl font-bold">Appointments</Text>
        <Text className="text-primary-200 text-sm mt-1">Manage your appointments</Text>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item: any) => item.id}
        ListHeaderComponent={() => (
          <View className="px-5 py-4">
            <FlatList
              horizontal
              data={filters}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full mr-2 ${filter === item ? 'bg-primary-600' : 'bg-white border border-gray-200'}`}
                  onPress={() => setFilter(item)}
                >
                  <Text className={`text-sm font-medium ${filter === item ? 'text-white' : 'text-gray-600'}`}>
                    {item.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity className="bg-white mx-5 mb-3 rounded-2xl p-4 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">
                  {item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : 'Patient'}
                </Text>
                <Text className="text-gray-500 text-sm mt-0.5">
                  Dr. {item.doctor?.lastName || 'Doctor'} • {item.doctor?.specialization}
                </Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}>
                <Text className="text-xs font-medium">{item.status?.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <View className="flex-row items-center mt-2">
              <Text className="text-gray-400 text-sm">📅 {item.date}</Text>
              <Text className="text-gray-400 text-sm ml-4">⏰ {item.time}</Text>
            </View>
            <Text className="text-gray-500 text-sm mt-1">Type: {item.type?.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">📅</Text>
            <Text className="text-gray-400 text-lg">No appointments found</Text>
            <Text className="text-gray-300 text-sm mt-1">Pull down to refresh</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
