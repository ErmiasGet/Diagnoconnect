import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
}

interface AuthState {
  user: AuthUser | null;
  organization: { id: string; name: string; type: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, org: { id: string; name: string; type: string }, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  token: null,
  isAuthenticated: false,
  login: (user, organization, token) => {
    localStorage.setItem('dc_token', token);
    localStorage.setItem('dc_user', JSON.stringify(user));
    localStorage.setItem('dc_org', JSON.stringify(organization));
    set({ user, organization, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('dc_token');
    localStorage.removeItem('dc_user');
    localStorage.removeItem('dc_org');
    set({ user: null, organization: null, token: null, isAuthenticated: false });
  },
}));

const storedToken = localStorage.getItem('dc_token');
const storedUser = localStorage.getItem('dc_user');
const storedOrg = localStorage.getItem('dc_org');
if (storedToken && storedUser && storedOrg) {
  useAuthStore.setState({
    user: JSON.parse(storedUser),
    organization: JSON.parse(storedOrg),
    token: storedToken,
    isAuthenticated: true,
  });
}
