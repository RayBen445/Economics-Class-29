import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, getAllUsers, updateDocument } from '../utils/firebase';
import { Route } from '../types';

interface ForumPost {
  id: string;
  content: string;
  authorId: string;
  threadId: string;
  timestamp: number;
  likes: string[];
}

interface ForumThread {
  id: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  timestamp: number;
  postCount: number;
  lastActivityTime: number;
  isPinned: boolean;
  tags: string[];
}

interface ForumsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const ForumsPage: React.FC<ForumsPageProps> = ({ profile, setRoute }) => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPost, setNewPost] = useState('');
  const [newThread, setNewThread] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: ''
  });

  const categories = [
    { value: 'general', label: 'General Discussion' },
    { value: 'academic', label: 'Academic Help' },
    { value: 'economics', label: 'Economics Discussion' },
    { value: 'assignments', label: 'Assignment Help' },
    { value: 'events', label: 'Events & Announcements' },
    { value: 'resources', label: 'Study Resources' },
    { value: 'career', label: 'Career & Opportunities' }
  ];

  useEffect(() => {
    loadForumData();
  }, []);

  const loadForumData = async () => {
    try {
      setLoading(true);
      const [threadsData, postsData, usersData] = await Promise.all([
        getCollection('forumThreads', 'timestamp'),
        getCollection('forumPosts', 'timestamp'),
        getAllUsers()
      ]);
      
      setThreads(threadsData);
      setPosts(postsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThread.title || !newThread.description) return;

    try {
      await addDocument('forumThreads', {
        ...newThread,
        authorId: profile.uid,
        postCount: 0,
        lastActivityTime: Date.now(),
        isPinned: false,
        tags: newThread.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      });
      
      setNewThread({ title: '', description: '', category: 'general', tags: '' });
      setShowNewThreadForm(false);
      await loadForumData();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !selectedThread) return;

    try {
      await addDocument('forumPosts', {
        content: newPost.trim(),
        authorId: profile.uid,
        threadId: selectedThread.id,
        likes: []
      });

      // Update thread's last activity time and post count
      await updateDocument('forumThreads', selectedThread.id, {
        lastActivityTime: Date.now(),
        postCount: (selectedThread.postCount || 0) + 1
      });
      
      setNewPost('');
      await loadForumData();
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const getFilteredThreads = () => {
    let filtered = threads;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(thread => thread.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(thread => 
        thread.title.toLowerCase().includes(term) ||
        thread.description.toLowerCase().includes(term) ||
        thread.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastActivityTime - a.lastActivityTime;
    });
  };

  const getThreadPosts = (threadId: string) => {
    return posts
      .filter(post => post.threadId === threadId)
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.uid === userId);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      general: '💬',
      academic: '📚',
      economics: '📈',
      assignments: '📝',
      events: '🎉',
      resources: '📑',
      career: '💼'
    };
    return icons[category] || '💬';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading forums...</p>
        </div>
      </div>
    );
  }

  if (selectedThread) {
    const threadPosts = getThreadPosts(selectedThread.id);
    const threadAuthor = getUserById(selectedThread.authorId);

    return (
      <div className="page">
        <div className="page-header">
          <button 
            onClick={() => setSelectedThread(null)}
            className="btn-secondary"
          >
            ← Back to Forums
          </button>
          <h2>{selectedThread.title}</h2>
        </div>

        <div className="thread-header">
          <div className="thread-meta">
            <span className="thread-category">
              {getCategoryIcon(selectedThread.category)} {categories.find(c => c.value === selectedThread.category)?.label}
            </span>
            <span className="thread-author">by {threadAuthor?.fullName}</span>
            <span className="thread-time">{formatTimeAgo(selectedThread.timestamp)}</span>
          </div>
          <p className="thread-description">{selectedThread.description}</p>
          {selectedThread.tags.length > 0 && (
            <div className="thread-tags">
              {selectedThread.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="posts-container">
          {threadPosts.map((post) => {
            const postAuthor = getUserById(post.authorId);
            return (
              <div key={post.id} className="forum-post">
                <div className="post-author">
                  <div className="author-avatar">
                    {postAuthor?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{postAuthor?.fullName}</div>
                    <div className="author-role">{postAuthor?.role}</div>
                    <div className="post-time">{formatTimeAgo(post.timestamp)}</div>
                  </div>
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form className="reply-form" onSubmit={handleAddPost}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write your reply..."
            rows={4}
            required
          />
          <button type="submit" className="btn-primary">
            Post Reply
          </button>
        </form>
      </div>
    );
  }

  const filteredThreads = getFilteredThreads();

  return (
    <div className="page">
      <div className="page-header">
        <h2>💬 Forums</h2>
        <p className="page-description">Engage in academic discussions and community conversations.</p>
      </div>

      <div className="forum-controls">
        <div className="forum-filters">
          <input
            type="text"
            placeholder="Search threads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setShowNewThreadForm(true)}
          className="btn-primary"
        >
          + New Thread
        </button>
      </div>

      <div className="forum-stats">
        <div className="stat-item">
          <span className="stat-label">Total Threads</span>
          <span className="stat-value">{threads.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Posts</span>
          <span className="stat-value">{posts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Users</span>
          <span className="stat-value">{users.length}</span>
        </div>
      </div>

      {filteredThreads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No threads found</h3>
          <p>Be the first to start a discussion or adjust your search filters.</p>
          <button onClick={() => setShowNewThreadForm(true)} className="btn-primary">
            Create First Thread
          </button>
        </div>
      ) : (
        <div className="threads-list">
          {filteredThreads.map((thread) => {
            const author = getUserById(thread.authorId);
            return (
              <div 
                key={thread.id} 
                className={`thread-card ${thread.isPinned ? 'pinned' : ''}`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="thread-main">
                  <div className="thread-title">
                    {thread.isPinned && <span className="pin-icon">📌</span>}
                    {thread.title}
                  </div>
                  <div className="thread-info">
                    <span className="thread-category">
                      {getCategoryIcon(thread.category)} {categories.find(c => c.value === thread.category)?.label}
                    </span>
                    <span className="thread-author">by {author?.fullName}</span>
                    <span className="thread-stats">{thread.postCount || 0} replies</span>
                  </div>
                  <p className="thread-preview">{thread.description}</p>
                  {thread.tags.length > 0 && (
                    <div className="thread-tags">
                      {thread.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                      {thread.tags.length > 3 && <span className="tag">+{thread.tags.length - 3} more</span>}
                    </div>
                  )}
                </div>
                <div className="thread-activity">
                  <div className="last-activity">{formatTimeAgo(thread.lastActivityTime)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNewThreadForm && (
        <div className="modal-overlay" onClick={() => setShowNewThreadForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Thread</h3>
            <form onSubmit={handleCreateThread}>
              <div className="form-group">
                <label>Thread Title</label>
                <input
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  placeholder="Enter thread title..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newThread.category}
                  onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newThread.description}
                  onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                  placeholder="Describe your topic..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newThread.tags}
                  onChange={(e) => setNewThread({ ...newThread, tags: e.target.value })}
                  placeholder="economics, study, help"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowNewThreadForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};