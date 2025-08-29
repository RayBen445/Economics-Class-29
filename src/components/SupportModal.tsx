import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useNotifications } from '../hooks/useNotifications';
import { sendSupportMessage, validateTelegramConfig, testTelegramBot } from '../utils/supportService';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SupportFormData {
  category: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useFirebaseAuth();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [formData, setFormData] = useState<SupportFormData>({
    category: 'general',
    subject: '',
    message: '',
    priority: 'medium'
  });

  // Check Telegram connectivity on modal open
  useEffect(() => {
    if (isOpen) {
      checkTelegramStatus();
    }
  }, [isOpen]);

  const checkTelegramStatus = async () => {
    setTelegramStatus('checking');
    if (validateTelegramConfig()) {
      const isConnected = await testTelegramBot();
      setTelegramStatus(isConnected ? 'connected' : 'disconnected');
    } else {
      setTelegramStatus('disconnected');
    }
  };

  const categories = [
    { value: 'general', label: '🔧 General Support' },
    { value: 'technical', label: '💻 Technical Issue' },
    { value: 'account', label: '👤 Account Problem' },
    { value: 'feature', label: '✨ Feature Request' },
    { value: 'bug', label: '🐛 Bug Report' },
    { value: 'academic', label: '📚 Academic Help' },
    { value: 'other', label: '❓ Other' }
  ];

  const priorities = [
    { value: 'low', label: '🟢 Low', color: '#22c55e' },
    { value: 'medium', label: '🟡 Medium', color: '#eab308' },
    { value: 'high', label: '🟠 High', color: '#f97316' },
    { value: 'urgent', label: '🔴 Urgent', color: '#ef4444' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in both subject and message fields.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendSupportMessage({
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'No email provided',
        userName: user?.displayName || 'Anonymous User',
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        timestamp: new Date()
      });

      addNotification({
        title: 'Support Request Sent',
        message: 'Your support request has been submitted successfully. We\'ll get back to you soon!',
        type: 'success'
      });

      // Reset form
      setFormData({
        category: 'general',
        subject: '',
        message: '',
        priority: 'medium'
      });

      onClose();
    } catch (error) {
      console.error('Error sending support message:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to send support request. Please try again or contact us directly.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SupportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="support-modal">
        <div className="modal-header">
          <h2>🆘 Get Support</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="support-intro">
            <p>Need help? We're here to assist you! Please provide details about your issue and we'll get back to you as soon as possible.</p>
            <div className="support-contact-info">
              <p><strong>📧 Email:</strong> {import.meta.env.VITE_ADMIN_EMAIL || 'oladoyeheritage445@gmail.com'}</p>
              <p>
                <strong>📱 Telegram:</strong> 
                <span className={`status-indicator ${telegramStatus}`}>
                  {telegramStatus === 'checking' && '⏳ Checking...'}
                  {telegramStatus === 'connected' && '✅ Connected'}
                  {telegramStatus === 'disconnected' && '❌ Disconnected'}
                </span>
              </p>
              <p><strong>⏱️ Response Time:</strong> Usually within 24 hours</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="form-select"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority Level</label>
              <div className="priority-options">
                {priorities.map(priority => (
                  <label key={priority.value} className="priority-option">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    />
                    <span 
                      className="priority-label"
                      style={{ borderColor: priority.color }}
                    >
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Brief description of your issue..."
                className="form-input"
                maxLength={100}
                required
              />
              <div className="char-count">{formData.subject.length}/100</div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, or specific questions..."
                className="form-textarea"
                rows={6}
                maxLength={1000}
                required
              />
              <div className="char-count">{formData.message.length}/1000</div>
            </div>

            <div className="user-info">
              <p><strong>Your Account:</strong> {user?.email || 'Not logged in'}</p>
              <p><strong>User ID:</strong> {user?.uid || 'Anonymous'}</p>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Send Support Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};