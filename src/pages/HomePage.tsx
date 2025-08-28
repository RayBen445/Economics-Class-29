import React from 'react';
import { UserProfile } from '../utils/firebase';
import { Route } from '../types';

interface HomePageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ profile, setRoute }) => {
  return (
    <div className="home-page">
      <div className="welcome-section">
        <h2>Welcome back, {profile.firstName}! 👋</h2>
        <p className="welcome-subtitle">
          Welcome to the modern LAUTECH Economics Class of '29 Community Portal
        </p>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <h3>Your Role</h3>
            <p>{profile.role}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>Matric Number</h3>
            <p>{profile.matricNumber}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Account Status</h3>
            <p className={`status ${profile.status}`}>
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h3>🚀 New Features Available</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>🔐 Firebase Authentication</h4>
            <p>Secure email-based authentication with verification</p>
          </div>
          
          <div className="feature-card">
            <h4>👤 Profile Management</h4>
            <p>Update your personal information and preferences</p>
            <button 
              className="btn-secondary" 
              onClick={() => setRoute({ page: 'profile' })}
            >
              Manage Profile
            </button>
          </div>
          
          <div className="feature-card">
            <h4>🛡️ Role-Based Access</h4>
            <p>Features and content tailored to your role</p>
          </div>
          
          {profile.role === 'Admin' && (
            <div className="feature-card admin-feature">
              <h4>⚙️ Admin Panel</h4>
              <p>Manage users, content, and system settings</p>
              <button 
                className="btn-primary" 
                onClick={() => setRoute({ page: 'admin' })}
              >
                Open Admin Panel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="migration-notice">
        <h3>🔄 Migration Complete</h3>
        <p>
          The portal has been successfully modernized with Firebase integration. 
          All authentication is now handled securely through Firebase, and your 
          profile data is stored in Firestore for better reliability and scalability.
        </p>
        
        <div className="tech-stack">
          <span className="tech-badge">React 19</span>
          <span className="tech-badge">TypeScript</span>
          <span className="tech-badge">Firebase</span>
          <span className="tech-badge">Firestore</span>
          <span className="tech-badge">Vite</span>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn" 
            onClick={() => setRoute({ page: 'profile' })}
          >
            <span className="action-icon">👤</span>
            View Profile
          </button>
          
          {profile.role === 'Admin' && (
            <button 
              className="action-btn admin-btn" 
              onClick={() => setRoute({ page: 'admin' })}
            >
              <span className="action-icon">⚙️</span>
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};