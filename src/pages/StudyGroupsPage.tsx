import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface StudyGroupsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const StudyGroupsPage: React.FC<StudyGroupsPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>👨‍👩‍👧‍👦 Study Groups</h2>
        <p className="page-description">Join or create study groups for collaborative learning.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Study Groups feature is currently under development. 
          Here you'll be able to create, join, and manage study groups 
          for collaborative learning and peer support.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Study group creation and management</li>
            <li>Course-specific and topic-based groups</li>
            <li>Group scheduling and meeting coordination</li>
            <li>Shared resources and collaborative tools</li>
            <li>Group chat and communication features</li>
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