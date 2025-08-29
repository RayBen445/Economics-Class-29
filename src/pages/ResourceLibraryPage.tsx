import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface Resource {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseName: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedBy: string;
  uploaderName: string;
  uploadedAt: number;
  downloads: number;
  tags: string[];
  isPublic: boolean;
  rating: number;
  ratingCount: number;
}

interface ResourceLibraryPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const ResourceLibraryPage: React.FC<ResourceLibraryPageProps> = ({ profile, setRoute }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    courseCode: '',
    courseName: '',
    type: 'notes',
    tags: '',
    isPublic: true,
    fileUrl: '',
    fileName: '',
    fileSize: 0
  });

  const resourceTypes = [
    { value: 'notes', label: 'Study Notes', icon: '📝' },
    { value: 'slides', label: 'Lecture Slides', icon: '📊' },
    { value: 'textbook', label: 'Textbooks', icon: '📚' },
    { value: 'past-papers', label: 'Past Papers', icon: '📄' },
    { value: 'videos', label: 'Video Lectures', icon: '🎥' },
    { value: 'assignments', label: 'Assignment Solutions', icon: '📋' },
    { value: 'articles', label: 'Research Articles', icon: '📰' },
    { value: 'software', label: 'Software/Tools', icon: '💻' },
    { value: 'other', label: 'Other', icon: '📁' }
  ];

  useEffect(() => {
    loadResourceData();
  }, []);

  const loadResourceData = async () => {
    try {
      setLoading(true);
      const [resourcesData, usersData] = await Promise.all([
        getCollection('resources', 'uploadedAt'),
        getAllUsers()
      ]);
      
      setResources(resourcesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading resource data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title || !newResource.courseCode || !newResource.type) return;

    try {
      const uploaderUser = users.find(u => u.uid === profile.uid);
      
      await addDocument('resources', {
        ...newResource,
        uploadedBy: profile.uid,
        uploaderName: uploaderUser?.fullName || profile.fullName,
        downloads: 0,
        rating: 0,
        ratingCount: 0,
        tags: newResource.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      });
      
      setNewResource({
        title: '',
        description: '',
        courseCode: '',
        courseName: '',
        type: 'notes',
        tags: '',
        isPublic: true,
        fileUrl: '',
        fileName: '',
        fileSize: 0
      });
      setShowUploadForm(false);
      await loadResourceData();
    } catch (error) {
      console.error('Error uploading resource:', error);
    }
  };

  const handleDownload = async (resourceId: string) => {
    // Increment download count
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      // In a real implementation, you would also handle the actual file download
      // For now, we'll just increment the counter
      try {
        await addDocument('downloads', {
          resourceId,
          userId: profile.uid,
          downloadedAt: Date.now()
        });
        
        // Refresh the resources to update download count
        await loadResourceData();
      } catch (error) {
        console.error('Error tracking download:', error);
      }
    }
  };

  const getFilteredResources = () => {
    let filtered = resources.filter(resource => 
      resource.isPublic || resource.uploadedBy === profile.uid
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(term) ||
        resource.description.toLowerCase().includes(term) ||
        resource.courseCode.toLowerCase().includes(term) ||
        resource.courseName.toLowerCase().includes(term) ||
        resource.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(resource => resource.type === typeFilter);
    }

    if (courseFilter !== 'all') {
      filtered = filtered.filter(resource => resource.courseCode === courseFilter);
    }

    return filtered.sort((a, b) => b.uploadedAt - a.uploadedAt);
  };

  const getCourses = () => {
    const courses = [...new Set(resources.map(r => r.courseCode))];
    return courses.sort();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeIcon = (type: string) => {
    return resourceTypes.find(t => t.value === type)?.icon || '📁';
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.uid === userId);
  };

  // Mock file upload handler (in a real app, you'd upload to Firebase Storage or similar)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewResource({
        ...newResource,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file) // This is just for demo, real implementation would upload to storage
      });
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading resource library...</p>
        </div>
      </div>
    );
  }

  const filteredResources = getFilteredResources();
  const courses = getCourses();

  return (
    <div className="page">
      <div className="page-header">
        <h2>📚 Resource Library</h2>
        <p className="page-description">Access and share educational resources and study materials.</p>
      </div>

      <div className="resources-controls">
        <div className="resources-filters">
          <input
            type="text"
            placeholder="Search resources by title, course, or tags..."
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
            {resourceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setShowUploadForm(true)}
          className="btn-primary"
        >
          + Upload Resource
        </button>
      </div>

      <div className="resources-stats">
        <div className="stat-item">
          <span className="stat-label">Total Resources</span>
          <span className="stat-value">{resources.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Resource Types</span>
          <span className="stat-value">{resourceTypes.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Your Uploads</span>
          <span className="stat-value">
            {resources.filter(r => r.uploadedBy === profile.uid).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Downloads</span>
          <span className="stat-value">
            {resources.reduce((sum, r) => sum + r.downloads, 0)}
          </span>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No resources found</h3>
          <p>Be the first to upload a resource or adjust your search filters.</p>
          <button onClick={() => setShowUploadForm(true)} className="btn-primary">
            Upload First Resource
          </button>
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map((resource) => {
            const uploader = getUserById(resource.uploadedBy);
            const isOwner = resource.uploadedBy === profile.uid;

            return (
              <div key={resource.id} className="resource-card">
                <div className="resource-header">
                  <div className="resource-type">
                    <span className="type-icon">{getTypeIcon(resource.type)}</span>
                    <span className="type-label">
                      {resourceTypes.find(t => t.value === resource.type)?.label}
                    </span>
                  </div>
                  {isOwner && <span className="owner-badge">Your Upload</span>}
                </div>

                <h3 className="resource-title">{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>

                <div className="resource-meta">
                  <div className="course-info">
                    <span className="course-code">{resource.courseCode}</span>
                    {resource.courseName && (
                      <span className="course-name">{resource.courseName}</span>
                    )}
                  </div>
                  
                  {resource.fileName && (
                    <div className="file-info">
                      <span className="file-name">📎 {resource.fileName}</span>
                      {resource.fileSize > 0 && (
                        <span className="file-size">{formatFileSize(resource.fileSize)}</span>
                      )}
                    </div>
                  )}
                </div>

                {resource.tags.length > 0 && (
                  <div className="resource-tags">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="more-tags">+{resource.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="resource-stats">
                  <div className="stat-item">
                    <span className="stat-icon">📥</span>
                    <span className="stat-text">{resource.downloads} downloads</span>
                  </div>
                  
                  {resource.ratingCount > 0 && (
                    <div className="stat-item">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-text">
                        {resource.rating.toFixed(1)} ({resource.ratingCount} reviews)
                      </span>
                    </div>
                  )}
                  
                  <div className="stat-item">
                    <span className="stat-icon">👤</span>
                    <span className="stat-text">by {uploader?.fullName}</span>
                  </div>
                </div>

                <div className="resource-footer">
                  <div className="upload-time">
                    {formatTimeAgo(resource.uploadedAt)}
                  </div>
                  
                  <div className="resource-actions">
                    {resource.fileUrl && (
                      <button 
                        onClick={() => handleDownload(resource.id)}
                        className="btn-primary btn-sm"
                      >
                        📥 Download
                      </button>
                    )}
                    
                    <button 
                      onClick={() => {
                        // In a real app, you might open a detailed view
                        alert('Resource details would open here');
                      }}
                      className="btn-secondary btn-sm"
                    >
                      👁️ View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUploadForm && (
        <div className="modal-overlay" onClick={() => setShowUploadForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload New Resource</h3>
            <form onSubmit={handleUploadResource}>
              <div className="form-group">
                <label>Resource Title</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g., Microeconomics Chapter 5 Notes"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the resource content..."
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={newResource.courseCode}
                    onChange={(e) => setNewResource({ ...newResource, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., ECO 201"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={newResource.courseName}
                    onChange={(e) => setNewResource({ ...newResource, courseName: e.target.value })}
                    placeholder="e.g., Microeconomic Theory"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Resource Type</label>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                >
                  {resourceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Upload File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                  className="file-input"
                />
                {newResource.fileName && (
                  <div className="file-preview">
                    <span>📎 {newResource.fileName}</span>
                    <span>({formatFileSize(newResource.fileSize)})</span>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newResource.tags}
                  onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
                  placeholder="e.g., notes, chapter5, elasticity, graphs"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newResource.isPublic}
                    onChange={(e) => setNewResource({ ...newResource, isPublic: e.target.checked })}
                  />
                  Make this resource public
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowUploadForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};