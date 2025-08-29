import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface FacultyDirectoryPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const FacultyDirectoryPage: React.FC<FacultyDirectoryPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>👨‍🏫 Faculty Directory</h2>
        <p className="page-description">Browse and connect with our economics faculty members.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Faculty Directory is currently under development. 
          Here you'll be able to view faculty profiles, office hours, 
          contact information, and areas of expertise.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Faculty profile cards with photos</li>
            <li>Contact information and office hours</li>
            <li>Research areas and specializations</li>
            <li>Course assignments</li>
            <li>Direct messaging capabilities</li>
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