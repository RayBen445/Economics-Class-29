import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface EventsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>🎉 Events</h2>
        <p className="page-description">Discover and participate in academic and social events.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Events feature is currently under development. 
          Here you'll be able to discover upcoming events, 
          RSVP to activities, and create your own events.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Event discovery and browsing</li>
            <li>RSVP management and attendance tracking</li>
            <li>Event creation and promotion tools</li>
            <li>Calendar integration and reminders</li>
            <li>Photo sharing and event memories</li>
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