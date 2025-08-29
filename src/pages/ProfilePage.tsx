import React, { useState, useRef } from 'react';
import { UserProfile, deleteUserAccount } from '../utils/firebase';
import { useProfile } from '../hooks/useProfile';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { getFileAsBase64 } from '../utils/fileUtils';

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateProfile, updating, error } = useProfile(profile);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Validate matric number format (exactly 10 digits)
    if (!/^\d{10}$/.test(formData.matricNumber)) {
      return; // Don't save if validation fails - the error will be handled by the hook
    }
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

  // Handle clicking on profile image to trigger file selection
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and preview generation
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      // Convert file to base64 for preview
      const base64 = await getFileAsBase64(file);
      setImagePreview(base64);
    } catch (error) {
      console.error('Error reading image:', error);
      alert('Error reading image. Please try again.');
    }
  };

  // Save the previewed image to user profile
  const handleSaveImage = async () => {
    if (!imagePreview) return;
    
    setImageUploading(true);
    try {
      await updateProfile({ profilePicture: imagePreview });
      setImagePreview(null);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setImageUploading(false);
    }
  };

  // Cancel image upload and clear preview
  const handleCancelImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteUserAccount(profile.uid);
      if (success) {
        // Account deleted successfully, user will be automatically signed out
        // No need to do anything else here as the app will redirect to auth page
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-picture">
            {/* Profile picture container with click-to-upload functionality */}
            <div className="profile-picture-container" onClick={handleImageClick} title="Click to change profile picture">
              {imagePreview ? (
                // Show preview image before saving
                <img src={imagePreview} alt="Profile Preview" className="profile-page-avatar" />
              ) : profile.profilePicture ? (
                // Show current profile picture
                <img src={profile.profilePicture} alt="Profile" className="profile-page-avatar" />
              ) : (
                // Show placeholder with user initials
                <div className="profile-placeholder">
                  {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              {/* Hover overlay to indicate clickable area */}
              <div className="profile-picture-edit-overlay">
                <span>Change<br/>Photo</span>
              </div>
            </div>
            
            {/* Image Preview Actions - shown when user selects a new image */}
            {imagePreview && (
              <div className="image-preview-actions">
                <button 
                  className="btn-primary btn-sm" 
                  onClick={handleSaveImage}
                  disabled={imageUploading}
                >
                  {imageUploading ? <LoadingSpinner size="small" message="" /> : 'Save Photo'}
                </button>
                <button 
                  className="btn-secondary btn-sm" 
                  onClick={handleCancelImage}
                  disabled={imageUploading}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Hidden file input for image selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
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

        {/* Account Management Section */}
        <div className="account-management-section">
          <h3>Account Management</h3>
          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button 
              className="btn-danger" 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={updating || isDeleting}
            >
              {isDeleting ? <LoadingSpinner size="small" message="" /> : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Account Deletion */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        confirmText="Delete Account"
        cancelText="Cancel"
        dangerConfirm={true}
      >
        <div className="delete-account-warning">
          <p><strong>Warning:</strong> This action is permanent and cannot be undone.</p>
          <p>Deleting your account will:</p>
          <ul>
            <li>Permanently remove your profile and personal information</li>
            <li>Delete all your messages, posts, and contributions</li>
            <li>Remove you from all study groups and conversations</li>
            <li>Cancel any active tutoring sessions or job applications</li>
          </ul>
          <p>Are you absolutely sure you want to delete your account?</p>
        </div>
      </ConfirmationModal>
    </div>
  );
};