import React, { useState } from 'react';
import { signUp } from '../utils/firebase';
import { LoadingSpinner } from './LoadingSpinner';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    otherName: '',
    surname: '',
    username: '',
    email: '',
    matricNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin email for role assignment
  const ADMIN_EMAIL = 'admin@lautech.edu.ng';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Validate matric number format (exactly 10 digits)
    if (!/^\d{10}$/.test(formData.matricNumber)) {
      setError('Please enter a valid matric number (e.g., 2024000000)');
      setLoading(false);
      return;
    }

    try {
      const fullName = `${formData.firstName} ${formData.otherName} ${formData.surname}`.replace(/\s+/g, ' ').trim();
      
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        otherName: formData.otherName,
        surname: formData.surname,
        username: formData.username,
        matricNumber: formData.matricNumber.toUpperCase(),
        fullName,
        role: formData.email === ADMIN_EMAIL ? 'Admin' : 'Student',
        status: 'active',
        profilePicture: ''
      });
      
      // Show success message and switch to sign in
      setTimeout(() => {
        onSwitchToSignIn();
      }, 2000);
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3>Sign Up</h3>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            name="otherName"
            placeholder="Other Name"
            value={formData.otherName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            name="surname"
            placeholder="Surname"
            value={formData.surname}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
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
            type="text"
            name="matricNumber"
            placeholder="Matric Number (e.g., 2024000000)"
            value={formData.matricNumber}
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
        
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
          {loading ? <LoadingSpinner size="small" message="" /> : 'Sign Up'}
        </button>
      </form>
      
      <div className="auth-switch">
        <p>
          Already have an account?{' '}
          <button 
            type="button" 
            className="link-button" 
            onClick={onSwitchToSignIn}
            disabled={loading}
          >
            Sign In
          </button>
        </p>
      </div>
    </>
  );
};