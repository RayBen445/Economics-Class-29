import React, { useState } from 'react';
import { SupportModal } from './SupportModal';

export const SupportButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="support-button"
        onClick={() => setIsModalOpen(true)}
        title="Get Help & Support"
        aria-label="Open support chat"
      >
        <span className="support-icon">🆘</span>
        <span className="support-text">Support</span>
      </button>

      {isModalOpen && (
        <SupportModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};