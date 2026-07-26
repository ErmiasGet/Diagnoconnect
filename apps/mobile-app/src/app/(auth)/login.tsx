import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setError('');
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-white px-6 pt-16">
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary-600 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">DC</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">DiagnoConnect</Text>
            <Text className="text-gray-500 text-center mt-2">
              Connecting Patients, Hospitals{'\n'}Doctors & Diagnostic Centers
            </Text>
          </View>

          <View className="space-y-4">
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3">
                <Text className="text-red-700 text-sm text-center">{error}</Text>
              </View>
            ) : null}

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Email Address</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Password</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity className="self-end">
              <Text className="text-primary-600 text-sm font-medium">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-primary-600 rounded-xl py-4 items-center mt-2"
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-primary-600 rounded-xl py-4 items-center mt-2"
              onPress={() => router.push('/(auth)/register')}
            >
              <Text className="text-primary-600 font-semibold text-base">Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
