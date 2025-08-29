import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface ForumsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const ForumsPage: React.FC<ForumsPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>💬 Forums</h2>
        <p className="page-description">Engage in academic discussions and community conversations.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Forums feature is currently under development. 
          Here you'll be able to participate in academic discussions, 
          ask questions, and engage with the community.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Topic-based discussion threads</li>
            <li>Course-specific forums</li>
            <li>Real-time messaging and notifications</li>
            <li>Moderation and community guidelines</li>
            <li>Search and categorization features</li>
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