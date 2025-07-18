
import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { notificationService, Notification } from "../../services/notificationService";
import { ActivityLogger } from "../../services/activityLogger";
import { toast } from "sonner";

const NotificationsDropdown: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    } else {
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
      // Note: Low stock checking is handled by the backend automatically
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = (await notificationService.getAllNotifications()).reverse();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected notifications to be an array, received:', typeof data, data);
        setNotifications([]);
        setUnreadCount(0);
        toast.error('Invalid notification data received');
        return;
      }
      
      setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Note: Activity logging for notification read is handled by backend
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      if (!notifications.find(n => n.id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'sale_recorded':
      case 'stock_addition':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'out_of_stock':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'inventory_adjustment':
        return <div className="w-2 h-2 bg-purple-500 rounded-full"></div>;
      case 'general':
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'sale_recorded': return 'Sale';
      case 'stock_addition': return 'Stock Added';
      case 'inventory_adjustment': return 'Adjustment';
      case 'general': return 'Info';
      default: return 'Info';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              notification.type === 'low_stock'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : notification.type === 'out_of_stock'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : notification.type === 'sale_recorded' || notification.type === 'stock_addition'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : notification.type === 'inventory_adjustment'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {getNotificationTypeLabel(notification.type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Mark as read"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete notification"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
