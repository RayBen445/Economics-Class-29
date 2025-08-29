import React from 'react';
import { FirebaseUserProfile } from '../types';

interface StudyGroup {
  id: string;
  name: string;
  members: string[];
  admins: string[];
  description: string;
  createdBy: string;
  createdAt: any;
}

interface ManageGroupModalProps {
    group: StudyGroup;
    users: FirebaseUserProfile[];
    onClose: () => void;
    onUpdateGroup: (groupId: string, updates: Partial<StudyGroup>) => void;
}

const ManageGroupModal: React.FC<ManageGroupModalProps> = ({
    group, 
    users, 
    onClose, 
    onUpdateGroup
}) => {
    
    const handleRemoveMember = (userId: string) => {
        const updatedMembers = group.members.filter(id => id !== userId);
        const updatedAdmins = group.admins.filter(id => id !== userId);
        onUpdateGroup(group.id, { 
            members: updatedMembers, 
            admins: updatedAdmins 
        });
    };

    const handlePromoteAdmin = (userId: string) => {
        if (!group.admins.includes(userId)) {
            const updatedAdmins = [...group.admins, userId];
            onUpdateGroup(group.id, { admins: updatedAdmins });
        }
    };

    const handleDemoteAdmin = (userId: string) => {
        const updatedAdmins = group.admins.filter(id => id !== userId);
        onUpdateGroup(group.id, { admins: updatedAdmins });
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
                    <h3>Manage "{group.name}"</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <h4>Members ({group.members.length})</h4>
                    <div className="member-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {group.members.map(memberId => {
                            const member = users.find(u => u.uid === memberId);
                            const isAdmin = group.admins.includes(memberId);
                            const isCreator = group.createdBy === memberId;
                            
                            if (!member) return null;
                            
                            return (
                                <div key={memberId} className="member-management-item">
                                    <div className="member-info">
                                        <span className="member-name">{member.fullName}</span>
                                        <span className="member-role">
                                            {isCreator ? '(Creator)' : isAdmin ? '(Admin)' : '(Member)'}
                                        </span>
                                    </div>
                                    <div className="member-actions">
                                        {!isCreator && (
                                            <>
                                                {!isAdmin ? (
                                                    <button 
                                                        onClick={() => handlePromoteAdmin(memberId)} 
                                                        className="btn-tertiary btn-sm"
                                                    >
                                                        Make Admin
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDemoteAdmin(memberId)} 
                                                        className="btn-tertiary btn-sm"
                                                    >
                                                        Remove Admin
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleRemoveMember(memberId)} 
                                                    className="btn-danger btn-sm"
                                                >
                                                    Remove
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {group.members.length === 0 && (
                        <p className="empty-state">No members in this group yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageGroupModal;