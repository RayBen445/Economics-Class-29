import React, { useState } from 'react';
import { SignInForm } from '../components/SignInForm';
import { SignUpForm } from '../components/SignUpForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

type AuthView = 'signin' | 'signup' | 'forgot';

export const AuthPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('signin');

  const renderAuthForm = () => {
    switch (currentView) {
      case 'signin':
        return <SignInForm onSwitchToSignUp={() => setCurrentView('signup')} onSwitchToForgot={() => setCurrentView('forgot')} />;
      case 'signup':
        return <SignUpForm onSwitchToSignIn={() => setCurrentView('signin')} />;
      case 'forgot':
        return <ForgotPasswordForm onBackToSignIn={() => setCurrentView('signin')} />;
      default:
        return <SignInForm onSwitchToSignUp={() => setCurrentView('signup')} onSwitchToForgot={() => setCurrentView('forgot')} />;
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-page-container">
        <div className="auth-header">
          <h1 className="logo">LAUTECH Economics '29</h1>
          <h2>Community Portal</h2>
        </div>
        <div className="auth-card">
          {renderAuthForm()}
        </div>
      </div>
    </div>
  );
};