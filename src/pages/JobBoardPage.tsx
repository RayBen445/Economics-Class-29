import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Remote';
  salaryRange: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationDeadline?: string;
  applicationUrl?: string;
  contactEmail?: string;
  postedBy: string;
  posterName: string;
  postedAt: number;
  isActive: boolean;
  applicants: string[];
  category: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
}

interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  appliedAt: number;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Rejected' | 'Accepted';
  coverLetter?: string;
  resumeUrl?: string;
}

interface JobBoardPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const JobBoardPage: React.FC<JobBoardPageProps> = ({ profile, setRoute }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time' as const,
    salaryRange: '',
    description: '',
    requirements: [''],
    benefits: [''],
    applicationDeadline: '',
    applicationUrl: '',
    contactEmail: '',
    category: 'finance',
    experienceLevel: 'Entry' as const,
    isActive: true
  });
  const [newApplication, setNewApplication] = useState({
    coverLetter: '',
    resumeUrl: ''
  });

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];
  const experienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];
  const categories = [
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'government', label: 'Government' },
    { value: 'research', label: 'Research & Analysis' },
    { value: 'education', label: 'Education' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadJobData();
  }, []);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const [jobsData, applicationsData, usersData] = await Promise.all([
        getCollection('jobs', 'postedAt'),
        getCollection('jobApplications'),
        getAllUsers()
      ]);
      
      setJobs(jobsData);
      setApplications(applicationsData.filter((app: any) => app.applicantId === profile.uid));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description) return;

    try {
      const posterUser = users.find(u => u.uid === profile.uid);
      
      await addDocument('jobs', {
        ...newJob,
        postedBy: profile.uid,
        posterName: posterUser?.fullName || profile.fullName,
        applicants: [],
        requirements: newJob.requirements.filter(req => req.trim()),
        benefits: newJob.benefits.filter(benefit => benefit.trim())
      });
      
      setNewJob({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        salaryRange: '',
        description: '',
        requirements: [''],
        benefits: [''],
        applicationDeadline: '',
        applicationUrl: '',
        contactEmail: '',
        category: 'finance',
        experienceLevel: 'Entry',
        isActive: true
      });
      setShowPostForm(false);
      await loadJobData();
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  const handleApplyToJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !newApplication.coverLetter) return;

    try {
      await addDocument('jobApplications', {
        jobId: selectedJob.id,
        applicantId: profile.uid,
        status: 'Applied',
        ...newApplication
      });

      // Update job's applicants list
      const updatedApplicants = [...selectedJob.applicants, profile.uid];
      await updateDocument('jobs', selectedJob.id, { applicants: updatedApplicants });
      
      setNewApplication({ coverLetter: '', resumeUrl: '' });
      setShowApplicationForm(false);
      setSelectedJob(null);
      await loadJobData();
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const getFilteredJobs = () => {
    let filtered = jobs.filter(job => job.isActive);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.requirements.some(req => req.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(job => job.category === categoryFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    return filtered.sort((a, b) => b.postedAt - a.postedAt);
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  };

  const isJobExpired = (job: Job) => {
    if (!job.applicationDeadline) return false;
    return new Date(job.applicationDeadline) < new Date();
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  const addRequirement = () => {
    setNewJob({ ...newJob, requirements: [...newJob.requirements, ''] });
  };

  const removeRequirement = (index: number) => {
    if (newJob.requirements.length > 1) {
      const newRequirements = newJob.requirements.filter((_, i) => i !== index);
      setNewJob({ ...newJob, requirements: newRequirements });
    }
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...newJob.requirements];
    newRequirements[index] = value;
    setNewJob({ ...newJob, requirements: newRequirements });
  };

  const addBenefit = () => {
    setNewJob({ ...newJob, benefits: [...newJob.benefits, ''] });
  };

  const removeBenefit = (index: number) => {
    if (newJob.benefits.length > 1) {
      const newBenefits = newJob.benefits.filter((_, i) => i !== index);
      setNewJob({ ...newJob, benefits: newBenefits });
    }
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...newJob.benefits];
    newBenefits[index] = value;
    setNewJob({ ...newJob, benefits: newBenefits });
  };

  const getLocations = () => {
    const locations = [...new Set(jobs.map(j => j.location))];
    return locations.sort();
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading job board...</p>
        </div>
      </div>
    );
  }

  if (selectedJob) {
    const hasUserApplied = hasApplied(selectedJob.id);
    const isExpired = isJobExpired(selectedJob);
    const application = applications.find(app => app.jobId === selectedJob.id);

    return (
      <div className="page">
        <div className="page-header">
          <button 
            onClick={() => setSelectedJob(null)}
            className="btn-secondary"
          >
            ← Back to Jobs
          </button>
          <h2>{selectedJob.title}</h2>
        </div>

        <div className="job-detail">
          <div className="job-header">
            <div className="job-company-info">
              <h1 className="job-title">{selectedJob.title}</h1>
              <h2 className="job-company">{selectedJob.company}</h2>
              <div className="job-meta">
                <span className="job-location">📍 {selectedJob.location}</span>
                <span className="job-type">{selectedJob.type}</span>
                <span className="job-experience">{selectedJob.experienceLevel} Level</span>
                {selectedJob.salaryRange && (
                  <span className="job-salary">💰 {selectedJob.salaryRange}</span>
                )}
              </div>
            </div>
            
            <div className="job-actions">
              {!hasUserApplied && !isExpired && (
                <button 
                  onClick={() => setShowApplicationForm(true)}
                  className="btn-primary btn-large"
                >
                  Apply Now
                </button>
              )}
              
              {hasUserApplied && (
                <div className="application-status">
                  <span className={`status-badge ${application?.status.toLowerCase().replace(' ', '-')}`}>
                    {application?.status}
                  </span>
                  <span className="applied-text">Applied {formatTimeAgo(application?.appliedAt || 0)}</span>
                </div>
              )}
              
              {isExpired && (
                <span className="expired-badge">Application Deadline Passed</span>
              )}
            </div>
          </div>

          <div className="job-content">
            <div className="job-section">
              <h3>Job Description</h3>
              <p className="job-description">{selectedJob.description}</p>
            </div>

            {selectedJob.requirements.length > 0 && (
              <div className="job-section">
                <h3>Requirements</h3>
                <ul className="job-requirements">
                  {selectedJob.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.benefits.length > 0 && (
              <div className="job-section">
                <h3>Benefits</h3>
                <ul className="job-benefits">
                  {selectedJob.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="job-section">
              <h3>Application Information</h3>
              <div className="application-info">
                {selectedJob.applicationDeadline && (
                  <div className="info-item">
                    <strong>Application Deadline:</strong> {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
                  </div>
                )}
                {selectedJob.contactEmail && (
                  <div className="info-item">
                    <strong>Contact:</strong> <a href={`mailto:${selectedJob.contactEmail}`}>{selectedJob.contactEmail}</a>
                  </div>
                )}
                <div className="info-item">
                  <strong>Applicants:</strong> {selectedJob.applicants.length} people have applied
                </div>
                <div className="info-item">
                  <strong>Posted:</strong> {formatTimeAgo(selectedJob.postedAt)} by {selectedJob.posterName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredJobs = getFilteredJobs();
  const locations = getLocations();

  return (
    <div className="page">
      <div className="page-header">
        <h2>💼 Job Board</h2>
        <p className="page-description">Discover career opportunities and internships.</p>
      </div>

      <div className="jobs-controls">
        <div className="jobs-filters">
          <input
            type="text"
            placeholder="Search jobs by title, company, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {jobTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setShowPostForm(true)}
          className="btn-primary"
        >
          + Post Job
        </button>
      </div>

      <div className="jobs-stats">
        <div className="stat-item">
          <span className="stat-label">Total Jobs</span>
          <span className="stat-value">{jobs.filter(j => j.isActive).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Your Applications</span>
          <span className="stat-value">{applications.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">New This Week</span>
          <span className="stat-value">
            {jobs.filter(j => j.isActive && (Date.now() - j.postedAt) < 7 * 24 * 60 * 60 * 1000).length}
          </span>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>No jobs found</h3>
          <p>Try adjusting your search filters or check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="jobs-list">
          {filteredJobs.map((job) => {
            const hasUserApplied = hasApplied(job.id);
            const isExpired = isJobExpired(job);

            return (
              <div 
                key={job.id} 
                className={`job-card ${hasUserApplied ? 'applied' : ''} ${isExpired ? 'expired' : ''}`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="job-card-header">
                  <div className="job-basic-info">
                    <h3 className="job-title">{job.title}</h3>
                    <h4 className="job-company">{job.company}</h4>
                    <div className="job-location-type">
                      <span className="job-location">📍 {job.location}</span>
                      <span className="job-type-badge">{job.type}</span>
                    </div>
                  </div>
                  
                  <div className="job-indicators">
                    {hasUserApplied && (
                      <span className="applied-indicator">✅ Applied</span>
                    )}
                    {isExpired && (
                      <span className="expired-indicator">⏰ Expired</span>
                    )}
                  </div>
                </div>

                <p className="job-description-preview">
                  {job.description.substring(0, 150)}
                  {job.description.length > 150 && '...'}
                </p>

                <div className="job-requirements-preview">
                  <strong>Key Requirements:</strong>
                  <ul>
                    {job.requirements.slice(0, 2).map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                    {job.requirements.length > 2 && (
                      <li>+{job.requirements.length - 2} more requirements</li>
                    )}
                  </ul>
                </div>

                <div className="job-card-footer">
                  <div className="job-meta">
                    <span className="job-experience">{job.experienceLevel} Level</span>
                    {job.salaryRange && (
                      <span className="job-salary">💰 {job.salaryRange}</span>
                    )}
                    <span className="job-category">
                      {categories.find(c => c.value === job.category)?.label}
                    </span>
                  </div>
                  
                  <div className="job-stats">
                    <span className="applicants-count">
                      {job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}
                    </span>
                    <span className="posted-time">
                      Posted {formatTimeAgo(job.postedAt)}
                    </span>
                  </div>
                </div>

                {job.applicationDeadline && (
                  <div className="deadline-info">
                    <strong>Deadline:</strong> {new Date(job.applicationDeadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showPostForm && (
        <div className="modal-overlay" onClick={() => setShowPostForm(false)}>
          <div className="modal-content large-modal job-poster" onClick={(e) => e.stopPropagation()}>
            <h3>Post New Job</h3>
            <form onSubmit={handlePostJob}>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="e.g., Lagos, Nigeria"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value as any })}
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newJob.category}
                    onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    value={newJob.experienceLevel}
                    onChange={(e) => setNewJob({ ...newJob, experienceLevel: e.target.value as any })}
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Salary Range (optional)</label>
                <input
                  type="text"
                  value={newJob.salaryRange}
                  onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                  placeholder="e.g., ₦150,000 - ₦250,000 per month"
                />
              </div>
              
              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Requirements</label>
                {newJob.requirements.map((requirement, index) => (
                  <div key={index} className="dynamic-field">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="btn-secondary btn-sm"
                >
                  + Add Requirement
                </button>
              </div>
              
              <div className="form-group">
                <label>Benefits</label>
                {newJob.benefits.map((benefit, index) => (
                  <div key={index} className="dynamic-field">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder={`Benefit ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBenefit}
                  className="btn-secondary btn-sm"
                >
                  + Add Benefit
                </button>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Application Deadline (optional)</label>
                  <input
                    type="date"
                    value={newJob.applicationDeadline}
                    onChange={(e) => setNewJob({ ...newJob, applicationDeadline: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={newJob.contactEmail}
                    onChange={(e) => setNewJob({ ...newJob, contactEmail: e.target.value })}
                    placeholder="hr@company.com"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowPostForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationForm && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowApplicationForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Apply to {selectedJob.title}</h3>
            <form onSubmit={handleApplyToJob}>
              <div className="form-group">
                <label>Cover Letter</label>
                <textarea
                  value={newApplication.coverLetter}
                  onChange={(e) => setNewApplication({ ...newApplication, coverLetter: e.target.value })}
                  rows={6}
                  placeholder="Write a compelling cover letter explaining why you're the perfect fit for this role..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Resume URL (optional)</label>
                <input
                  type="url"
                  value={newApplication.resumeUrl}
                  onChange={(e) => setNewApplication({ ...newApplication, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/your-resume"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowApplicationForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};