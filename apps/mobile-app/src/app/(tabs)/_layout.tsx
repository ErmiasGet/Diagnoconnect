import { Tabs, Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏠', Appointments: '📅', Records: '📋', Chat: '💬', Profile: '👤',
  };
  return (
    <View className="items-center">
      <Text className={`text-xl ${focused ? 'opacity-100' : 'opacity-50'}`}>{icons[name] || '•'}</Text>
    </View>
  );
}

export default function TabLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} /> }} />
      <Tabs.Screen name="appointments" options={{ title: 'Appointments', tabBarIcon: ({ focused }) => <TabIcon name="Appointments" focused={focused} /> }} />
      <Tabs.Screen name="records" options={{ title: 'Records', tabBarIcon: ({ focused }) => <TabIcon name="Records" focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ focused }) => <TabIcon name="Chat" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }} />
    </Tabs>
  );
}
