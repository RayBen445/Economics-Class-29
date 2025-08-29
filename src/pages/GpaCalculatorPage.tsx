import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface GpaCalculatorPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const GpaCalculatorPage: React.FC<GpaCalculatorPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>🧮 GPA Calculator</h2>
        <p className="page-description">Calculate your GPA and plan your academic goals.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The GPA Calculator is currently under development. 
          Here you'll be able to calculate your current GPA, 
          plan future semesters, and set academic goals.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Current GPA calculation with credit weights</li>
            <li>Semester-by-semester GPA tracking</li>
            <li>Goal-setting and "what-if" scenarios</li>
            <li>Grade requirements for target GPA</li>
            <li>Visual progress charts and analytics</li>
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