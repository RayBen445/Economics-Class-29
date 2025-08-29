import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { EmailVerificationPrompt } from './components/EmailVerificationPrompt';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProfilePage } from './pages/ProfilePage';
import { 
  CoursePlannerPage, 
  FacultyDirectoryPage, 
  AssignmentsPage, 
  ResourceLibraryPage, 
  QuizzesPage, 
  FlashcardsPage, 
  GradebookPage, 
  GpaCalculatorPage, 
  ForumsPage, 
  PollsSurveysPage, 
  CalendarPage, 
  MembersDirectoryPage, 
  MessagesPage, 
  TutoringMarketplacePage, 
  JobBoardPage, 
  StudyGroupsPage, 
  EventsPage 
} from './pages';
import { signOut, setupAdminUser } from './utils/firebase';

import { Route } from './types';

const App: React.FC = () => {
  const { user, profile, loading, error } = useFirebaseAuth();
  const [route, setRoute] = React.useState<Route>({ page: 'home' });
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);

  // Setup admin user on first load
  React.useEffect(() => {
    const hasSetupAdmin = localStorage.getItem('adminSetupComplete');
    if (!hasSetupAdmin) {
      // Run admin setup in the background
      setupAdminUser().finally(() => {
        localStorage.setItem('adminSetupComplete', 'true');
      });
    }

    // Expose admin setup function globally for manual use
    (window as any).setupAdmin = setupAdminUser;
  }, []);

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
      case 'coursePlanner':
        return <CoursePlannerPage profile={profile} setRoute={setRoute} />;
      case 'facultyDirectory':
        return <FacultyDirectoryPage profile={profile} setRoute={setRoute} />;
      case 'assignments':
        return <AssignmentsPage profile={profile} setRoute={setRoute} />;
      case 'resourceLibrary':
        return <ResourceLibraryPage profile={profile} setRoute={setRoute} />;
      case 'quizzes':
        return <QuizzesPage profile={profile} setRoute={setRoute} />;
      case 'flashcards':
        return <FlashcardsPage profile={profile} setRoute={setRoute} />;
      case 'gradebook':
        return <GradebookPage profile={profile} setRoute={setRoute} />;
      case 'gpaCalculator':
        return <GpaCalculatorPage profile={profile} setRoute={setRoute} />;
      case 'forums':
        return <ForumsPage profile={profile} setRoute={setRoute} />;
      case 'pollsSurveys':
        return <PollsSurveysPage profile={profile} setRoute={setRoute} />;
      case 'calendar':
        return <CalendarPage profile={profile} setRoute={setRoute} />;
      case 'membersDirectory':
        return <MembersDirectoryPage profile={profile} setRoute={setRoute} />;
      case 'messages':
        return <MessagesPage profile={profile} setRoute={setRoute} />;
      case 'tutoringMarketplace':
        return <TutoringMarketplacePage profile={profile} setRoute={setRoute} />;
      case 'jobBoard':
        return <JobBoardPage profile={profile} setRoute={setRoute} />;
      case 'studyGroups':
        return <StudyGroupsPage profile={profile} setRoute={setRoute} />;
      case 'events':
        return <EventsPage profile={profile} setRoute={setRoute} />;
      case 'admin':
        if (profile.role !== 'Admin') {
          return <div className="error-message">Access denied: Admin access required</div>;
        }
        return (
          <div className="page">
            <h2>Admin Panel</h2>
            <div className="admin-section">
              <h3>User Management</h3>
              <div className="admin-actions">
                <button 
                  className="btn-primary"
                  onClick={setupAdminUser}
                  title="Promote oladoyeheritage445@gmail.com to Admin"
                >
                  Setup Admin User (Heritage)
                </button>
              </div>
              <p className="admin-note">
                Click the button above to promote oladoyeheritage445@gmail.com to Admin role.
                This can also be done from the browser console by calling: <code>setupAdmin()</code>
              </p>
            </div>
            <div className="admin-section">
              <h3>System Status</h3>
              <p>All systems operational. Additional admin functionality coming soon...</p>
            </div>
          </div>
        );
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
            
            {/* Academic Features */}
            <div className="nav-section">
              <div className="nav-section-header">📚 Academic</div>
              <button 
                className={route.page === 'coursePlanner' ? 'active' : ''}
                onClick={() => setRoute({ page: 'coursePlanner' })}
              >
                📋 Course Planner
              </button>
              <button 
                className={route.page === 'facultyDirectory' ? 'active' : ''}
                onClick={() => setRoute({ page: 'facultyDirectory' })}
              >
                👨‍🏫 Faculty Directory
              </button>
              <button 
                className={route.page === 'assignments' ? 'active' : ''}
                onClick={() => setRoute({ page: 'assignments' })}
              >
                📝 Assignments
              </button>
              <button 
                className={route.page === 'resourceLibrary' ? 'active' : ''}
                onClick={() => setRoute({ page: 'resourceLibrary' })}
              >
                📚 Resource Library
              </button>
            </div>

            {/* Learning Tools */}
            <div className="nav-section">
              <div className="nav-section-header">🧠 Learning Tools</div>
              <button 
                className={route.page === 'quizzes' ? 'active' : ''}
                onClick={() => setRoute({ page: 'quizzes' })}
              >
                🧠 Quizzes
              </button>
              <button 
                className={route.page === 'flashcards' ? 'active' : ''}
                onClick={() => setRoute({ page: 'flashcards' })}
              >
                🗂️ Flashcards
              </button>
              <button 
                className={route.page === 'gradebook' ? 'active' : ''}
                onClick={() => setRoute({ page: 'gradebook' })}
              >
                📊 Gradebook
              </button>
              <button 
                className={route.page === 'gpaCalculator' ? 'active' : ''}
                onClick={() => setRoute({ page: 'gpaCalculator' })}
              >
                🧮 GPA Calculator
              </button>
            </div>

            {/* Community */}
            <div className="nav-section">
              <div className="nav-section-header">👥 Community</div>
              <button 
                className={route.page === 'forums' ? 'active' : ''}
                onClick={() => setRoute({ page: 'forums' })}
              >
                💬 Forums
              </button>
              <button 
                className={route.page === 'pollsSurveys' ? 'active' : ''}
                onClick={() => setRoute({ page: 'pollsSurveys' })}
              >
                📊 Polls & Surveys
              </button>
              <button 
                className={route.page === 'calendar' ? 'active' : ''}
                onClick={() => setRoute({ page: 'calendar' })}
              >
                📅 Calendar
              </button>
              <button 
                className={route.page === 'membersDirectory' ? 'active' : ''}
                onClick={() => setRoute({ page: 'membersDirectory' })}
              >
                👥 Members Directory
              </button>
              <button 
                className={route.page === 'messages' ? 'active' : ''}
                onClick={() => setRoute({ page: 'messages' })}
              >
                💌 Messages
              </button>
              <button 
                className={route.page === 'studyGroups' ? 'active' : ''}
                onClick={() => setRoute({ page: 'studyGroups' })}
              >
                👨‍👩‍👧‍👦 Study Groups
              </button>
              <button 
                className={route.page === 'events' ? 'active' : ''}
                onClick={() => setRoute({ page: 'events' })}
              >
                🎉 Events
              </button>
            </div>

            {/* Services */}
            <div className="nav-section">
              <div className="nav-section-header">💼 Services</div>
              <button 
                className={route.page === 'tutoringMarketplace' ? 'active' : ''}
                onClick={() => setRoute({ page: 'tutoringMarketplace' })}
              >
                🎓 Tutoring Marketplace
              </button>
              <button 
                className={route.page === 'jobBoard' ? 'active' : ''}
                onClick={() => setRoute({ page: 'jobBoard' })}
              >
                💼 Job Board
              </button>
            </div>

            {/* Admin Section */}
            {profile.role === 'Admin' && (
              <div className="nav-section">
                <div className="nav-section-header">⚙️ Admin</div>
                <button 
                  className={route.page === 'admin' ? 'active' : ''}
                  onClick={() => setRoute({ page: 'admin' })}
                >
                  ⚙️ Admin Panel
                </button>
              </div>
            )}

            {/* Sign Out */}
            <div className="nav-section">
              <button onClick={handleSignOut} className="sign-out-btn">
                🚪 Sign Out
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Simplified Header */}
      <div className="main-content-wrapper">
        <header className="header">
          <div className="header-left">
            <button 
              className="sidebar-toggle" 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              title="Toggle Navigation"
            >
              ☰
            </button>
            <h1>LAUTECH Economics Portal</h1>
          </div>
          <div className="header-content">
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