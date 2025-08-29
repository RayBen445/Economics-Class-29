import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface QuizzesPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const QuizzesPage: React.FC<QuizzesPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>🧠 Quizzes</h2>
        <p className="page-description">Take quizzes, practice tests, and assess your knowledge.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Quizzes feature is currently under development. 
          Here you'll be able to take practice quizzes, 
          view results, and track your learning progress.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Interactive quiz interface</li>
            <li>Multiple question types (MCQ, True/False, Essays)</li>
            <li>Timed quizzes and practice tests</li>
            <li>Instant feedback and explanations</li>
            <li>Performance analytics and progress tracking</li>
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