import React, { useState } from 'react';
import { signIn } from '../utils/firebase';
import { LoadingSpinner } from './LoadingSpinner';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgot: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSwitchToSignUp,
  onSwitchToForgot
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3>Sign In</h3>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="small" message="" /> : 'Sign In'}
        </button>
        
        <div className="auth-links">
          <button 
            type="button" 
            className="link-button" 
            onClick={onSwitchToForgot}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>
      </form>
      
      <div className="auth-switch">
        <p>
          Don't have an account?{' '}
          <button 
            type="button" 
            className="link-button" 
            onClick={onSwitchToSignUp}
            disabled={loading}
          >
            Sign Up
          </button>
        </p>
      </div>
    </>
  );
};