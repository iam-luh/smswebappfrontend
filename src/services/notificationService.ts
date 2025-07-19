import api from './api';

export interface Notification {
  id: number;
  userId?: number; // Optional since backend extracts from token
  title: string;
  message: string;
  type: 'low_stock' | 'out_of_stock' | 'stock_addition' | 'inventory_adjustment' | 'sale_recorded' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  relatedEntityType?: string; // 'product', 'sale', 'stock', 'adjustment'
  relatedEntityId?: number;
  actionUrl?: string;
  readAt?: string;
  expiresAt?: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type?: 'low_stock' | 'out_of_stock' | 'stock_addition' | 'inventory_adjustment' | 'sale_recorded' | 'general';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  expiresAt?: string;
}

export const notificationService = {
  // Get all notifications for current user
  getAllNotifications: async () => {
    const response = await api.get<{ notifications: Notification[]; pagination: Record<string, unknown> }>('/api/notifications');
    return response.data.notifications || [];
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>('/api/notifications/unread-count');
    return response.data.count;
  },

  // Mark notification as read
  markAsRead: async (notificationId: number) => {
    const response = await api.put<Notification>(`/api/notifications/${notificationId}/mark-read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/api/notifications/mark-all-read');
    return response.data;
  },

  // Create a new notification (backend extracts userId from auth token)
  createNotification: async (notification: CreateNotificationRequest) => {
    const response = await api.post<Notification>('/api/notifications', notification);
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (notificationId: number) => {
    await api.delete(`/api/notifications/${notificationId}`);
  }
};
