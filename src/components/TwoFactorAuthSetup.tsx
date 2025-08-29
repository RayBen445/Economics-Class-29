import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useNotifications } from '../hooks/useNotifications';

interface TwoFactorAuthSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TwoFactorState {
  isEnabled: boolean;
  qrCodeUrl: string;
  backupCodes: string[];
  setupSecret: string;
}

export const TwoFactorAuthSetup: React.FC<TwoFactorAuthSetupProps> = ({ isOpen, onClose }) => {
  const { user } = useFirebaseAuth();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState<'overview' | 'setup' | 'verify' | 'complete'>('overview');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorState>({
    isEnabled: false,
    qrCodeUrl: '',
    backupCodes: [],
    setupSecret: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      checkTwoFactorStatus();
    }
  }, [isOpen, user]);

  const checkTwoFactorStatus = async () => {
    // Check if 2FA is already enabled for the user
    // This would typically involve checking the user's settings in Firebase
    // For now, we'll simulate this
    setTwoFactorState(prev => ({
      ...prev,
      isEnabled: false // Assume not enabled initially
    }));
  };

  const generateSetupData = async () => {
    setIsLoading(true);
    try {
      // Generate 2FA setup data
      // In a real implementation, this would call your backend to generate:
      // 1. A secret key for TOTP
      // 2. A QR code URL
      // 3. Backup codes
      
      const mockSecret = 'JBSWY3DPEHPK3PXP'; // Mock secret for demo
      const appName = 'LAUTECH Economics Portal';
      const userEmail = user?.email || 'user@example.com';
      
      // Generate QR code URL for authenticator apps
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${mockSecret}&issuer=${encodeURIComponent(appName)}`;
      
      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      setTwoFactorState(prev => ({
        ...prev,
        qrCodeUrl,
        setupSecret: mockSecret,
        backupCodes
      }));

      setStep('setup');
    } catch (error) {
      console.error('Error generating 2FA setup data:', error);
      addNotification({
        title: 'Setup Error',
        message: 'Failed to generate 2FA setup data. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode.trim()) {
      addNotification({
        title: 'Verification Required',
        message: 'Please enter the verification code from your authenticator app.',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify the TOTP code
      // In a real implementation, this would verify the code against the secret
      // For demo purposes, we'll accept any 6-digit code
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        // Enable 2FA for the user
        setTwoFactorState(prev => ({ ...prev, isEnabled: true }));
        setStep('complete');
        
        addNotification({
          title: '2FA Enabled',
          message: 'Two-factor authentication has been successfully enabled for your account.',
          type: 'success'
        });
      } else {
        addNotification({
          title: 'Invalid Code',
          message: 'The verification code is invalid. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      addNotification({
        title: 'Verification Error',
        message: 'Failed to verify the code. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    setIsLoading(true);
    try {
      // Disable 2FA for the user
      setTwoFactorState(prev => ({ ...prev, isEnabled: false }));
      setStep('overview');
      
      addNotification({
        title: '2FA Disabled',
        message: 'Two-factor authentication has been disabled for your account.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to disable 2FA. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const codesText = `LAUTECH Economics Portal - 2FA Backup Codes
Generated: ${new Date().toLocaleDateString()}
Account: ${user?.email}

These backup codes can be used to access your account if you lose access to your authenticator app.
Each code can only be used once. Store them in a safe place.

${twoFactorState.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Important:
- Keep these codes secure and private
- Each code can only be used once
- Generate new codes if you suspect they've been compromised`;

    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lautech-economics-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="two-factor-modal">
        <div className="modal-header">
          <h2>🔐 Two-Factor Authentication</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {step === 'overview' && (
            <div className="two-factor-overview">
              <div className="security-status">
                <div className={`status-indicator ${twoFactorState.isEnabled ? 'enabled' : 'disabled'}`}>
                  {twoFactorState.isEnabled ? '✅ 2FA Enabled' : '❌ 2FA Disabled'}
                </div>
              </div>

              <div className="two-factor-info">
                <h3>🛡️ Enhanced Security</h3>
                <p>Two-factor authentication adds an extra layer of security to your account by requiring a second form of verification in addition to your password.</p>
                
                <div className="benefits-list">
                  <h4>Benefits:</h4>
                  <ul>
                    <li>🔒 Protects against password theft</li>
                    <li>🚫 Prevents unauthorized access</li>
                    <li>📱 Works with popular authenticator apps</li>
                    <li>💾 Includes backup codes for recovery</li>
                  </ul>
                </div>

                <div className="app-recommendations">
                  <h4>Recommended Authenticator Apps:</h4>
                  <div className="app-list">
                    <div className="app-item">📱 Google Authenticator</div>
                    <div className="app-item">🔐 Authy</div>
                    <div className="app-item">🛡️ Microsoft Authenticator</div>
                    <div className="app-item">🔑 1Password</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'setup' && (
            <div className="two-factor-setup">
              <h3>📱 Setup Authenticator App</h3>
              <p>Scan the QR code below with your authenticator app, or manually enter the setup key.</p>
              
              <div className="qr-code-section">
                <div className="qr-code">
                  <img src={twoFactorState.qrCodeUrl} alt="2FA QR Code" />
                </div>
                
                <div className="manual-setup">
                  <h4>Manual Setup Key:</h4>
                  <div className="setup-key">
                    <code>{twoFactorState.setupSecret}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(twoFactorState.setupSecret);
                        addNotification({
                          title: 'Copied',
                          message: 'Setup key copied to clipboard.',
                          type: 'success'
                        });
                      }}
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <div className="setup-instructions">
                <h4>Setup Instructions:</h4>
                <ol>
                  <li>Open your authenticator app</li>
                  <li>Tap "Add Account" or "+" button</li>
                  <li>Scan the QR code or enter the key manually</li>
                  <li>Your app will generate a 6-digit code</li>
                  <li>Enter the code below to verify setup</li>
                </ol>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="two-factor-verify">
              <h3>🔢 Verify Setup</h3>
              <p>Enter the 6-digit code from your authenticator app to complete setup.</p>
              
              <div className="verification-input">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="code-input"
                  maxLength={6}
                />
              </div>

              <div className="verify-note">
                <p>💡 The code changes every 30 seconds. If it doesn't work, wait for the next code.</p>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="two-factor-complete">
              <div className="success-icon">✅</div>
              <h3>🎉 2FA Successfully Enabled!</h3>
              <p>Your account is now protected with two-factor authentication.</p>
              
              <div className="backup-codes-section">
                <h4>🔑 Backup Codes</h4>
                <p>Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
                
                <div className="backup-codes">
                  {twoFactorState.backupCodes.map((code, index) => (
                    <div key={index} className="backup-code">
                      <span className="code-number">{index + 1}.</span>
                      <code>{code}</code>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="btn btn-secondary"
                  onClick={downloadBackupCodes}
                >
                  💾 Download Backup Codes
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {step === 'overview' && (
            <>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                Close
              </button>
              {twoFactorState.isEnabled ? (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={disable2FA}
                  disabled={isLoading}
                >
                  {isLoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={generateSetupData}
                  disabled={isLoading}
                >
                  {isLoading ? 'Preparing...' : 'Enable 2FA'}
                </button>
              )}
            </>
          )}

          {step === 'setup' && (
            <>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setStep('overview')}
              >
                Back
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setStep('verify')}
              >
                I've Added the Account
              </button>
            </>
          )}

          {step === 'verify' && (
            <>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setStep('setup')}
              >
                Back
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={verifySetup}
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </>
          )}

          {step === 'complete' && (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={onClose}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </>
  );
};