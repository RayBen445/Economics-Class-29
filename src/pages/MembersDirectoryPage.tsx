import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface MembersDirectoryPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const MembersDirectoryPage: React.FC<MembersDirectoryPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>👥 Members Directory</h2>
        <p className="page-description">Connect with classmates and view member profiles.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Members Directory is currently under development. 
          Here you'll be able to browse member profiles, 
          connect with classmates, and build your network.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Searchable member profiles with photos</li>
            <li>Contact information and social links</li>
            <li>Skills and interests showcasing</li>
            <li>Direct messaging capabilities</li>
            <li>Member filtering and categorization</li>
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