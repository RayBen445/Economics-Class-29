import React, { useState } from 'react';
import { UserProfile } from '../utils/firebase';

export interface Reaction {
  emoji: string;
  label: string;
  users: string[];
}

export interface ReactionData {
  [key: string]: Reaction;
}

interface ReactionBarProps {
  reactions: ReactionData;
  onReact: (emoji: string) => void;
  currentUserId: string;
  className?: string;
}

const AVAILABLE_REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💡', label: 'Idea' },
  { emoji: '✨', label: 'Amazing' },
  { emoji: '💯', label: '100' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🙏', label: 'Thank you' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '🎯', label: 'Target' },
  { emoji: '⚡', label: 'Lightning' },
  { emoji: '🌟', label: 'Star' },
  { emoji: '🎊', label: 'Party' },
  { emoji: '🚀', label: 'Rocket' }
];

export const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  onReact,
  currentUserId,
  className = ''
}) => {
  const [showAllReactions, setShowAllReactions] = useState(false);

  const getReactionCount = (emoji: string): number => {
    return reactions[emoji]?.users.length || 0;
  };

  const hasUserReacted = (emoji: string): boolean => {
    return reactions[emoji]?.users.includes(currentUserId) || false;
  };

  const getTopReactions = () => {
    return Object.entries(reactions)
      .filter(([_, reaction]) => reaction.users.length > 0)
      .sort(([, a], [, b]) => b.users.length - a.users.length)
      .slice(0, 6);
  };

  const handleReactionClick = (emoji: string) => {
    onReact(emoji);
  };

  const toggleReactionPicker = () => {
    setShowAllReactions(!showAllReactions);
  };

  return (
    <div className={`reaction-bar ${className}`}>
      {/* Display current reactions */}
      <div className="current-reactions">
        {getTopReactions().map(([emoji, reaction]) => (
          <button
            key={emoji}
            className={`reaction-button ${hasUserReacted(emoji) ? 'user-reacted' : ''}`}
            onClick={() => handleReactionClick(emoji)}
            title={`${reaction.label} (${reaction.users.length})`}
          >
            <span className="reaction-emoji">{emoji}</span>
            <span className="reaction-count">{reaction.users.length}</span>
          </button>
        ))}
      </div>

      {/* Add reaction button */}
      <div className="reaction-picker-container">
        <button
          className="add-reaction-button"
          onClick={toggleReactionPicker}
          title="Add reaction"
        >
          😊 +
        </button>

        {/* Reaction picker dropdown */}
        {showAllReactions && (
          <>
            <div 
              className="reaction-picker-overlay" 
              onClick={() => setShowAllReactions(false)}
            />
            <div className="reaction-picker">
              <div className="reaction-picker-header">
                <span>Choose a reaction</span>
                <button 
                  className="reaction-picker-close"
                  onClick={() => setShowAllReactions(false)}
                >
                  ×
                </button>
              </div>
              <div className="reaction-grid">
                {AVAILABLE_REACTIONS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    className={`reaction-option ${hasUserReacted(emoji) ? 'user-reacted' : ''}`}
                    onClick={() => {
                      handleReactionClick(emoji);
                      setShowAllReactions(false);
                    }}
                    title={label}
                  >
                    <span className="reaction-emoji">{emoji}</span>
                    <span className="reaction-label">{label}</span>
                    {getReactionCount(emoji) > 0 && (
                      <span className="reaction-count-badge">{getReactionCount(emoji)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Hook for managing reactions
export const useReactions = () => {
  const toggleReaction = (
    currentReactions: ReactionData,
    emoji: string,
    userId: string
  ): ReactionData => {
    const updatedReactions = { ...currentReactions };
    
    if (!updatedReactions[emoji]) {
      updatedReactions[emoji] = {
        emoji,
        label: AVAILABLE_REACTIONS.find(r => r.emoji === emoji)?.label || '',
        users: []
      };
    }
    
    const userIndex = updatedReactions[emoji].users.indexOf(userId);
    
    if (userIndex > -1) {
      // Remove reaction
      updatedReactions[emoji].users.splice(userIndex, 1);
      
      // Remove empty reactions
      if (updatedReactions[emoji].users.length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      // Add reaction
      updatedReactions[emoji].users.push(userId);
    }
    
    return updatedReactions;
  };

  const getReactionSummary = (reactions: ReactionData): string => {
    const topReactions = Object.entries(reactions)
      .filter(([_, reaction]) => reaction.users.length > 0)
      .sort(([, a], [, b]) => b.users.length - a.users.length)
      .slice(0, 3);

    if (topReactions.length === 0) return '';

    return topReactions
      .map(([emoji, reaction]) => `${emoji} ${reaction.users.length}`)
      .join('  ');
  };

  const getTotalReactionCount = (reactions: ReactionData): number => {
    return Object.values(reactions).reduce((total, reaction) => total + reaction.users.length, 0);
  };

  return {
    toggleReaction,
    getReactionSummary,
    getTotalReactionCount,
    availableReactions: AVAILABLE_REACTIONS
  };
};