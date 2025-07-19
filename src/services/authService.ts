import api from './api';

export interface User {
    userId: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    lastLoginAt: string | null;
    isActive: boolean;
    organizationProfileId: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export const authService = {
    // Login
    login: async (credentials: LoginCredentials) => {
        const response = await api.post<{ token: string; user: User }>('/api/Auth/login', credentials);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        return user;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get<User>('/api/Auth/me');
        return response.data;
    },

    // Register new user
    register: async (userData: Omit<User, 'userId' | 'createdAt' | 'lastLoginAt'>) => {
        const response = await api.post<User>('/api/Auth/register', userData);
        return response.data;
    }
}; 