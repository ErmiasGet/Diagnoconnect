import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { authAPI } from '../../lib/api';

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    organizationName: '', organizationType: 'HOSPITAL',
    address: '', city: '', region: '',
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const orgTypes = [
    'HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER', 'PHARMACY',
    'PRIVATE_PRACTICE', 'LABORATORY', 'RADIOLOGY_CENTER',
  ];

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      await authAPI.register(form);
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-white px-6 pt-14">
          <TouchableOpacity onPress={() => (step === 1 ? router.back() : setStep(step - 1))} className="mb-6">
            <Text className="text-primary-600 text-base">← Back</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {step === 1 ? 'Personal Information' : 'Organization Details'}
          </Text>
          <Text className="text-gray-500 text-sm mb-6">Step {step} of 2</Text>

          <View className="flex-row gap-2 mb-6">
            <View className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <View className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          </View>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-700 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View className="space-y-4">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">First Name *</Text>
                  <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.firstName} onChangeText={(v) => update('firstName', v)} placeholder="John" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Last Name *</Text>
                  <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.lastName} onChangeText={(v) => update('lastName', v)} placeholder="Doe" />
                </View>
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Email *</Text>
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.email} onChangeText={(v) => update('email', v)} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Phone *</Text>
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.phone} onChangeText={(v) => update('phone', v)} placeholder="+251 9XX XXX XXX" keyboardType="phone-pad" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Password *</Text>
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.password} onChangeText={(v) => update('password', v)} placeholder="Min 8 characters" secureTextEntry />
              </View>
              <TouchableOpacity className="bg-primary-600 rounded-xl py-4 items-center mt-4" onPress={() => setStep(2)}>
                <Text className="text-white font-semibold text-base">Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Organization Name *</Text>
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.organizationName} onChangeText={(v) => update('organizationName', v)} placeholder="Hospital name" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Organization Type *</Text>
                <View className="flex-row flex-wrap gap-2">
                  {orgTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      className={`px-3 py-2 rounded-lg border ${form.organizationType === type ? 'bg-primary-50 border-primary-600' : 'bg-white border-gray-200'}`}
                      onPress={() => update('organizationType', type)}
                    >
                      <Text className={`text-xs ${form.organizationType === type ? 'text-primary-700 font-medium' : 'text-gray-600'}`}>
                        {type.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Address</Text>
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.address} onChangeText={(v) => update('address', v)} placeholder="Street address" />
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">City</Text>
                  <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.city} onChangeText={(v) => update('city', v)} placeholder="Addis Ababa" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Region</Text>
                  <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={form.region} onChangeText={(v) => update('region', v)} placeholder="Region" />
                </View>
              </View>
              <TouchableOpacity
                className="bg-primary-600 rounded-xl py-4 items-center mt-4"
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Create Account</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
