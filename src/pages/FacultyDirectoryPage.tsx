import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection } from '../utils/firebase';
import { Route } from '../types';

interface Faculty {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  officeHours: string;
  researchAreas: string[];
  courses: string[];
  biography: string;
  profilePicture?: string;
  website?: string;
  qualifications: string[];
  publications: string[];
}

interface FacultyDirectoryPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const FacultyDirectoryPage: React.FC<FacultyDirectoryPageProps> = ({ profile, setRoute }) => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    title: '',
    department: 'Economics',
    email: '',
    phone: '',
    office: '',
    officeHours: '',
    researchAreas: [''],
    courses: [''],
    biography: '',
    qualifications: [''],
    publications: ['']
  });

  const departments = [
    'Economics',
    'Development Economics',
    'Agricultural Economics',
    'Business Economics',
    'Econometrics',
    'Public Economics'
  ];

  const academicTitles = [
    'Professor',
    'Associate Professor',
    'Senior Lecturer',
    'Lecturer I',
    'Lecturer II',
    'Assistant Lecturer',
    'Graduate Assistant'
  ];

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [faculty, searchTerm, departmentFilter]);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const facultyData = await getCollection('faculty', 'name');
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error loading faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFaculty = () => {
    let filtered = faculty;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(term) ||
        member.title.toLowerCase().includes(term) ||
        member.department.toLowerCase().includes(term) ||
        member.researchAreas.some(area => area.toLowerCase().includes(term)) ||
        member.courses.some(course => course.toLowerCase().includes(term))
      );
    }

    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    setFilteredFaculty(filtered);
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email) return;

    try {
      await addDocument('faculty', {
        ...newFaculty,
        researchAreas: newFaculty.researchAreas.filter(area => area.trim()),
        courses: newFaculty.courses.filter(course => course.trim()),
        qualifications: newFaculty.qualifications.filter(qual => qual.trim()),
        publications: newFaculty.publications.filter(pub => pub.trim())
      });
      
      setNewFaculty({
        name: '',
        title: '',
        department: 'Economics',
        email: '',
        phone: '',
        office: '',
        officeHours: '',
        researchAreas: [''],
        courses: [''],
        biography: '',
        qualifications: [''],
        publications: ['']
      });
      setShowAddForm(false);
      await loadFaculty();
    } catch (error) {
      console.error('Error adding faculty:', error);
    }
  };

  const addField = (fieldName: keyof typeof newFaculty, value = '') => {
    const currentValue = newFaculty[fieldName] as string[];
    setNewFaculty({
      ...newFaculty,
      [fieldName]: [...currentValue, value]
    });
  };

  const updateField = (fieldName: keyof typeof newFaculty, index: number, value: string) => {
    const currentValue = newFaculty[fieldName] as string[];
    const newValue = [...currentValue];
    newValue[index] = value;
    setNewFaculty({
      ...newFaculty,
      [fieldName]: newValue
    });
  };

  const removeField = (fieldName: keyof typeof newFaculty, index: number) => {
    const currentValue = newFaculty[fieldName] as string[];
    if (currentValue.length > 1) {
      const newValue = currentValue.filter((_, i) => i !== index);
      setNewFaculty({
        ...newFaculty,
        [fieldName]: newValue
      });
    }
  };

  const handleContactFaculty = (facultyMember: Faculty) => {
    // You could implement email client opening or messaging system
    window.location.href = `mailto:${facultyMember.email}`;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading faculty directory...</p>
        </div>
      </div>
    );
  }

  if (selectedFaculty) {
    return (
      <div className="page">
        <div className="page-header">
          <button 
            onClick={() => setSelectedFaculty(null)}
            className="btn-secondary"
          >
            ← Back to Directory
          </button>
          <h2>{selectedFaculty.name}</h2>
        </div>

        <div className="faculty-profile">
          <div className="profile-header">
            <div className="faculty-avatar">
              {selectedFaculty.profilePicture ? (
                <img src={selectedFaculty.profilePicture} alt={selectedFaculty.name} />
              ) : (
                <div className="avatar-placeholder">
                  {selectedFaculty.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            <div className="faculty-basic-info">
              <h1>{selectedFaculty.name}</h1>
              <h3>{selectedFaculty.title}</h3>
              <p className="department">{selectedFaculty.department}</p>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-section">
              <h4>Contact Information</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <strong>Email:</strong> 
                  <a href={`mailto:${selectedFaculty.email}`}>{selectedFaculty.email}</a>
                </div>
                <div className="contact-item">
                  <strong>Phone:</strong> {selectedFaculty.phone}
                </div>
                <div className="contact-item">
                  <strong>Office:</strong> {selectedFaculty.office}
                </div>
                <div className="contact-item">
                  <strong>Office Hours:</strong> {selectedFaculty.officeHours}
                </div>
                {selectedFaculty.website && (
                  <div className="contact-item">
                    <strong>Website:</strong> 
                    <a href={selectedFaculty.website} target="_blank" rel="noopener noreferrer">
                      {selectedFaculty.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {selectedFaculty.biography && (
              <div className="profile-section">
                <h4>Biography</h4>
                <p>{selectedFaculty.biography}</p>
              </div>
            )}

            {selectedFaculty.qualifications.length > 0 && (
              <div className="profile-section">
                <h4>Qualifications</h4>
                <ul>
                  {selectedFaculty.qualifications.map((qual, index) => (
                    <li key={index}>{qual}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedFaculty.researchAreas.length > 0 && (
              <div className="profile-section">
                <h4>Research Areas</h4>
                <div className="tags">
                  {selectedFaculty.researchAreas.map((area, index) => (
                    <span key={index} className="tag">{area}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedFaculty.courses.length > 0 && (
              <div className="profile-section">
                <h4>Courses Taught</h4>
                <div className="tags">
                  {selectedFaculty.courses.map((course, index) => (
                    <span key={index} className="tag course-tag">{course}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedFaculty.publications.length > 0 && (
              <div className="profile-section">
                <h4>Recent Publications</h4>
                <ul className="publications-list">
                  {selectedFaculty.publications.map((publication, index) => (
                    <li key={index}>{publication}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="profile-actions">
              <button 
                onClick={() => handleContactFaculty(selectedFaculty)}
                className="btn-primary"
              >
                📧 Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>👨‍🏫 Faculty Directory</h2>
        <p className="page-description">Connect with our distinguished economics faculty.</p>
      </div>

      <div className="faculty-controls">
        <div className="faculty-filters">
          <input
            type="text"
            placeholder="Search faculty by name, title, research area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {profile.role === 'Admin' && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add Faculty Member
          </button>
        )}
      </div>

      <div className="faculty-stats">
        <div className="stat-item">
          <span className="stat-label">Total Faculty</span>
          <span className="stat-value">{faculty.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Departments</span>
          <span className="stat-value">{departments.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Professors</span>
          <span className="stat-value">
            {faculty.filter(f => f.title.includes('Professor')).length}
          </span>
        </div>
      </div>

      {filteredFaculty.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍🏫</div>
          <h3>No faculty members found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="faculty-grid">
          {filteredFaculty.map((member) => (
            <div 
              key={member.id} 
              className="faculty-card"
              onClick={() => setSelectedFaculty(member)}
            >
              <div className="faculty-avatar">
                {member.profilePicture ? (
                  <img src={member.profilePicture} alt={member.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="faculty-info">
                <h3 className="faculty-name">{member.name}</h3>
                <p className="faculty-title">{member.title}</p>
                <p className="faculty-department">{member.department}</p>
                
                <div className="faculty-contact">
                  <div className="contact-item">
                    <strong>Office:</strong> {member.office}
                  </div>
                  <div className="contact-item">
                    <strong>Hours:</strong> {member.officeHours}
                  </div>
                </div>

                {member.researchAreas.length > 0 && (
                  <div className="research-preview">
                    <strong>Research:</strong> {member.researchAreas.slice(0, 2).join(', ')}
                    {member.researchAreas.length > 2 && '...'}
                  </div>
                )}
              </div>
              
              <div className="faculty-actions">
                <button
                  className="btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContactFaculty(member);
                  }}
                >
                  📧 Email
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && profile.role === 'Admin' && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Faculty Member</h3>
            <form onSubmit={handleAddFaculty}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Academic Title</label>
                  <select
                    value={newFaculty.title}
                    onChange={(e) => setNewFaculty({ ...newFaculty, title: e.target.value })}
                  >
                    {academicTitles.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newFaculty.phone}
                    onChange={(e) => setNewFaculty({ ...newFaculty, phone: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Office</label>
                  <input
                    type="text"
                    value={newFaculty.office}
                    onChange={(e) => setNewFaculty({ ...newFaculty, office: e.target.value })}
                    placeholder="e.g., Room 201, Economics Block"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Office Hours</label>
                <input
                  type="text"
                  value={newFaculty.officeHours}
                  onChange={(e) => setNewFaculty({ ...newFaculty, officeHours: e.target.value })}
                  placeholder="e.g., Mon-Wed 10:00-12:00, Fri 14:00-16:00"
                />
              </div>
              
              <div className="form-group">
                <label>Biography</label>
                <textarea
                  value={newFaculty.biography}
                  onChange={(e) => setNewFaculty({ ...newFaculty, biography: e.target.value })}
                  rows={4}
                  placeholder="Brief biography and background..."
                />
              </div>
              
              <div className="dynamic-fields">
                {['researchAreas', 'courses', 'qualifications', 'publications'].map((fieldName) => (
                  <div key={fieldName} className="form-group">
                    <label>
                      {fieldName === 'researchAreas' ? 'Research Areas' :
                       fieldName === 'courses' ? 'Courses Taught' :
                       fieldName === 'qualifications' ? 'Qualifications' : 'Publications'}
                    </label>
                    {(newFaculty[fieldName as keyof typeof newFaculty] as string[]).map((item, index) => (
                      <div key={index} className="dynamic-field">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(fieldName as keyof typeof newFaculty, index, e.target.value)}
                          placeholder={`Enter ${fieldName.slice(0, -1)}...`}
                        />
                        <button
                          type="button"
                          onClick={() => removeField(fieldName as keyof typeof newFaculty, index)}
                          className="btn-danger btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(fieldName as keyof typeof newFaculty)}
                      className="btn-secondary btn-sm"
                    >
                      + Add {fieldName === 'researchAreas' ? 'Research Area' :
                             fieldName === 'courses' ? 'Course' :
                             fieldName === 'qualifications' ? 'Qualification' : 'Publication'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};