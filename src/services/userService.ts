import api from './api';

export interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
  passwordHash?: string; // Optional for creation
  password?: string; // Only for creation
  status: string;
  lastLoginAt: Date;
  createdAt: Date;
  isActive: boolean;
  organizationProfileId: number;
}

export interface ChangePasswordRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  user: {
    userId: number;
    username: string;
    email: string;
    role: string;
  };
}

export const userService = {
   getAllUsers: async () => {
    const response = await api.get<User[]>('/api/user');
    return response.data;
  },

  createUser: async (user: Omit<User, 'userId' | 'createdAt' | 'lastLoginAt' | 'passwordHash'> & { password: string }) => {
    const response = await api.post<User>('/api/user', user);
    return response.data;
  },

  updateUser: async (userId: number, user: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/api/user/${userId}`, user);
    return response.data;
  },

  deleteUser: async (userId: number) => {
    await api.delete(`/api/user/${userId}`);
  },

  changePassword: async (passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await api.put<ChangePasswordResponse>('/api/auth/change-password', passwordData);
    return response.data;
  }
}

