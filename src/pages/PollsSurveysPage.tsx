import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface PollOption {
  text: string;
  votes: string[];
}

interface Poll {
  id: string;
  question: string;
  description: string;
  options: PollOption[];
  createdBy: string;
  timestamp: number;
  expiresAt?: number;
  isAnonymous: boolean;
  allowMultiple: boolean;
  category: string;
}

interface PollsSurveysPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const PollsSurveysPage: React.FC<PollsSurveysPageProps> = ({ profile, setRoute }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newPoll, setNewPoll] = useState({
    question: '',
    description: '',
    options: ['', ''],
    expiresIn: '',
    isAnonymous: false,
    allowMultiple: false,
    category: 'general'
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic' },
    { value: 'events', label: 'Events' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'elections', label: 'Elections' }
  ];

  useEffect(() => {
    loadPollData();
  }, []);

  const loadPollData = async () => {
    try {
      setLoading(true);
      const [pollsData, usersData] = await Promise.all([
        getCollection('polls', 'timestamp'),
        getAllUsers()
      ]);
      
      setPolls(pollsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoll.question || newPoll.options.filter(opt => opt.trim()).length < 2) return;

    try {
      const expiresAt = newPoll.expiresIn ? 
        Date.now() + (parseInt(newPoll.expiresIn) * 24 * 60 * 60 * 1000) : 
        undefined;

      await addDocument('polls', {
        question: newPoll.question,
        description: newPoll.description,
        options: newPoll.options
          .filter(opt => opt.trim())
          .map(text => ({ text: text.trim(), votes: [] })),
        createdBy: profile.uid,
        expiresAt,
        isAnonymous: newPoll.isAnonymous,
        allowMultiple: newPoll.allowMultiple,
        category: newPoll.category
      });
      
      setNewPoll({
        question: '',
        description: '',
        options: ['', ''],
        expiresIn: '',
        isAnonymous: false,
        allowMultiple: false,
        category: 'general'
      });
      setShowCreateForm(false);
      await loadPollData();
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    try {
      const updatedOptions = [...poll.options];
      const option = updatedOptions[optionIndex];
      
      // Check if user already voted
      const hasVoted = poll.options.some(opt => opt.votes.includes(profile.uid));
      
      if (hasVoted && !poll.allowMultiple) {
        // Remove previous vote if not allowing multiple
        updatedOptions.forEach(opt => {
          opt.votes = opt.votes.filter(vote => vote !== profile.uid);
        });
      }
      
      // Add new vote
      if (!option.votes.includes(profile.uid)) {
        option.votes.push(profile.uid);
      } else if (poll.allowMultiple) {
        // Remove vote if clicking again and multiple votes allowed
        option.votes = option.votes.filter(vote => vote !== profile.uid);
      }

      await updateDocument('polls', pollId, { options: updatedOptions });
      await loadPollData();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getFilteredPolls = () => {
    let filtered = polls;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(poll => poll.category === categoryFilter);
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(poll => !poll.expiresAt || poll.expiresAt > Date.now());
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter(poll => poll.expiresAt && poll.expiresAt <= Date.now());
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  };

  const hasUserVoted = (poll: Poll) => {
    return poll.options.some(option => option.votes.includes(profile.uid));
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((total, option) => total + option.votes.length, 0);
  };

  const getVotePercentage = (poll: Poll, optionIndex: number) => {
    const totalVotes = getTotalVotes(poll);
    if (totalVotes === 0) return 0;
    return Math.round((poll.options[optionIndex].votes.length / totalVotes) * 100);
  };

  const isPollExpired = (poll: Poll) => {
    return poll.expiresAt && poll.expiresAt <= Date.now();
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.uid === userId);
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Less than 1h remaining';
  };

  const addPollOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const removePollOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const newOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options: newOptions });
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({ ...newPoll, options: newOptions });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading polls...</p>
        </div>
      </div>
    );
  }

  const filteredPolls = getFilteredPolls();

  return (
    <div className="page">
      <div className="page-header">
        <h2>📊 Polls & Surveys</h2>
        <p className="page-description">Create and participate in community polls and surveys.</p>
      </div>

      <div className="polls-controls">
        <div className="polls-filters">
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
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Polls</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          + Create Poll
        </button>
      </div>

      <div className="polls-stats">
        <div className="stat-item">
          <span className="stat-label">Total Polls</span>
          <span className="stat-value">{polls.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Polls</span>
          <span className="stat-value">
            {polls.filter(poll => !isPollExpired(poll)).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Your Votes</span>
          <span className="stat-value">
            {polls.filter(poll => hasUserVoted(poll)).length}
          </span>
        </div>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No polls found</h3>
          <p>Be the first to create a poll or adjust your filters.</p>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            Create First Poll
          </button>
        </div>
      ) : (
        <div className="polls-list">
          {filteredPolls.map((poll) => {
            const author = getUserById(poll.createdBy);
            const userVoted = hasUserVoted(poll);
            const totalVotes = getTotalVotes(poll);
            const expired = isPollExpired(poll);

            return (
              <div key={poll.id} className={`poll-card ${expired ? 'expired' : ''}`}>
                <div className="poll-header">
                  <h3 className="poll-question">{poll.question}</h3>
                  <div className="poll-meta">
                    <span className="poll-category">
                      {categories.find(c => c.value === poll.category)?.label}
                    </span>
                    <span className="poll-author">by {author?.fullName}</span>
                    {poll.expiresAt && (
                      <span className={`poll-expiry ${expired ? 'expired' : ''}`}>
                        {formatTimeRemaining(poll.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>

                {poll.description && (
                  <p className="poll-description">{poll.description}</p>
                )}

                <div className="poll-options">
                  {poll.options.map((option, index) => {
                    const percentage = getVotePercentage(poll, index);
                    const hasUserVotedOption = option.votes.includes(profile.uid);

                    return (
                      <div key={index} className="poll-option">
                        <button
                          className={`option-button ${hasUserVotedOption ? 'voted' : ''} ${expired ? 'disabled' : ''}`}
                          onClick={() => !expired && handleVote(poll.id, index)}
                          disabled={expired}
                        >
                          <div className="option-content">
                            <span className="option-text">{option.text}</span>
                            <span className="option-percentage">{percentage}%</span>
                          </div>
                          <div 
                            className="option-progress"
                            style={{ width: `${percentage}%` }}
                          />
                        </button>
                        {!poll.isAnonymous && userVoted && (
                          <div className="option-votes">
                            {option.votes.length} vote{option.votes.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="poll-footer">
                  <div className="poll-stats">
                    <span>{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</span>
                    {poll.allowMultiple && <span>• Multiple choices allowed</span>}
                    {poll.isAnonymous && <span>• Anonymous voting</span>}
                  </div>
                  {userVoted && (
                    <span className="voted-indicator">✓ You voted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Poll</h3>
            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <label>Poll Question</label>
                <input
                  type="text"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  placeholder="What's your question?"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                  placeholder="Provide more context for your poll..."
                  rows={2}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newPoll.category}
                    onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Expires in (days)</label>
                  <input
                    type="number"
                    value={newPoll.expiresIn}
                    onChange={(e) => setNewPoll({ ...newPoll, expiresIn: e.target.value })}
                    placeholder="Optional"
                    min="1"
                    max="365"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Poll Options</label>
                {newPoll.options.map((option, index) => (
                  <div key={index} className="option-input">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {newPoll.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(index)}
                        className="btn-danger btn-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPollOption}
                  className="btn-secondary btn-sm"
                >
                  + Add Option
                </button>
              </div>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newPoll.allowMultiple}
                    onChange={(e) => setNewPoll({ ...newPoll, allowMultiple: e.target.checked })}
                  />
                  Allow multiple selections
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newPoll.isAnonymous}
                    onChange={(e) => setNewPoll({ ...newPoll, isAnonymous: e.target.checked })}
                  />
                  Anonymous voting
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};