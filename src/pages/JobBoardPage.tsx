import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface JobBoardPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const JobBoardPage: React.FC<JobBoardPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>💼 Job Board</h2>
        <p className="page-description">Find job opportunities, internships, and career resources.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Job Board is currently under development. 
          Here you'll be able to browse job listings, 
          internship opportunities, and career resources.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Job and internship listings with filters</li>
            <li>Application tracking and management</li>
            <li>Company profiles and reviews</li>
            <li>Resume building and portfolio tools</li>
            <li>Career advice and networking events</li>
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