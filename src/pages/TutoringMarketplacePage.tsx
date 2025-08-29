import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface TutorProfile {
  id: string;
  tutorId: string;
  tutorName: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  experience: string;
  availability: string[];
  rating: number;
  reviewCount: number;
  totalSessions: number;
  isAvailable: boolean;
  contactMethod: 'inApp' | 'email' | 'phone';
  contactInfo: string;
  createdAt: number;
}

interface TutoringRequest {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  topic: string;
  preferredTime: string;
  duration: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  requestedAt: number;
}

interface TutoringMarketplacePageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const TutoringMarketplacePage: React.FC<TutoringMarketplacePageProps> = ({ profile, setRoute }) => {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [requests, setRequests] = useState<TutoringRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'browse' | 'myRequests' | 'myTutoring'>('browse');
  const [newTutorProfile, setNewTutorProfile] = useState({
    bio: '',
    subjects: [''],
    hourlyRate: 2000,
    experience: '',
    availability: [''],
    contactMethod: 'inApp' as const,
    contactInfo: ''
  });
  const [newRequest, setNewRequest] = useState({
    subject: '',
    topic: '',
    preferredTime: '',
    duration: 1,
    message: ''
  });

  const commonSubjects = [
    'Microeconomics', 'Macroeconomics', 'Econometrics', 'Development Economics',
    'International Economics', 'Public Economics', 'Financial Economics',
    'Agricultural Economics', 'Industrial Economics', 'Labor Economics',
    'Mathematics', 'Statistics', 'Accounting', 'Finance'
  ];

  useEffect(() => {
    loadTutoringData();
  }, []);

  const loadTutoringData = async () => {
    try {
      setLoading(true);
      const [tutorsData, requestsData, usersData] = await Promise.all([
        getCollection('tutorProfiles'),
        getCollection('tutoringRequests'),
        getAllUsers()
      ]);
      
      setTutors(tutorsData);
      setRequests(requestsData.filter((req: any) => 
        req.studentId === profile.uid || req.tutorId === profile.uid
      ));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading tutoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAsTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutorProfile.bio || newTutorProfile.subjects.filter(s => s.trim()).length === 0) return;

    try {
      await addDocument('tutorProfiles', {
        ...newTutorProfile,
        tutorId: profile.uid,
        tutorName: profile.fullName,
        subjects: newTutorProfile.subjects.filter(s => s.trim()),
        availability: newTutorProfile.availability.filter(a => a.trim()),
        rating: 0,
        reviewCount: 0,
        totalSessions: 0,
        isAvailable: true
      });
      
      setNewTutorProfile({
        bio: '',
        subjects: [''],
        hourlyRate: 2000,
        experience: '',
        availability: [''],
        contactMethod: 'inApp',
        contactInfo: ''
      });
      setShowRegisterForm(false);
      await loadTutoringData();
    } catch (error) {
      console.error('Error registering as tutor:', error);
    }
  };

