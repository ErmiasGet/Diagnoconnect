import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { visitsAPI } from '../../lib/api';

const STATUS_STYLES: Record<string, string> = {
  REGISTERED: 'bg-gray-100 text-gray-700',
  IN_QUEUE: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  LAB_PENDING: 'bg-orange-100 text-orange-800',
  BILLING_PENDING: 'bg-blue-100 text-blue-800',
};

export default function RecordsScreen() {
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['visits', search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const r = await visitsAPI.getAll(params);
      return r.data.data;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const visits = data || [];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary-600 pt-14 pb-6 px-5">
        <Text className="text-white text-2xl font-bold">Medical Records</Text>
        <Text className="text-primary-200 text-sm mt-1">View your visit history</Text>
        <View className="mt-4 bg-white rounded-xl px-4 py-3">
          <TextInput
            className="text-base text-gray-800"
            placeholder="Search records..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={visits}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity className="bg-white mx-5 mb-3 rounded-2xl p-4 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Visit #{item.visitNumber}</Text>
                <Text className="text-gray-500 text-sm mt-0.5">
                  Dr. {item.doctor?.lastName || 'Doctor'}
                </Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${STATUS_STYLES[item.status] || 'bg-gray-100'}`}>
                <Text className="text-xs font-medium">{item.status?.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm mt-1">📋 {item.chiefComplaint}</Text>
            {item.diagnosis ? (
              <Text className="text-gray-700 text-sm mt-1 font-medium">Diagnosis: {item.diagnosis}</Text>
            ) : null}
            <Text className="text-gray-400 text-xs mt-2">{new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">📋</Text>
            <Text className="text-gray-400 text-lg">No records found</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
      />
    </View>
  );
}
