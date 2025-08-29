import React from 'react';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { UserProfile } from '../utils/firebase';

interface NotificationTrigger {
  type: 'message' | 'reaction' | 'forum_post' | 'announcement' | 'assignment' | 'event' | 'study_group' | 'poll' | 'quiz' | 'comment' | 'mention' | 'system';
  title: string;
  message: string;
  data?: any;
  targetUsers?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export class NotificationService {
  private static instance: NotificationService;
  private addNotification: ((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void) | null = null;
  private currentUser: UserProfile | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize(addNotificationFn: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void, user: UserProfile) {
    this.addNotification = addNotificationFn;
    this.currentUser = user;
  }

  // Trigger notification for new messages
  triggerMessageNotification(fromUser: UserProfile, toUser: UserProfile, messagePreview: string) {
    if (!this.addNotification || !this.currentUser) return;
    
    // Only notify if the current user is the recipient
    if (this.currentUser.uid === toUser.uid) {
      this.addNotification({
        title: `💌 New message from ${fromUser.fullName}`,
        message: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
        type: 'info'
      });
    }
  }

  // Trigger notification for forum activities
  triggerForumNotification(type: 'new_post' | 'reply' | 'mention', author: UserProfile, threadTitle: string, content?: string) {
    if (!this.addNotification || !this.currentUser) return;

    const icons = {
      new_post: '📝',
      reply: '💬',
      mention: '🏷️'
    };

    const messages = {
      new_post: `New post in "${threadTitle}"`,
      reply: `${author.fullName} replied to "${threadTitle}"`,
      mention: `${author.fullName} mentioned you in "${threadTitle}"`
    };

    this.addNotification({
      title: `${icons[type]} ${messages[type]}`,
      message: content ? (content.length > 60 ? `${content.substring(0, 60)}...` : content) : '',
      type: type === 'mention' ? 'warning' : 'info'
    });
  }

  // Trigger notification for reactions
  triggerReactionNotification(reactor: UserProfile, emoji: string, contentType: string, contentTitle: string) {
    if (!this.addNotification || !this.currentUser) return;
    
    // Don't notify users about their own reactions
    if (this.currentUser.uid === reactor.uid) return;

    this.addNotification({
      title: `${emoji} ${reactor.fullName} reacted to your ${contentType}`,
      message: `"${contentTitle.length > 40 ? contentTitle.substring(0, 40) + '...' : contentTitle}"`,
      type: 'success'
    });
  }

  // Trigger notification for assignments
  triggerAssignmentNotification(type: 'new' | 'due_soon' | 'graded', assignmentTitle: string, dueDate?: Date, grade?: string) {
    if (!this.addNotification) return;

    const icons = {
      new: '📋',
      due_soon: '⏰',
      graded: '📊'
    };

    const messages = {
      new: `New assignment: "${assignmentTitle}"`,
      due_soon: `Assignment due soon: "${assignmentTitle}"`,
      graded: `Assignment graded: "${assignmentTitle}"`
    };

    let message = '';
    if (type === 'due_soon' && dueDate) {
      const timeLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      message = `Due in ${timeLeft} day${timeLeft === 1 ? '' : 's'}`;
    } else if (type === 'graded' && grade) {
      message = `Grade: ${grade}`;
    }

    this.addNotification({
      title: `${icons[type]} ${messages[type]}`,
      message,
      type: type === 'due_soon' ? 'warning' : type === 'graded' ? 'success' : 'info'
    });
  }

  // Trigger notification for events
  triggerEventNotification(type: 'new' | 'reminder' | 'canceled', eventTitle: string, eventDate?: Date) {
    if (!this.addNotification) return;

    const icons = {
      new: '🎉',
      reminder: '⏰',
      canceled: '❌'
    };

    const messages = {
      new: `New event: "${eventTitle}"`,
      reminder: `Event reminder: "${eventTitle}"`,
      canceled: `Event canceled: "${eventTitle}"`
    };

    let message = '';
    if (eventDate) {
      message = eventDate.toLocaleDateString();
    }

    this.addNotification({
      title: `${icons[type]} ${messages[type]}`,
      message,
      type: type === 'canceled' ? 'error' : type === 'reminder' ? 'warning' : 'info'
    });
  }

  // Trigger notification for study groups
  triggerStudyGroupNotification(type: 'invitation' | 'joined' | 'left' | 'session', groupName: string, user?: UserProfile) {
    if (!this.addNotification) return;

    const icons = {
      invitation: '📨',
      joined: '👥',
      left: '👋',
      session: '📚'
    };

    const messages = {
      invitation: `Invited to join study group: "${groupName}"`,
      joined: `${user?.fullName || 'Someone'} joined study group: "${groupName}"`,
      left: `${user?.fullName || 'Someone'} left study group: "${groupName}"`,
      session: `Study session scheduled for group: "${groupName}"`
    };

    this.addNotification({
      title: `${icons[type]} ${messages[type]}`,
      message: '',
      type: type === 'invitation' ? 'warning' : 'info'
    });
  }

  // Trigger notification for polls and surveys
  triggerPollNotification(type: 'new' | 'results' | 'closing_soon', pollTitle: string, timeLeft?: string) {
    if (!this.addNotification) return;

    const icons = {
      new: '📊',
      results: '📈',
      closing_soon: '⏰'
    };

    const messages = {
      new: `New poll: "${pollTitle}"`,
      results: `Poll results available: "${pollTitle}"`,
      closing_soon: `Poll closing soon: "${pollTitle}"`
    };

    this.addNotification({
      title: `${icons[type]} ${messages[type]}`,
      message: timeLeft || '',
      type: type === 'closing_soon' ? 'warning' : 'info'
    });
  }

  // Trigger notification for system announcements
  triggerSystemNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    if (!this.addNotification) return;

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    this.addNotification({
      title: `${icons[type]} ${title}`,
      message,
      type
    });
  }

  // Trigger notification for quiz activities
  triggerQuizNotification(type: 'new' | 'completed' | 'graded', quizTitle: string, score?: number) {
    if (!this.addNotification) return;

    const icons = {
      new: '🧠',
      completed: '✅',
      graded: '📊'
    };

    const messages = {
      new: `New quiz available: "${quizTitle}"`,
      completed: `Quiz completed: "${quizTitle}"`,
      graded: `Quiz graded: "${quizTitle}"`
    };

    let message = '';
    if (type === 'graded' && score !== undefined) {
      message = `Score: ${score}%`;
    }

    this.addNotification({
      title: `${icons[type]} ${messages[type]}`,
      message,
      type: type === 'graded' ? 'success' : 'info'
    });
  }

  // Trigger notification for mentions in any content
  triggerMentionNotification(mentioner: UserProfile, contentType: string, contentTitle: string, context: string) {
    if (!this.addNotification || !this.currentUser) return;

    // Don't notify users about their own mentions
    if (this.currentUser.uid === mentioner.uid) return;

    this.addNotification({
      title: `🏷️ ${mentioner.fullName} mentioned you`,
      message: `In ${contentType}: "${contentTitle}"${context ? ` - ${context}` : ''}`,
      type: 'warning'
    });
  }

  // Trigger notification for general activities
  triggerActivityNotification(activity: NotificationTrigger) {
    if (!this.addNotification) return;

    const typeIcons = {
      message: '💌',
      reaction: '😊',
      forum_post: '📝',
      announcement: '📢',
      assignment: '📋',
      event: '🎉',
      study_group: '👥',
      poll: '📊',
      quiz: '🧠',
      comment: '💬',
      mention: '🏷️',
      system: 'ℹ️'
    };

    this.addNotification({
      title: `${typeIcons[activity.type]} ${activity.title}`,
      message: activity.message,
      type: activity.priority === 'high' ? 'warning' : activity.priority === 'low' ? 'info' : 'info'
    });
  }

  // Auto-trigger notifications based on time-sensitive events
  startAutoNotifications() {
    // Check for upcoming assignments, events, etc. every hour
    const checkInterval = setInterval(() => {
      this.checkUpcomingDeadlines();
    }, 60 * 60 * 1000); // 1 hour

    // Clean up function
    return () => clearInterval(checkInterval);
  }

  private checkUpcomingDeadlines() {
    // This would integrate with your data to check for upcoming deadlines
    // Implementation depends on how your assignment/event data is structured
    console.log('Checking for upcoming deadlines...');
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Hook to integrate with React components
export const useNotificationService = () => {
  const { addNotification } = useNotifications();
  
  React.useEffect(() => {
    // Initialize the service when the hook is used
    // Note: You'll need to pass the current user from your auth context
  }, [addNotification]);

  return {
    triggerMessageNotification: notificationService.triggerMessageNotification.bind(notificationService),
    triggerForumNotification: notificationService.triggerForumNotification.bind(notificationService),
    triggerReactionNotification: notificationService.triggerReactionNotification.bind(notificationService),
    triggerAssignmentNotification: notificationService.triggerAssignmentNotification.bind(notificationService),
    triggerEventNotification: notificationService.triggerEventNotification.bind(notificationService),
    triggerStudyGroupNotification: notificationService.triggerStudyGroupNotification.bind(notificationService),
    triggerPollNotification: notificationService.triggerPollNotification.bind(notificationService),
    triggerSystemNotification: notificationService.triggerSystemNotification.bind(notificationService),
    triggerQuizNotification: notificationService.triggerQuizNotification.bind(notificationService),
    triggerMentionNotification: notificationService.triggerMentionNotification.bind(notificationService),
    triggerActivityNotification: notificationService.triggerActivityNotification.bind(notificationService)
  };
};