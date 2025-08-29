import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useNotifications } from '../hooks/useNotifications';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  department?: string;
  year?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'blocked';
  initiatedBy: string;
  createdAt: Date;
  acceptedAt?: Date;
}

interface SocialFeaturesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialFeatures: React.FC<SocialFeaturesProps> = ({ isOpen, onClose }) => {
  const { user } = useFirebaseAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'discover' | 'following' | 'followers' | 'requests'>('discover');
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSocialData();
    }
  }, [isOpen, user, activeTab]);

  const loadSocialData = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Adebayo Olakunle',
          email: 'adebayo.o@student.lautech.edu.ng',
          profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          department: 'Economics',
          year: '2025',
          bio: 'Economics student passionate about financial markets and development economics.',
          isOnline: true
        },
        {
          id: '2',
          name: 'Fatima Ibrahim',
          email: 'fatima.i@student.lautech.edu.ng',
          profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b2f5?w=100&h=100&fit=crop&crop=face',
          department: 'Economics',
          year: '2025',
          bio: 'Interested in behavioral economics and data analysis.',
          isOnline: false,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: '3',
          name: 'Chukwuma Nwosu',
          email: 'chukwuma.n@student.lautech.edu.ng',
          profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          department: 'Economics',
          year: '2025',
          bio: 'Future economist and entrepreneur. Love discussing macroeconomic policies.',
          isOnline: true
        }
      ];

      const mockConnections: Connection[] = [
        {
          id: '1',
          userId: user.uid,
          connectedUserId: '2',
          status: 'accepted',
          initiatedBy: user.uid,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        }
      ];

      setUsers(mockUsers);
      setConnections(mockConnections);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendConnectionRequest = async (targetUserId: string) => {
    try {
      const newConnection: Connection = {
        id: Date.now().toString(),
        userId: user?.uid || '',
        connectedUserId: targetUserId,
        status: 'pending',
        initiatedBy: user?.uid || '',
        createdAt: new Date()
      };

      setConnections(prev => [...prev, newConnection]);

      addNotification({
        title: 'Connection Request Sent',
        message: 'Your connection request has been sent successfully.',
        type: 'success'
      });

      // In a real app, you would also send a notification to the target user
    } catch (error) {
      console.error('Error sending connection request:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to send connection request. Please try again.',
        type: 'error'
      });
    }
  };

  const acceptConnectionRequest = async (connectionId: string) => {
    try {
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: 'accepted' as const, acceptedAt: new Date() }
            : conn
        )
      );

      addNotification({
        title: 'Connection Accepted',
        message: 'You are now connected!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error accepting connection request:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to accept connection request. Please try again.',
        type: 'error'
      });
    }
  };

  const rejectConnectionRequest = async (connectionId: string) => {
    try {
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));

      addNotification({
        title: 'Connection Rejected',
        message: 'Connection request has been rejected.',
        type: 'info'
      });
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to reject connection request. Please try again.',
        type: 'error'
      });
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));

      addNotification({
        title: 'Connection Removed',
        message: 'You are no longer connected with this user.',
        type: 'info'
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to remove connection. Please try again.',
        type: 'error'
      });
    }
  };

  const getConnectionStatus = (userId: string): 'none' | 'pending_sent' | 'pending_received' | 'connected' => {
    const connection = connections.find(conn => 
      (conn.userId === user?.uid && conn.connectedUserId === userId) ||
      (conn.connectedUserId === user?.uid && conn.userId === userId)
    );

    if (!connection) return 'none';
    if (connection.status === 'accepted') return 'connected';
    if (connection.initiatedBy === user?.uid) return 'pending_sent';
    return 'pending_received';
  };

  const filteredUsers = users.filter(u => 
    u.id !== user?.uid && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.department?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTabUsers = () => {
    switch (activeTab) {
      case 'discover':
        return filteredUsers;
      case 'following':
        return users.filter(u => {
          const conn = connections.find(c => 
            c.status === 'accepted' && 
            ((c.userId === user?.uid && c.connectedUserId === u.id) ||
             (c.connectedUserId === user?.uid && c.userId === u.id))
          );
          return conn !== undefined;
        });
      case 'followers':
        return users.filter(u => {
          const conn = connections.find(c => 
            c.status === 'accepted' && 
            c.connectedUserId === user?.uid && 
            c.userId === u.id
          );
          return conn !== undefined;
        });
      case 'requests':
        return users.filter(u => {
          const conn = connections.find(c => 
            c.status === 'pending' && 
            c.connectedUserId === user?.uid && 
            c.userId === u.id
          );
          return conn !== undefined;
        });
      default:
        return [];
    }
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="social-features-modal">
        <div className="modal-header">
          <h2>👥 Connect & Network</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="social-tabs">
            <button 
              className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
            >
              🔍 Discover
            </button>
            <button 
              className={`tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              👥 Following
            </button>
            <button 
              className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              🫂 Followers
            </button>
            <button 
              className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              📥 Requests
              {connections.filter(c => c.status === 'pending' && c.connectedUserId === user?.uid).length > 0 && (
                <span className="notification-badge">
                  {connections.filter(c => c.status === 'pending' && c.connectedUserId === user?.uid).length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'discover' && (
            <div className="search-section">
              <div className="search-input">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search classmates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="users-list">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <p>Loading...</p>
              </div>
            ) : getTabUsers().length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {activeTab === 'discover' && '🔍'}
                  {activeTab === 'following' && '👥'}
                  {activeTab === 'followers' && '🫂'}
                  {activeTab === 'requests' && '📥'}
                </div>
                <h3>
                  {activeTab === 'discover' && 'No users found'}
                  {activeTab === 'following' && 'Not following anyone yet'}
                  {activeTab === 'followers' && 'No followers yet'}
                  {activeTab === 'requests' && 'No pending requests'}
                </h3>
                <p>
                  {activeTab === 'discover' && 'Try adjusting your search terms.'}
                  {activeTab === 'following' && 'Start connecting with your classmates!'}
                  {activeTab === 'followers' && 'Share your profile to attract followers.'}
                  {activeTab === 'requests' && 'Connection requests will appear here.'}
                </p>
              </div>
            ) : (
              getTabUsers().map(user => {
                const connectionStatus = getConnectionStatus(user.id);
                const pendingConnection = connections.find(c => 
                  c.status === 'pending' && 
                  ((c.userId === user.id && c.connectedUserId === user?.uid) ||
                   (c.connectedUserId === user.id && c.userId === user?.uid))
                );

                return (
                  <div key={user.id} className="user-card">
                    <div className="user-avatar">
                      <img src={user.profilePicture || '/default-avatar.png'} alt={user.name} />
                      <div className={`online-indicator ${user.isOnline ? 'online' : 'offline'}`} />
                    </div>
                    
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p className="user-email">{user.email}</p>
                      {user.department && user.year && (
                        <p className="user-details">{user.department} • Class of {user.year}</p>
                      )}
                      {user.bio && (
                        <p className="user-bio">{user.bio}</p>
                      )}
                      <div className="user-status">
                        {user.isOnline ? (
                          <span className="status-online">🟢 Online</span>
                        ) : (
                          <span className="status-offline">
                            ⭕ Last seen {user.lastSeen ? formatLastSeen(user.lastSeen) : 'unknown'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="user-actions">
                      {activeTab === 'requests' && connectionStatus === 'pending_received' && (
                        <div className="request-actions">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => acceptConnectionRequest(pendingConnection!.id)}
                          >
                            ✅ Accept
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => rejectConnectionRequest(pendingConnection!.id)}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}

                      {activeTab !== 'requests' && (
                        <>
                          {connectionStatus === 'none' && (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => sendConnectionRequest(user.id)}
                            >
                              ➕ Connect
                            </button>
                          )}

                          {connectionStatus === 'pending_sent' && (
                            <button className="btn btn-secondary btn-sm" disabled>
                              ⏳ Pending
                            </button>
                          )}

                          {connectionStatus === 'connected' && (
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                const conn = connections.find(c => 
                                  c.status === 'accepted' && 
                                  ((c.userId === user?.uid && c.connectedUserId === user.id) ||
                                   (c.connectedUserId === user?.uid && c.userId === user.id))
                                );
                                if (conn) removeConnection(conn.id);
                              }}
                            >
                              ✅ Connected
                            </button>
                          )}

                          <button className="btn btn-outline btn-sm">
                            💬 Message
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};