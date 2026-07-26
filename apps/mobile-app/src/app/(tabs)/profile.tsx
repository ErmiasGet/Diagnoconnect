import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-3 border-b border-gray-100">
      <Text className="text-gray-500">{label}</Text>
      <Text className="text-gray-900 font-medium">{value}</Text>
    </View>
  );
}

function MenuItem({ label, icon, onPress, danger }: { label: string; icon: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100" onPress={onPress}>
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className={`flex-1 text-base ${danger ? 'text-red-600' : 'text-gray-900'}`}>{label}</Text>
      <Text className="text-gray-400">›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, organization, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-primary-600 pt-14 pb-8 px-5 items-center">
        <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-3">
          <Text className="text-white text-3xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <Text className="text-white text-xl font-bold">{user?.firstName} {user?.lastName}</Text>
        <Text className="text-primary-200 text-sm mt-1">{user?.role?.replace(/_/g, ' ')}</Text>
      </View>

      <View className="px-5 -mt-4">
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <Text className="text-gray-800 font-semibold mb-2">Personal Information</Text>
          <ProfileRow label="Email" value={user?.email || ''} />
          <ProfileRow label="Phone" value={user?.phone || ''} />
          <ProfileRow label="Organization" value={organization?.name || ''} />
          <ProfileRow label="Role" value={user?.role?.replace(/_/g, ' ') || ''} />
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <MenuItem label="Notifications" icon="🔔" onPress={() => {}} />
          <MenuItem label="Privacy Settings" icon="🔒" onPress={() => {}} />
          <MenuItem label="Help & Support" icon="❓" onPress={() => {}} />
          <MenuItem label="About DiagnoConnect" icon="ℹ️" onPress={() => {}} />
          <MenuItem label="Sign Out" icon="🚪" onPress={handleLogout} danger />
        </View>

        <Text className="text-gray-300 text-xs text-center mb-8">DiagnoConnect v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
