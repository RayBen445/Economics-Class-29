import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'message': return '💌';
      case 'reaction': return '😊';
      case 'forum': return '📝';
      case 'assignment': return '📋';
      case 'event': return '🎉';
      case 'study_group': return '👥';
      case 'poll': return '📊';
      case 'quiz': return '🧠';
      case 'mention': return '🏷️';
      case 'system': return '⚙️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="notification-container">
      <button
        className="notification-bell"
        onClick={toggleNotifications}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {formatTimeAgo(notification.timestamp)}
                      </div>
                    </div>
                    <button
                      className="notification-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      title="Remove notification"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 10 && (
              <div className="notification-footer">
                <p>Showing latest 10 notifications</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};