import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface PollsSurveysPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const PollsSurveysPage: React.FC<PollsSurveysPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>📊 Polls & Surveys</h2>
        <p className="page-description">Participate in polls and surveys to share your opinions.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Polls & Surveys feature is currently under development. 
          Here you'll be able to create, participate in, and view 
          results of community polls and academic surveys.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Interactive poll creation and voting</li>
            <li>Survey forms with various question types</li>
            <li>Real-time results and analytics</li>
            <li>Anonymous and identified voting options</li>
            <li>Scheduled polls and deadline management</li>
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