  const handleRequestTutoring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.subject || !newRequest.topic || !selectedTutor) return;

    try {
      await addDocument('tutoringRequests', {
        ...newRequest,
        studentId: profile.uid,
        tutorId: selectedTutor.tutorId,
        status: 'pending'
      });
      
      setNewRequest({
        subject: '',
        topic: '',
        preferredTime: '',
        duration: 1,
        message: ''
      });
      setShowRequestForm(false);
      setSelectedTutor(null);
      await loadTutoringData();
    } catch (error) {
      console.error('Error requesting tutoring:', error);
    }
  };

  const getFilteredTutors = () => {
    let filtered = tutors.filter(tutor => tutor.isAvailable);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tutor => 
        tutor.tutorName.toLowerCase().includes(term) ||
        tutor.bio.toLowerCase().includes(term) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(term))
      );
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(tutor => 
        tutor.subjects.some(subject => subject.toLowerCase().includes(subjectFilter.toLowerCase()))
      );
    }

    // Sort tutors
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rate') {
      filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => b.totalSessions - a.totalSessions);
    }

    return filtered;
  };

  const isUserTutor = () => {
    return tutors.some(tutor => tutor.tutorId === profile.uid);
  };

  const getUserTutorProfile = () => {
    return tutors.find(tutor => tutor.tutorId === profile.uid);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tutoring marketplace...</p>
        </div>
      </div>
    );
  }

  const filteredTutors = getFilteredTutors();
  const userTutorProfile = getUserTutorProfile();

  return (
    <div className="page">
      <div className="page-header">
        <h2>🎓 Tutoring Marketplace</h2>
        <p className="page-description">Connect with tutors or offer your expertise to help fellow students.</p>
      </div>

      <div className="tutoring-controls">
        <div className="view-modes">
          <button 
            className={viewMode === 'browse' ? 'active' : ''}
            onClick={() => setViewMode('browse')}
          >
            Browse Tutors
          </button>
          <button 
            className={viewMode === 'myRequests' ? 'active' : ''}
            onClick={() => setViewMode('myRequests')}
          >
            My Requests ({requests.filter(r => r.studentId === profile.uid).length})
          </button>
          {isUserTutor() && (
            <button 
              className={viewMode === 'myTutoring' ? 'active' : ''}
              onClick={() => setViewMode('myTutoring')}
            >
              My Tutoring ({requests.filter(r => r.tutorId === profile.uid).length})
            </button>
          )}
        </div>

        <div className="tutoring-actions">
          {!isUserTutor() && (
            <button 
              onClick={() => setShowRegisterForm(true)}
              className="btn-primary"
            >
              Become a Tutor
            </button>
          )}
        </div>
      </div>

      {viewMode === 'browse' && (
        <>
          <div className="tutoring-filters">
            <input
              type="text"
              placeholder="Search tutors by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Subjects</option>
              {commonSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="rating">Highest Rated</option>
              <option value="rate">Lowest Rate</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>

          {filteredTutors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h3>No tutors found</h3>
              <p>Try adjusting your search filters or become a tutor yourself!</p>
            </div>
          ) : (
            <div className="tutors-grid">
              {filteredTutors.map((tutor) => (
                <div key={tutor.id} className="tutor-card">
                  <div className="tutor-header">
                    <div className="tutor-avatar">
                      {tutor.tutorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="tutor-basic-info">
                      <h3>{tutor.tutorName}</h3>
                      <div className="tutor-rating">
                        ⭐ {tutor.rating > 0 ? tutor.rating.toFixed(1) : 'New'} 
                        {tutor.reviewCount > 0 && ` (${tutor.reviewCount} reviews)`}
                      </div>
                      <div className="tutor-rate">₦{tutor.hourlyRate}/hour</div>
                    </div>
                  </div>

                  <p className="tutor-bio">{tutor.bio}</p>

                  <div className="tutor-subjects">
                    <strong>Subjects:</strong>
                    <div className="subjects-tags">
                      {tutor.subjects.slice(0, 3).map((subject, index) => (
                        <span key={index} className="subject-tag">{subject}</span>
                      ))}
                      {tutor.subjects.length > 3 && (
                        <span className="more-subjects">+{tutor.subjects.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {tutor.experience && (
                    <div className="tutor-experience">
                      <strong>Experience:</strong> {tutor.experience}
                    </div>
                  )}

                  <div className="tutor-stats">
                    <span>📚 {tutor.totalSessions} sessions completed</span>
                  </div>

                  <div className="tutor-actions">
                    <button 
                      onClick={() => {
                        setSelectedTutor(tutor);
                        setShowRequestForm(true);
                      }}
                      className="btn-primary"
                    >
                      Request Tutoring
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {viewMode === 'myRequests' && (
        <div className="requests-section">
          <h3>My Tutoring Requests</h3>
          {requests.filter(r => r.studentId === profile.uid).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h4>No tutoring requests yet</h4>
              <p>Browse tutors and request sessions to get started.</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.filter(r => r.studentId === profile.uid).map((request) => {
                const tutor = tutors.find(t => t.tutorId === request.tutorId);
                return (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h4>{request.subject} - {request.topic}</h4>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <p><strong>Tutor:</strong> {tutor?.tutorName}</p>
                    <p><strong>Duration:</strong> {request.duration} hour(s)</p>
                    <p><strong>Preferred Time:</strong> {request.preferredTime}</p>
                    <p><strong>Message:</strong> {request.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewMode === 'myTutoring' && userTutorProfile && (
        <div className="tutoring-dashboard">
          <div className="tutor-profile-summary">
            <h3>Your Tutor Profile</h3>
            <div className="profile-stats">
              <div className="stat">⭐ {userTutorProfile.rating.toFixed(1)} rating</div>
              <div className="stat">📚 {userTutorProfile.totalSessions} sessions</div>
              <div className="stat">₦{userTutorProfile.hourlyRate}/hour</div>
            </div>
          </div>
          
          <h4>Incoming Requests</h4>
          {requests.filter(r => r.tutorId === profile.uid).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📨</div>
              <h4>No tutoring requests yet</h4>
              <p>Students will send you requests when they need help with your subjects.</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.filter(r => r.tutorId === profile.uid).map((request) => {
                const student = users.find(u => u.uid === request.studentId);
                return (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h4>{request.subject} - {request.topic}</h4>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <p><strong>Student:</strong> {student?.fullName}</p>
                    <p><strong>Duration:</strong> {request.duration} hour(s)</p>
                    <p><strong>Preferred Time:</strong> {request.preferredTime}</p>
                    <p><strong>Message:</strong> {request.message}</p>
                    
                    {request.status === 'pending' && (
                      <div className="request-actions">
                        <button className="btn-success btn-sm">Accept</button>
                        <button className="btn-danger btn-sm">Decline</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals remain the same... */}
    </div>
  );
};