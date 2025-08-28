import React, { useState } from 'react';
import { resetPassword } from '../utils/firebase';
import { LoadingSpinner } from './LoadingSpinner';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToSignIn
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setSent(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <h3>Email Sent!</h3>
        <div className="success-message">
          <p>Password reset instructions have been sent to {email}.</p>
          <p>Check your inbox and follow the instructions to reset your password.</p>
        </div>
        <button 
          type="button" 
          className="btn-primary" 
          style={{ width: '100%' }}
          onClick={onBackToSignIn}
        >
          Back to Sign In
        </button>
      </>
    );
  }

  return (
    <>
      <h3>Reset Password</h3>
      <p>Enter your email address and we'll send you a link to reset your password.</p>
      
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: '100%' }}
          disabled={loading || !email}
        >
          {loading ? <LoadingSpinner size="small" message="" /> : 'Send Reset Email'}
        </button>
      </form>
      
      <div className="auth-switch">
        <button 
          type="button" 
          className="link-button" 
          onClick={onBackToSignIn}
          disabled={loading}
        >
          ← Back to Sign In
        </button>
      </div>
    </>
  );
};