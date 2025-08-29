import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface MessagesPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ profile, setRoute }) => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>💌 Messages</h2>
        <p className="page-description">Send and receive messages with classmates and faculty.</p>
      </div>
      
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>
          The Messages feature is currently under development. 
          Here you'll be able to send and receive private messages, 
          participate in group chats, and communicate with the community.
        </p>
        
        <div className="planned-features">
          <h4>Planned Features:</h4>
          <ul>
            <li>Real-time private messaging</li>
            <li>Group chat creation and management</li>
            <li>Message history and search</li>
            <li>File and media sharing</li>
            <li>Read receipts and online status</li>
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