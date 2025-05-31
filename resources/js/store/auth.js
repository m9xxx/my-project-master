import { defineStore } from 'pinia';
import http from '@/services/http';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isGuest: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !state.isGuest,
    hasAccess: (state) => state.isAuthenticated || state.isGuest,
    userDisplayName: (state) => state.user?.name || 'Гость'
  },

  actions: {
    async login(credentials) {
      try {
        const response = await http.post('/auth/login', credentials);
        const { success, data, message } = response.data;
        if (!success) throw new Error(message || 'Ошибка авторизации');
        this.user = {
          id: data.id,
          name: data.username,
          email: data.email,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        this.isAuthenticated = true;
        this.isGuest = false;
        return true;
      } catch (error) {
        this.user = null;
        this.isAuthenticated = false;
        this.isGuest = false;
        throw new Error(error.response?.data?.message || error.message || 'Ошибка авторизации');
      }
    },

    async register(userData) {
      try {
        const payload = {
          username: userData.name,
          email: userData.email,
          password: userData.password
        };
        const response = await http.post('/auth/register', payload);
        const { success, data, message } = response.data;
        if (!success) throw new Error(message || 'Ошибка регистрации');
      this.user = {
          id: data.id,
          name: data.username,
          email: data.email,
          created_at: data.created_at,
          updated_at: data.updated_at
      };
      this.isAuthenticated = true;
      this.isGuest = false;
      return true;
      } catch (error) {
        this.user = null;
        this.isAuthenticated = false;
        this.isGuest = false;
        throw new Error(error.response?.data?.message || error.message || 'Ошибка регистрации');
      }
    },

    async loginAsGuest() {
      this.user = {
        id: 0,
        name: 'Гость',
        email: 'guest@example.com'
      };
      this.isAuthenticated = true;
      this.isGuest = true;
      return true;
    },

    async logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.isGuest = false;
    },

    async checkAuth() {
      return this.isAuthenticated;
    }
  }
});