import React, { ReactNode } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: ReactNode;
    confirmText?: string;
    cancelText?: string;
    dangerConfirm?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    children,
    confirmText = "Confirm",
    cancelText = "Cancel", 
    dangerConfirm = false
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="form-actions">
                    <button onClick={onClose} className="btn-tertiary">{cancelText}</button>
                    <button 
                        onClick={handleConfirm} 
                        className={dangerConfirm ? "btn-danger" : "btn-primary"}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;