import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument } from '../utils/firebase';
import { Route } from '../types';

interface Assignment {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseName: string;
  dueDate: string;
  dueTime: string;
  maxScore: number;
  attachments: string[];
  instructions: string;
  submissionFormat: string;
  createdBy: string;
  createdAt: number;
  isPublished: boolean;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: number;
  content: string;
  attachments: string[];
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
}

interface AssignmentsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({ profile, setRoute }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    courseCode: '',
    courseName: '',
    dueDate: '',
    dueTime: '23:59',
    maxScore: 100,
    instructions: '',
    submissionFormat: 'text',
    isPublished: true
  });
  const [newSubmission, setNewSubmission] = useState({
    content: '',
    attachments: [] as string[]
  });

  const submissionFormats = [
    { value: 'text', label: 'Text Submission' },
    { value: 'file', label: 'File Upload' },
    { value: 'both', label: 'Text + File' },
    { value: 'link', label: 'URL/Link' }
  ];

  useEffect(() => {
    loadAssignmentData();
  }, []);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, submissionsData] = await Promise.all([
        getCollection('assignments', 'dueDate'),
        getCollection('submissions')
      ]);
      
      setAssignments(assignmentsData);
      setSubmissions(submissionsData.filter((sub: any) => sub.studentId === profile.uid));
    } catch (error) {
      console.error('Error loading assignment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.courseCode || !newAssignment.dueDate) return;

    try {
      await addDocument('assignments', {
        ...newAssignment,
        attachments: [],
        createdBy: profile.uid
      });
      
      setNewAssignment({
        title: '',
        description: '',
        courseCode: '',
        courseName: '',
        dueDate: '',
        dueTime: '23:59',
        maxScore: 100,
        instructions: '',
        submissionFormat: 'text',
        isPublished: true
      });
      setShowCreateForm(false);
      await loadAssignmentData();
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubmission.content.trim() || !selectedAssignment) return;

    try {
      const isLate = new Date() > new Date(`${selectedAssignment.dueDate}T${selectedAssignment.dueTime}`);
      
      await addDocument('submissions', {
        assignmentId: selectedAssignment.id,
        studentId: profile.uid,
        submittedAt: Date.now(),
        content: newSubmission.content,
        attachments: newSubmission.attachments,
        status: isLate ? 'late' : 'submitted'
      });
      
      setNewSubmission({ content: '', attachments: [] });
      setShowSubmissionForm(false);
      setSelectedAssignment(null);
      await loadAssignmentData();
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  const getFilteredAssignments = () => {
    let filtered = assignments.filter(assignment => assignment.isPublished);

    if (filterCourse !== 'all') {
      filtered = filtered.filter(assignment => assignment.courseCode === filterCourse);
    }

    if (filterStatus === 'pending') {
      filtered = filtered.filter(assignment => 
        !submissions.some(sub => sub.assignmentId === assignment.id)
      );
    } else if (filterStatus === 'submitted') {
      filtered = filtered.filter(assignment => 
        submissions.some(sub => sub.assignmentId === assignment.id)
      );
    } else if (filterStatus === 'overdue') {
      const now = new Date();
      filtered = filtered.filter(assignment => {
        const dueDateTime = new Date(`${assignment.dueDate}T${assignment.dueTime}`);
        const hasSubmission = submissions.some(sub => sub.assignmentId === assignment.id);
        return dueDateTime < now && !hasSubmission;
      });
    }

    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    const submission = submissions.find(sub => sub.assignmentId === assignment.id);
    const now = new Date();
    const dueDateTime = new Date(`${assignment.dueDate}T${assignment.dueTime}`);

    if (submission) {
      return {
        status: submission.status,
        text: submission.status === 'graded' ? 'Graded' : 
              submission.status === 'late' ? 'Submitted Late' : 'Submitted',
        className: submission.status === 'graded' ? 'graded' : 
                  submission.status === 'late' ? 'late' : 'submitted'
      };
    }

    if (dueDateTime < now) {
      return { status: 'overdue', text: 'Overdue', className: 'overdue' };
    }

    return { status: 'pending', text: 'Pending', className: 'pending' };
  };

  const formatTimeRemaining = (dueDate: string, dueTime: string) => {
    const now = new Date();
    const due = new Date(`${dueDate}T${dueTime}`);
    const diff = due.getTime() - now.getTime();

    if (diff <= 0) return 'Overdue';

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Due soon';
  };

  const getCourses = () => {
    const courses = [...new Set(assignments.map(a => a.courseCode))];
    return courses.sort();
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (selectedAssignment) {
    const submission = submissions.find(sub => sub.assignmentId === selectedAssignment.id);
    const status = getSubmissionStatus(selectedAssignment);

    return (
      <div className="page">
        <div className="page-header">
          <button 
            onClick={() => setSelectedAssignment(null)}
            className="btn-secondary"
          >
            ← Back to Assignments
          </button>
          <h2>{selectedAssignment.title}</h2>
        </div>

        <div className="assignment-detail">
          <div className="assignment-info">
            <div className="assignment-meta">
              <span className="course-code">{selectedAssignment.courseCode}</span>
              <span className="course-name">{selectedAssignment.courseName}</span>
              <span className={`status-badge ${status.className}`}>{status.text}</span>
            </div>

            <div className="assignment-timing">
              <div className="due-date">
                <strong>Due:</strong> {new Date(selectedAssignment.dueDate).toLocaleDateString()} at {selectedAssignment.dueTime}
              </div>
              <div className="time-remaining">
                {formatTimeRemaining(selectedAssignment.dueDate, selectedAssignment.dueTime)}
              </div>
              <div className="max-score">
                <strong>Max Score:</strong> {selectedAssignment.maxScore} points
              </div>
            </div>
          </div>

          <div className="assignment-content">
            <div className="section">
              <h4>Description</h4>
              <p>{selectedAssignment.description}</p>
            </div>

            {selectedAssignment.instructions && (
              <div className="section">
                <h4>Instructions</h4>
                <p>{selectedAssignment.instructions}</p>
              </div>
            )}

            <div className="section">
              <h4>Submission Format</h4>
              <p>{submissionFormats.find(f => f.value === selectedAssignment.submissionFormat)?.label}</p>
            </div>
          </div>

          {submission ? (
            <div className="submission-status">
              <h4>Your Submission</h4>
              <div className="submission-details">
                <div className="submission-meta">
                  <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                  <span className={`status ${submission.status}`}>{status.text}</span>
                </div>
                <div className="submission-content">
                  <p>{submission.content}</p>
                </div>
                {submission.score !== undefined && (
                  <div className="submission-grade">
                    <strong>Score: {submission.score}/{selectedAssignment.maxScore}</strong>
                  </div>
                )}
                {submission.feedback && (
                  <div className="submission-feedback">
                    <h5>Feedback:</h5>
                    <p>{submission.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="submission-actions">
              {status.status !== 'overdue' && (
                <button 
                  onClick={() => setShowSubmissionForm(true)}
                  className="btn-primary"
                >
                  Submit Assignment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredAssignments = getFilteredAssignments();
  const courses = getCourses();

  return (
    <div className="page">
      <div className="page-header">
        <h2>📝 Assignments</h2>
        <p className="page-description">View and submit your course assignments.</p>
      </div>

      <div className="assignments-controls">
        <div className="assignments-filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Assignments</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        {(profile.role === 'Admin' || profile.role === 'Class President') && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            + Create Assignment
          </button>
        )}
      </div>

      <div className="assignments-stats">
        <div className="stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-value">{assignments.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending</span>
          <span className="stat-value">
            {assignments.filter(a => getSubmissionStatus(a).status === 'pending').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Submitted</span>
          <span className="stat-value">
            {submissions.length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Overdue</span>
          <span className="stat-value">
            {assignments.filter(a => getSubmissionStatus(a).status === 'overdue').length}
          </span>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No assignments found</h3>
          <p>No assignments match your current filters.</p>
        </div>
      ) : (
        <div className="assignments-list">
          {filteredAssignments.map((assignment) => {
            const status = getSubmissionStatus(assignment);
            return (
              <div 
                key={assignment.id} 
                className={`assignment-card ${status.className}`}
                onClick={() => setSelectedAssignment(assignment)}
              >
                <div className="assignment-header">
                  <h3 className="assignment-title">{assignment.title}</h3>
                  <span className={`status-badge ${status.className}`}>
                    {status.text}
                  </span>
                </div>

                <div className="assignment-meta">
                  <span className="course-info">
                    {assignment.courseCode} - {assignment.courseName}
                  </span>
                  <span className="assignment-score">{assignment.maxScore} points</span>
                </div>

                <p className="assignment-description">{assignment.description}</p>

                <div className="assignment-footer">
                  <div className="due-info">
                    <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()} at {assignment.dueTime}
                  </div>
                  <div className="time-remaining">
                    {formatTimeRemaining(assignment.dueDate, assignment.dueTime)}
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
            <h3>Create New Assignment</h3>
            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label>Assignment Title</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={newAssignment.courseCode}
                    onChange={(e) => setNewAssignment({ ...newAssignment, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., ECO 201"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={newAssignment.courseName}
                    onChange={(e) => setNewAssignment({ ...newAssignment, courseName: e.target.value })}
                    placeholder="e.g., Microeconomic Theory"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Instructions</label>
                <textarea
                  value={newAssignment.instructions}
                  onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                  rows={4}
                  placeholder="Detailed instructions for the assignment..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Due Time</label>
                  <input
                    type="time"
                    value={newAssignment.dueTime}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Max Score</label>
                  <input
                    type="number"
                    value={newAssignment.maxScore}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxScore: Number(e.target.value) })}
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div className="form-group">
                  <label>Submission Format</label>
                  <select
                    value={newAssignment.submissionFormat}
                    onChange={(e) => setNewAssignment({ ...newAssignment, submissionFormat: e.target.value })}
                  >
                    {submissionFormats.map(format => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newAssignment.isPublished}
                    onChange={(e) => setNewAssignment({ ...newAssignment, isPublished: e.target.checked })}
                  />
                  Publish immediately
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmissionForm && selectedAssignment && (
        <div className="modal-overlay" onClick={() => setShowSubmissionForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Assignment: {selectedAssignment.title}</h3>
            <form onSubmit={handleSubmitAssignment}>
              <div className="form-group">
                <label>Your Submission</label>
                <textarea
                  value={newSubmission.content}
                  onChange={(e) => setNewSubmission({ ...newSubmission, content: e.target.value })}
                  rows={6}
                  placeholder="Enter your assignment response here..."
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowSubmissionForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};