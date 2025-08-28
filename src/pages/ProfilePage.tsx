import React, { useState } from 'react';
import { UserProfile } from '../utils/firebase';
import { useProfile } from '../hooks/useProfile';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ProfilePageProps {
  profile: UserProfile;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    otherName: profile.otherName,
    surname: profile.surname,
    username: profile.username,
    matricNumber: profile.matricNumber
  });

  const { updateProfile, updating, error } = useProfile(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateProfile(formData);
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName,
      otherName: profile.otherName,
      surname: profile.surname,
      username: profile.username,
      matricNumber: profile.matricNumber
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-picture">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" />
            ) : (
              <div className="profile-placeholder">
                {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h3>{profile.fullName}</h3>
            <p className="profile-role">{profile.role}</p>
            <p className="profile-email">{profile.email}</p>
            <div className={`verification-status ${profile.emailVerified ? 'verified' : 'unverified'}`}>
              {profile.emailVerified ? '✓ Email Verified' : '⚠ Email Not Verified'}
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-details">
          {!isEditing ? (
            <>
              <div className="detail-row">
                <label>First Name:</label>
                <span>{profile.firstName}</span>
              </div>
              <div className="detail-row">
                <label>Other Name:</label>
                <span>{profile.otherName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Surname:</label>
                <span>{profile.surname}</span>
              </div>
              <div className="detail-row">
                <label>Username:</label>
                <span>{profile.username}</span>
              </div>
              <div className="detail-row">
                <label>Matric Number:</label>
                <span>{profile.matricNumber}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status ${profile.status}`}>{profile.status}</span>
              </div>
              <div className="detail-row">
                <label>Member Since:</label>
                <span>{profile.createdAt.toDate().toLocaleDateString()}</span>
              </div>
              
              <button 
                className="btn-primary" 
                onClick={() => setIsEditing(true)}
                disabled={updating}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={updating}
                />
              </div>
              <div className="form-group">
                <label>Other Name:</label>
                <input
                  type="text"
                  name="otherName"
                  value={formData.otherName}
                  onChange={handleChange}
                  disabled={updating}
                />
              </div>
              <div className="form-group">
                <label>Surname:</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  disabled={updating}
                />
              </div>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={updating}
                />
              </div>
              <div className="form-group">
                <label>Matric Number:</label>
                <input
                  type="text"
                  name="matricNumber"
                  value={formData.matricNumber}
                  onChange={handleChange}
                  disabled={updating}
                />
              </div>
              
              <div className="profile-actions">
                <button 
                  className="btn-primary" 
                  onClick={handleSave}
                  disabled={updating}
                >
                  {updating ? <LoadingSpinner size="small" message="" /> : 'Save Changes'}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={handleCancel}
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};