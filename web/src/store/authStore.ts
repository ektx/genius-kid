import { defineStore } from 'pinia';
import { api } from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('auth-token'),
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(credentials: any) {
      this.loading = true;
      try {
        const response: any = await api.post('/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('auth-token', this.token!);
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData: any) {
      this.loading = true;
      try {
        const response = await api.post('/auth/register', userData);
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return;
      try {
        const response: any = await api.get('/auth/me');
        this.user = response.data;
      } catch (error) {
        this.logout();
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('auth-token');
    },
  },
});
