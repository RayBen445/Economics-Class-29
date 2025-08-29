import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface FlashcardsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>🗂️ Flashcards</h2>
        <p className="page-description">Create and study with digital flashcards for better memorization.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Flashcards feature is currently under development. 
          Here you'll be able to create, organize, and study 
          with digital flashcards for effective learning.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Interactive flashcard creation and editing</li>
            <li>Spaced repetition algorithm for optimal learning</li>
            <li>Course-specific flashcard sets</li>
            <li>Collaborative flashcard sharing</li>
            <li>Progress tracking and statistics</li>
          </ul>
        </div>
        
        <button 
          className="btn-secondary" 
          onClick={() => setRoute({ page: 'home' })}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};