import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { resendVerificationEmail, signOut } from '../utils/firebase';
import { LoadingSpinner } from './LoadingSpinner';

interface EmailVerificationPromptProps {
  user: User;
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({ user }) => {
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await resendVerificationEmail(user);
    } catch (error) {
      // Error is handled in the resendVerificationEmail function
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Error is handled in the signOut function
    }
  };

  return (
    <div className="verification-prompt">
      <div className="verification-container">
        <div className="verification-content">
          <h2>Email Verification Required</h2>
          <p>Please verify your email address to access the LAUTECH Economics Portal.</p>
          <p>We've sent a verification email to: <strong>{user.email}</strong></p>
          
          <div className="verification-actions">
            <button 
              className="btn-primary" 
              onClick={handleResendEmail}
              disabled={resending}
            >
              {resending ? <LoadingSpinner size="small" message="" /> : 'Resend Verification Email'}
            </button>
            
            <button 
              className="btn-secondary" 
              onClick={handleSignOut}
              disabled={resending}
            >
              Sign Out
            </button>
          </div>
          
          <div className="verification-note">
            <p><small>
              Check your spam folder if you don't see the email. 
              After verifying, please refresh this page or sign in again.
            </small></p>
          </div>
        </div>
      </div>
    </div>
  );
};