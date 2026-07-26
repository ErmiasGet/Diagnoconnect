import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  avatar?: string;
  organizationId: string;
}

interface AuthState {
  user: AuthUser | null;
  organization: { id: string; name: string; type: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const { data } = await authAPI.login(email, password);
    const { user, organization, accessToken, refreshToken } = data.data;
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    await SecureStore.setItemAsync('organization', JSON.stringify(organization));
    set({ user, organization, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('organization');
    set({ user: null, organization: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const userStr = await SecureStore.getItemAsync('user');
      const orgStr = await SecureStore.getItemAsync('organization');
      if (token && userStr && orgStr) {
        set({
          user: JSON.parse(userStr),
          organization: JSON.parse(orgStr),
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch {
      // silently fail
    }
    set({ isLoading: false });
  },
}));
