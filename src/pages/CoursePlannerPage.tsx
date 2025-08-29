import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface CoursePlannerPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const CoursePlannerPage: React.FC<CoursePlannerPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>📋 Course Planner</h2>
        <p className="page-description">Plan your academic courses and track your progress.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Course Planner feature is currently under development. 
          Here you'll be able to plan your courses, track prerequisites, 
          and visualize your academic path.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Interactive course planning interface</li>
            <li>Prerequisite tracking</li>
            <li>Semester scheduling</li>
            <li>Progress visualization</li>
            <li>Credit hour calculations</li>
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