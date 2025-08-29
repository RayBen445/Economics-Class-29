import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface AssignmentsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>📝 Assignments</h2>
        <p className="page-description">View, submit, and track your course assignments.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Assignments feature is currently under development. 
          Here you'll be able to view assignments, submit work, 
          track deadlines, and receive feedback.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Assignment dashboard with due dates</li>
            <li>File upload and submission system</li>
            <li>Progress tracking and status updates</li>
            <li>Feedback and grading system</li>
            <li>Calendar integration for deadlines</li>
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