import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'message' | 'forum' | 'reaction' | 'academic' | 'event' | 'study_group' | 'poll' | 'announcement' | 'support' | 'social' | 'system';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionData?: {
    type: 'navigate' | 'modal' | 'external';
    payload: any;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  relatedUserId?: string;
  relatedUserName?: string;
  relatedUserAvatar?: string;
  icon?: string;
}

interface NotificationServiceConfig {
  enableRealTime: boolean;
  enablePush: boolean;
  enableEmail: boolean;
  enableTelegram: boolean;
  categories: {
    [key in Notification['category']]: {
      enabled: boolean;
      realTime: boolean;
      push: boolean;
      email: boolean;
    };
  };
}

interface NotificationContextType {
  notifications: Notification[];
  config: NotificationServiceConfig;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  clearCategory: (category: Notification['category']) => void;
  unreadCount: number;
  getUnreadByCategory: (category: Notification['category']) => number;
  updateConfig: (newConfig: Partial<NotificationServiceConfig>) => void;
  triggerSystemNotification: (activity: ActivityType, data: any) => void;
}

type ActivityType = 
  | 'message_received' | 'message_sent'
  | 'forum_post_created' | 'forum_reply_added' | 'forum_mention'
  | 'reaction_added' | 'reaction_removed'
  | 'assignment_due' | 'grade_updated' | 'course_updated'
  | 'event_created' | 'event_reminder' | 'event_cancelled'
  | 'study_group_invitation' | 'study_group_joined' | 'study_group_session'
  | 'poll_created' | 'poll_closing' | 'poll_results'
  | 'announcement_posted'
  | 'connection_request' | 'connection_accepted'
  | 'support_response';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useFirebaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<NotificationServiceConfig>({
    enableRealTime: true,
    enablePush: true,
    enableEmail: false,
    enableTelegram: false,
    categories: {
      message: { enabled: true, realTime: true, push: true, email: false },
      forum: { enabled: true, realTime: true, push: true, email: false },
      reaction: { enabled: true, realTime: true, push: false, email: false },
      academic: { enabled: true, realTime: true, push: true, email: true },
      event: { enabled: true, realTime: true, push: true, email: false },
      study_group: { enabled: true, realTime: true, push: true, email: false },
      poll: { enabled: true, realTime: true, push: false, email: false },
      announcement: { enabled: true, realTime: true, push: true, email: true },
      support: { enabled: true, realTime: true, push: true, email: true },
      social: { enabled: true, realTime: true, push: false, email: false },
      system: { enabled: true, realTime: true, push: true, email: false }
    }
  });

  // Load saved config and notifications from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('notification-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications && user) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    }
  }, [user]);

  // Save notifications to localStorage
  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications, user]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      priority: notificationData.priority || 'medium',
      category: notificationData.category || 'system',
    };
    
    // Check if this category is enabled
    if (!config.categories[notification.category]?.enabled) {
      return;
    }

    setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Keep max 100 notifications

    // Trigger browser notification if enabled and supported
    if (config.enablePush && config.categories[notification.category]?.push && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }
    }
  }, [config]);

  const triggerSystemNotification = useCallback((activity: ActivityType, data: any) => {
    const activityNotifications: Record<ActivityType, (data: any) => Partial<Notification>> = {
      message_received: (data) => ({
        title: '💌 New Message',
        message: `${data.senderName} sent you a message`,
        type: 'info',
        category: 'message',
        priority: 'medium',
        relatedUserId: data.senderId,
        relatedUserName: data.senderName,
        relatedUserAvatar: data.senderAvatar,
        icon: '💌'
      }),
      message_sent: (data) => ({
        title: '✅ Message Sent',
        message: `Your message to ${data.recipientName} was delivered`,
        type: 'success',
        category: 'message',
        priority: 'low',
        icon: '✅'
      }),
      forum_post_created: (data) => ({
        title: '📝 New Forum Post',
        message: `${data.authorName} posted in ${data.categoryName}`,
        type: 'info',
        category: 'forum',
        priority: 'medium',
        relatedUserId: data.authorId,
        relatedUserName: data.authorName,
        icon: '📝'
      }),
      forum_reply_added: (data) => ({
        title: '💬 New Reply',
        message: `${data.authorName} replied to "${data.postTitle}"`,
        type: 'info',
        category: 'forum',
        priority: 'medium',
        relatedUserId: data.authorId,
        relatedUserName: data.authorName,
        icon: '💬'
      }),
      forum_mention: (data) => ({
        title: '📢 You were mentioned',
        message: `${data.authorName} mentioned you in a forum post`,
        type: 'info',
        category: 'forum',
        priority: 'high',
        relatedUserId: data.authorId,
        relatedUserName: data.authorName,
        icon: '📢'
      }),
      reaction_added: (data) => ({
        title: `${data.emoji} New Reaction`,
        message: `${data.userName} reacted to your ${data.contentType}`,
        type: 'info',
        category: 'reaction',
        priority: 'low',
        relatedUserId: data.userId,
        relatedUserName: data.userName,
        icon: data.emoji
      }),
      reaction_removed: (data) => ({
        title: '↩️ Reaction Removed',
        message: `${data.userName} removed their reaction`,
        type: 'info',
        category: 'reaction',
        priority: 'low',
        icon: '↩️'
      }),
      assignment_due: (data) => ({
        title: '📚 Assignment Due Soon',
        message: `"${data.assignmentTitle}" is due ${data.dueIn}`,
        type: 'warning',
        category: 'academic',
        priority: 'high',
        icon: '📚'
      }),
      grade_updated: (data) => ({
        title: '📊 Grade Updated',
        message: `Your grade for "${data.assignmentTitle}" has been updated`,
        type: 'info',
        category: 'academic',
        priority: 'medium',
        icon: '📊'
      }),
      course_updated: (data) => ({
        title: '📖 Course Updated',
        message: `"${data.courseName}" has new updates`,
        type: 'info',
        category: 'academic',
        priority: 'medium',
        icon: '📖'
      }),
      event_created: (data) => ({
        title: '🎉 New Event',
        message: `"${data.eventTitle}" has been scheduled`,
        type: 'info',
        category: 'event',
        priority: 'medium',
        icon: '🎉'
      }),
      event_reminder: (data) => ({
        title: '⏰ Event Reminder',
        message: `"${data.eventTitle}" starts ${data.startsIn}`,
        type: 'warning',
        category: 'event',
        priority: 'high',
        icon: '⏰'
      }),
      event_cancelled: (data) => ({
        title: '❌ Event Cancelled',
        message: `"${data.eventTitle}" has been cancelled`,
        type: 'error',
        category: 'event',
        priority: 'high',
        icon: '❌'
      }),
      study_group_invitation: (data) => ({
        title: '👥 Study Group Invitation',
        message: `You've been invited to join "${data.groupName}"`,
        type: 'info',
        category: 'study_group',
        priority: 'medium',
        relatedUserId: data.inviterId,
        relatedUserName: data.inviterName,
        icon: '👥'
      }),
      study_group_joined: (data) => ({
        title: '🎊 New Group Member',
        message: `${data.memberName} joined "${data.groupName}"`,
        type: 'success',
        category: 'study_group',
        priority: 'low',
        icon: '🎊'
      }),
      study_group_session: (data) => ({
        title: '📚 Study Session Starting',
        message: `"${data.sessionTitle}" starts ${data.startsIn}`,
        type: 'warning',
        category: 'study_group',
        priority: 'high',
        icon: '📚'
      }),
      poll_created: (data) => ({
        title: '🗳️ New Poll',
        message: `"${data.pollTitle}" is now open for voting`,
        type: 'info',
        category: 'poll',
        priority: 'medium',
        icon: '🗳️'
      }),
      poll_closing: (data) => ({
        title: '⏳ Poll Closing Soon',
        message: `"${data.pollTitle}" closes ${data.closesIn}`,
        type: 'warning',
        category: 'poll',
        priority: 'medium',
        icon: '⏳'
      }),
      poll_results: (data) => ({
        title: '📊 Poll Results Available',
        message: `Results for "${data.pollTitle}" are now available`,
        type: 'info',
        category: 'poll',
        priority: 'low',
        icon: '📊'
      }),
      announcement_posted: (data) => ({
        title: '📢 New Announcement',
        message: data.title,
        type: 'info',
        category: 'announcement',
        priority: 'high',
        icon: '📢'
      }),
      connection_request: (data) => ({
        title: '🤝 Connection Request',
        message: `${data.requesterName} wants to connect with you`,
        type: 'info',
        category: 'social',
        priority: 'medium',
        relatedUserId: data.requesterId,
        relatedUserName: data.requesterName,
        relatedUserAvatar: data.requesterAvatar,
        icon: '🤝'
      }),
      connection_accepted: (data) => ({
        title: '✅ Connection Accepted',
        message: `${data.accepterName} accepted your connection request`,
        type: 'success',
        category: 'social',
        priority: 'medium',
        relatedUserId: data.accepterId,
        relatedUserName: data.accepterName,
        icon: '✅'
      }),
      support_response: (data) => ({
        title: '🎧 Support Response',
        message: `Your support request has been updated`,
        type: 'info',
        category: 'support',
        priority: 'high',
        icon: '🎧'
      })
    };

    const notificationTemplate = activityNotifications[activity];
    if (notificationTemplate) {
      const notificationData = notificationTemplate(data);
      addNotification(notificationData as Omit<Notification, 'id' | 'timestamp' | 'read'>);
    }
  }, [addNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  }, []);

  const clearCategory = useCallback((category: Notification['category']) => {
    setNotifications(prev => prev.filter(notification => notification.category !== category));
  }, []);

  const getUnreadByCategory = useCallback((category: Notification['category']) => {
    return notifications.filter(n => !n.read && n.category === category).length;
  }, [notifications]);

  const updateConfig = useCallback((newConfig: Partial<NotificationServiceConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('notification-config', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Request notification permission on mount
  useEffect(() => {
    if (config.enablePush && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [config.enablePush]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        config,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        clearCategory,
        unreadCount,
        getUnreadByCategory,
        updateConfig,
        triggerSystemNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};