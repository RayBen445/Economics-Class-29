import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, addDocument, getCollection, getAllUsers, updateDocument } from '../utils/firebase';
import { Route } from '../types';

interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  read: boolean;
}

interface Conversation {
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

interface MessagesPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ profile, setRoute }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      updateConversations();
    }
  }, [messages, users]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, messages]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesData, usersData] = await Promise.all([
        getCollection('messages', 'timestamp'),
        getAllUsers()
      ]);
      
      const userMessages = messagesData.filter((msg: any) => 
        msg.from === profile.uid || msg.to === profile.uid
      );
      
      setMessages(userMessages);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConversations = () => {
    const conversationMap = new Map<string, Conversation>();

    messages.forEach((message: Message) => {
      const otherId = message.from === profile.uid ? message.to : message.from;
      const otherUser = users.find(u => u.uid === otherId);
      
      if (!otherUser) return;

      const existing = conversationMap.get(otherId);
      const isUnread = message.to === profile.uid && !message.read;

      if (!existing || message.timestamp > existing.lastMessageTime) {
        conversationMap.set(otherId, {
          participantId: otherId,
          participantName: otherUser.fullName,
          lastMessage: message.text,
          lastMessageTime: message.timestamp,
          unreadCount: existing ? existing.unreadCount + (isUnread ? 1 : 0) : (isUnread ? 1 : 0)
        });
      } else if (isUnread) {
        existing.unreadCount++;
      }
    });

    const sortedConversations = Array.from(conversationMap.values())
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    setConversations(sortedConversations);
  };

  const getConversationMessages = (participantId: string): Message[] => {
    return messages
      .filter(msg => 
        (msg.from === profile.uid && msg.to === participantId) ||
        (msg.from === participantId && msg.to === profile.uid)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await addDocument('messages', {
        from: profile.uid,
        to: selectedConversation,
        text: newMessage.trim(),
        timestamp: Date.now(),
        read: false
      });

      setNewMessage('');
      await loadData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDocument('messages', messageId, { read: true });
      await loadData();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const startNewConversation = (userId: string) => {
    setSelectedConversation(userId);
    setShowNewChat(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  const selectedUser = users.find(u => u.uid === selectedConversation);
  const conversationMessages = selectedConversation ? getConversationMessages(selectedConversation) : [];

  return (
    <div className="page messages-page">
      <div className="page-header">
        <h2>💌 Messages</h2>
        <p className="page-description">Send and receive private messages.</p>
      </div>

      <div className="messages-container">
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h3>Conversations</h3>
            <button onClick={() => setShowNewChat(true)} className="btn-primary btn-sm">
              + New
            </button>
          </div>

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="empty-conversations">
                <p>No conversations yet</p>
                <button onClick={() => setShowNewChat(true)} className="btn-secondary">
                  Start a conversation
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.participantId}
                  className={`conversation-item ${selectedConversation === conv.participantId ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv.participantId)}
                >
                  <div className="conversation-avatar">
                    {conv.participantName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.participantName}</div>
                    <div className="conversation-preview">{conv.lastMessage}</div>
                    <div className="conversation-time">{formatTime(conv.lastMessageTime)}</div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="unread-badge">{conv.unreadCount}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedUser?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3>{selectedUser?.fullName}</h3>
                    <p>@{selectedUser?.username}</p>
                  </div>
                </div>
              </div>

              <div className="messages-list">
                {conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.from === profile.uid ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {message.from === profile.uid && (
                          <span className={`read-status ${message.read ? 'read' : 'unread'}`}>
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <div className="empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar or start a new one.</p>
            </div>
          )}
        </div>
      </div>

      {showNewChat && (
        <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Start New Conversation</h3>
            <div className="users-list">
              {users
                .filter(user => user.uid !== profile.uid)
                .map((user) => (
                  <div
                    key={user.uid}
                    className="user-item"
                    onClick={() => startNewConversation(user.uid)}
                  >
                    <div className="user-avatar">
                      {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.fullName}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                ))}
            </div>
            <button onClick={() => setShowNewChat(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};