import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  courseCode: string;
  createdBy: string;
  creatorName: string;
  members: string[];
  maxMembers: number;
  meetingSchedule: string;
  location: string;
  isPublic: boolean;
  tags: string[];
  createdAt: number;
  isActive: boolean;
}

interface StudyGroupsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const StudyGroupsPage: React.FC<StudyGroupsPageProps> = ({ profile, setRoute }) => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    courseCode: '',
    maxMembers: 10,
    meetingSchedule: '',
    location: '',
    isPublic: true,
    tags: ''
  });

  useEffect(() => {
    loadStudyGroupsData();
  }, []);

  const loadStudyGroupsData = async () => {
    try {
      setLoading(true);
      const [groupsData, usersData] = await Promise.all([
        getCollection('studyGroups', 'createdAt'),
        getAllUsers()
      ]);
      
      setStudyGroups(groupsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading study groups data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name || !newGroup.subject || !newGroup.description) return;

    try {
      await addDocument('studyGroups', {
        ...newGroup,
        createdBy: profile.uid,
        creatorName: profile.fullName,
        members: [profile.uid], // Creator is automatically a member
        tags: newGroup.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isActive: true
      });
      
      setNewGroup({
        name: '',
        description: '',
        subject: '',
        courseCode: '',
        maxMembers: 10,
        meetingSchedule: '',
        location: '',
        isPublic: true,
        tags: ''
      });
      setShowCreateForm(false);
      await loadStudyGroupsData();
    } catch (error) {
      console.error('Error creating study group:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    if (group.members.length >= group.maxMembers) {
      alert('This study group is at capacity');
      return;
    }

    if (group.members.includes(profile.uid)) {
      alert('You are already a member of this group');
      return;
    }

    try {
      const updatedMembers = [...group.members, profile.uid];
      await updateDocument('studyGroups', groupId, { members: updatedMembers });
      await loadStudyGroupsData();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    try {
      const updatedMembers = group.members.filter(id => id !== profile.uid);
      await updateDocument('studyGroups', groupId, { members: updatedMembers });
      
      // If creator leaves, transfer ownership to first member or deactivate
      if (group.createdBy === profile.uid) {
        if (updatedMembers.length > 0) {
          const newCreator = users.find(u => u.uid === updatedMembers[0]);
          await updateDocument('studyGroups', groupId, { 
            createdBy: updatedMembers[0],
            creatorName: newCreator?.fullName || 'Unknown'
          });
        } else {
          await updateDocument('studyGroups', groupId, { isActive: false });
        }
      }
      
      await loadStudyGroupsData();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const getFilteredGroups = () => {
    let filtered = studyGroups.filter(group => 
      group.isActive && (group.isPublic || group.members.includes(profile.uid))
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(term) ||
        group.description.toLowerCase().includes(term) ||
        group.subject.toLowerCase().includes(term) ||
        group.courseCode.toLowerCase().includes(term) ||
        group.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(group => 
        group.subject.toLowerCase().includes(subjectFilter.toLowerCase())
      );
    }

    if (statusFilter === 'myGroups') {
      filtered = filtered.filter(group => group.members.includes(profile.uid));
    } else if (statusFilter === 'available') {
      filtered = filtered.filter(group => 
        !group.members.includes(profile.uid) && group.members.length < group.maxMembers
      );
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading study groups...</p>
        </div>
      </div>
    );
  }

  const filteredGroups = getFilteredGroups();

  return (
    <div className="page">
      <div className="page-header">
        <h2>👨‍👩‍👧‍👦 Study Groups</h2>
        <p className="page-description">Join collaborative study groups or create your own learning community.</p>
      </div>

      <div className="study-groups-controls">
        <div className="study-groups-filters">
          <input
            type="text"
            placeholder="Search study groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Groups</option>
            <option value="myGroups">My Groups</option>
            <option value="available">Available to Join</option>
          </select>
        </div>

        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          + Create Study Group
        </button>
      </div>

      <div className="study-groups-stats">
        <div className="stat-item">
          <span className="stat-label">Total Groups</span>
          <span className="stat-value">{studyGroups.filter(g => g.isActive).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Your Groups</span>
          <span className="stat-value">
            {studyGroups.filter(g => g.members.includes(profile.uid)).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Available</span>
          <span className="stat-value">
            {studyGroups.filter(g => 
              g.isActive && !g.members.includes(profile.uid) && g.members.length < g.maxMembers
            ).length}
          </span>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍👩‍👧‍👦</div>
          <h3>No study groups found</h3>
          <p>Create a study group or adjust your search filters.</p>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            Create First Study Group
          </button>
        </div>
      ) : (
        <div className="study-groups-grid">
          {filteredGroups.map((group) => {
            const isMember = group.members.includes(profile.uid);
            const isCreator = group.createdBy === profile.uid;
            const isFull = group.members.length >= group.maxMembers;

            return (
              <div 
                key={group.id} 
                className={`study-group-card ${isMember ? 'member' : ''}`}
              >
                <div className="group-card-header">
                  <h3 className="group-name">{group.name}</h3>
                  <div className="group-indicators">
                    {isCreator && <span className="creator-indicator">Creator</span>}
                    {isMember && !isCreator && <span className="member-indicator">Member</span>}
                    {isFull && !isMember && <span className="full-indicator">Full</span>}
                  </div>
                </div>

                <p className="group-description">{group.description}</p>

                <div className="group-meta">
                  <div className="group-subject-info">
                    <span className="group-subject">{group.subject}</span>
                    {group.courseCode && (
                      <span className="group-course">{group.courseCode}</span>
                    )}
                  </div>
                </div>

                <div className="group-details">
                  {group.meetingSchedule && (
                    <div className="detail-item">
                      <strong>Meets:</strong> {group.meetingSchedule}
                    </div>
                  )}
                  {group.location && (
                    <div className="detail-item">
                      <strong>Location:</strong> {group.location}
                    </div>
                  )}
                </div>

                <div className="group-footer">
                  <div className="group-size">
                    👥 {group.members.length}/{group.maxMembers} members
                  </div>
                  
                  <div className="group-actions">
                    {!isMember && !isFull && (
                      <button 
                        onClick={() => handleJoinGroup(group.id)}
                        className="btn-primary btn-sm"
                      >
                        Join
                      </button>
                    )}
                    
                    {isMember && (
                      <button 
                        onClick={() => handleLeaveGroup(group.id)}
                        className="btn-secondary btn-sm"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Study Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Microeconomics Study Circle"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the purpose and goals of your study group..."
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={newGroup.subject}
                    onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
                    placeholder="e.g., Microeconomics"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Course Code (optional)</label>
                  <input
                    type="text"
                    value={newGroup.courseCode}
                    onChange={(e) => setNewGroup({ ...newGroup, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., ECO 201"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Max Members</label>
                  <select
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup({ ...newGroup, maxMembers: Number(e.target.value) })}
                  >
                    <option value={5}>5 members</option>
                    <option value={10}>10 members</option>
                    <option value={15}>15 members</option>
                    <option value={20}>20 members</option>
                    <option value={30}>30 members</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Meeting Schedule (optional)</label>
                <input
                  type="text"
                  value={newGroup.meetingSchedule}
                  onChange={(e) => setNewGroup({ ...newGroup, meetingSchedule: e.target.value })}
                  placeholder="e.g., Tuesdays and Thursdays 3-5 PM"
                />
              </div>
              
              <div className="form-group">
                <label>Location (optional)</label>
                <input
                  type="text"
                  value={newGroup.location}
                  onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                  placeholder="e.g., Library Study Room 3, Virtual (Zoom)"
                />
              </div>
              
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newGroup.tags}
                  onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                  placeholder="e.g., exam prep, assignments, peer support"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newGroup.isPublic}
                    onChange={(e) => setNewGroup({ ...newGroup, isPublic: e.target.checked })}
                  />
                  Make this group public (visible to all students)
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Study Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};