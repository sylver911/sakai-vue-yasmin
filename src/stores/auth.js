import { defineStore } from 'pinia';
import api from '@/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuthenticated: !!localStorage.getItem('access_token'),
        loading: false,
        error: null,
    }),

    getters: {
        isAdmin: (state) => state.user?.is_admin || false,
        isSuperAdmin: (state) => state.user?.is_super_admin || false,
        canEdit: (state) => state.user?.can_edit || false,
        fullName: (state) => state.user?.full_name || '',
        userRole: (state) => state.user?.role || '',
    },

    actions: {
        async login(email, password) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.post('/api/auth/login/', { email, password });
                api.setTokens(response.access, response.refresh);
                await this.fetchUser();
                this.isAuthenticated = true;
                return true;
            } catch (error) {
                this.error = error.data?.detail || 'Bejelentkezési hiba';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async fetchUser() {
            try {
                const user = await api.get('/api/auth/me/');
                this.user = user;
                localStorage.setItem('user', JSON.stringify(user));
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        },

        async logout() {
            api.clearTokens();
            this.user = null;
            this.isAuthenticated = false;
        },

        async changePassword(oldPassword, newPassword) {
            return api.post('/api/auth/change-password/', {
                old_password: oldPassword,
                new_password: newPassword,
            });
        },

        async updateProfile(data) {
            const user = await api.patch('/api/auth/me/', data);
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        },
    },
});
