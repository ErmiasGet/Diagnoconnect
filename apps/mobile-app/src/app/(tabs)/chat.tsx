import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../../lib/api';

export default function ChatScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const r = await chatAPI.getConversations();
      return r.data.data;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const conversations = data || [];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary-600 pt-14 pb-6 px-5">
        <Text className="text-white text-2xl font-bold">Messages</Text>
        <Text className="text-primary-200 text-sm mt-1">Chat with your healthcare providers</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          const other = item.participants?.find((p: any) => p.role !== 'PATIENT');
          return (
            <TouchableOpacity className="bg-white mx-5 mb-2 rounded-2xl p-4 shadow-sm flex-row items-center">
              <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
                <Text className="text-primary-700 font-bold text-lg">
                  {other?.firstName?.[0] || '?'}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-center">
                  <Text className="font-semibold text-gray-900">
                    {other ? `${other.firstName} ${other.lastName}` : 'Conversation'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View className="bg-primary-600 rounded-full w-5 h-5 items-center justify-center">
                      <Text className="text-white text-xs">{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-500 text-sm mt-0.5" numberOfLines={1}>
                  {item.lastMessage?.content || 'No messages yet'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">💬</Text>
            <Text className="text-gray-400 text-lg">No conversations yet</Text>
            <Text className="text-gray-300 text-sm mt-1">Start a chat with your doctor</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
      />
    </View>
  );
}
