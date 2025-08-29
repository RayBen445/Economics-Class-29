import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface ResourceLibraryPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const ResourceLibraryPage: React.FC<ResourceLibraryPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>📚 Resource Library</h2>
        <p className="page-description">Access study materials, textbooks, and educational resources.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Resource Library is currently under development. 
          Here you'll be able to access study materials, textbooks, 
          past papers, and other educational resources.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Searchable resource database</li>
            <li>Course-specific materials organization</li>
            <li>File sharing and downloads</li>
            <li>User-contributed resources</li>
            <li>Resource rating and reviews</li>
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