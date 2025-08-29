import React, { useState, useEffect } from 'react';
import { UserProfile, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface MembersDirectoryPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const MembersDirectoryPage: React.FC<MembersDirectoryPageProps> = ({ profile, setRoute }) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, roleFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setMembers(allUsers);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.fullName.toLowerCase().includes(term) ||
        member.username.toLowerCase().includes(term) ||
        member.matricNumber.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  };

  const handleMessageUser = (memberUid: string) => {
    setRoute({ page: 'messages', selectedUser: memberUid });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>👥 Members Directory</h2>
        <p className="page-description">Connect with fellow students and faculty members.</p>
      </div>

      <div className="directory-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, username, matric number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Members</option>
            <option value="Student">Students</option>
            <option value="Admin">Administrators</option>
            <option value="Class President">Class Presidents</option>
          </select>
        </div>
      </div>

      <div className="members-stats">
        <div className="stat-card">
          <span className="stat-number">{filteredMembers.length}</span>
          <span className="stat-label">
            {roleFilter === 'all' ? 'Total Members' : `${roleFilter}s`}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{members.filter(m => m.role === 'Student').length}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{members.filter(m => m.role === 'Admin').length}</span>
          <span className="stat-label">Admins</span>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No members found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="members-grid">
          {filteredMembers.map((member) => (
            <div key={member.uid} className="member-card">
              <div className="member-avatar">
                {member.profilePicture ? (
                  <img src={member.profilePicture} alt={member.fullName} />
                ) : (
                  <div className="avatar-placeholder">
                    {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="member-info">
                <h3 className="member-name">{member.fullName}</h3>
                <p className="member-username">@{member.username}</p>
                <p className="member-matric">{member.matricNumber}</p>
                
                <div className="member-role">
                  <span className={`role-badge ${member.role.toLowerCase().replace(' ', '-')}`}>
                    {member.role}
                  </span>
                </div>
                
                <div className="member-status">
                  <span className={`status-badge ${member.status}`}>
                    {member.status}
                  </span>
                </div>
              </div>
              
              <div className="member-actions">
                {member.uid !== profile.uid && (
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => handleMessageUser(member.uid)}
                  >
                    💌 Message
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};