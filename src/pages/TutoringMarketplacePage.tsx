import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface TutoringMarketplacePageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const TutoringMarketplacePage: React.FC<TutoringMarketplacePageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>🎓 Tutoring Marketplace</h2>
        <p className="page-description">Find tutors or offer tutoring services to fellow students.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Tutoring Marketplace is currently under development. 
          Here you'll be able to find tutors, offer tutoring services, 
          and schedule study sessions with peers.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Tutor profiles with ratings and reviews</li>
            <li>Subject-specific tutor matching</li>
            <li>Session scheduling and calendar integration</li>
            <li>Payment processing and booking system</li>
            <li>Virtual and in-person session options</li>
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