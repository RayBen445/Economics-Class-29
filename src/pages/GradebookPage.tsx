import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface GradebookPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const GradebookPage: React.FC<GradebookPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>📊 Gradebook</h2>
        <p className="page-description">View your grades, track academic performance, and monitor progress.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Gradebook feature is currently under development. 
          Here you'll be able to view your grades, track performance 
          across courses, and monitor your academic progress.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Comprehensive grade tracking dashboard</li>
            <li>Course-wise performance analytics</li>
            <li>Semester and cumulative GPA calculations</li>
            <li>Grade trend visualization</li>
            <li>Export and sharing capabilities</li>
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