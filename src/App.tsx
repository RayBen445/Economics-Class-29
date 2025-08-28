import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { EmailVerificationPrompt } from './components/EmailVerificationPrompt';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProfilePage } from './pages/ProfilePage';
import { signOut } from './utils/firebase';

import { Route } from './types';

const App: React.FC = () => {
  const { user, profile, loading, error } = useFirebaseAuth();
  const [route, setRoute] = React.useState<Route>({ page: 'home' });
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Show error if there's an authentication error
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show authentication page if user is not signed in
  if (!user) {
    return (
      <>
        <AuthPage />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show email verification prompt if email is not verified
  if (!user.emailVerified) {
    return (
      <>
        <EmailVerificationPrompt user={user} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show error if profile is not found
  if (!profile) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Profile Not Found</h2>
          <p>Your user profile could not be loaded. Please try signing in again.</p>
          <button className="btn-primary" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setRoute({ page: 'home' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage profile={profile} setRoute={setRoute} />;
      case 'profile':
        return <ProfilePage profile={profile} />;
      case 'admin':
        if (profile.role !== 'Admin') {
          return <div className="error-message">Access denied: Admin access required</div>;
        }
        return <div className="page"><h2>Admin Panel</h2><p>Admin functionality coming soon...</p></div>;
      default:
        return <div className="page"><h2>Page Not Found</h2></div>;
    }
  };

  return (
    <div className="app-layout">
      <Toaster position="top-right" />
      
      {/* Simplified Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>LAUTECH Economics</h3>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={route.page === 'home' ? 'active' : ''}
              onClick={() => setRoute({ page: 'home' })}
            >
              🏠 Home
            </button>
            <button 
              className={route.page === 'profile' ? 'active' : ''}
              onClick={() => setRoute({ page: 'profile' })}
            >
              👤 Profile
            </button>
            {profile.role === 'Admin' && (
              <button 
                className={route.page === 'admin' ? 'active' : ''}
                onClick={() => setRoute({ page: 'admin' })}
              >
                ⚙️ Admin Panel
              </button>
            )}
            <button onClick={handleSignOut}>
              🚪 Sign Out
            </button>
          </nav>
        </div>
      </div>
      
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Simplified Header */}
      <div className="main-content-wrapper">
        <header className="header">
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          <div className="header-content">
            <h1>LAUTECH Economics Portal</h1>
            <div className="user-info">
              <span>Welcome, {profile.fullName}</span>
              <span className="user-role">({profile.role})</span>
            </div>
          </div>
        </header>
        
        <main className="main">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;