import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface CalendarPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>📅 Calendar</h2>
        <p className="page-description">View academic calendar, events, and important dates.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Calendar feature is currently under development. 
          Here you'll be able to view the academic calendar, 
          track important dates, and manage your schedule.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Interactive calendar with month/week/day views</li>
            <li>Academic semester and exam schedules</li>
            <li>Personal event creation and reminders</li>
            <li>Integration with assignments and deadlines</li>
            <li>Event sharing and collaborative planning</li>
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