import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument } from '../utils/firebase';
import { Route } from '../types';

interface GradeEntry {
  id?: string;
  courseCode: string;
  courseName: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  units: number;
  semester: string;
  userId: string;
}

interface GpaCalculatorPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const GpaCalculatorPage: React.FC<GpaCalculatorPageProps> = ({ profile, setRoute }) => {
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GradeEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    courseCode: '',
    courseName: '',
    grade: 'A' as const,
    units: 3,
    semester: ''
  });

  useEffect(() => {
    loadGradeEntries();
  }, []);

  const loadGradeEntries = async () => {
    try {
      setLoading(true);
      const entries = await getCollection('gradeEntries');
      const userEntries = entries.filter((entry: any) => entry.userId === profile.uid);
      setGradeEntries(userEntries);
    } catch (error) {
      console.error('Error loading grade entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const gradeToPoint = (grade: string): number => {
    const gradePoints: { [key: string]: number } = {
      'A': 5.0,
      'B': 4.0,
      'C': 3.0,
      'D': 2.0,
      'E': 1.0,
      'F': 0.0
    };
    return gradePoints[grade] || 0;
  };

  const calculateGPA = (entries: GradeEntry[]): number => {
    if (entries.length === 0) return 0;
    
    const totalPoints = entries.reduce((sum, entry) => {
      return sum + (gradeToPoint(entry.grade) * entry.units);
    }, 0);
    
    const totalUnits = entries.reduce((sum, entry) => sum + entry.units, 0);
    
    return totalUnits > 0 ? totalPoints / totalUnits : 0;
  };

  const calculateSemesterGPA = (semester: string): number => {
    const semesterEntries = gradeEntries.filter(entry => entry.semester === semester);
    return calculateGPA(semesterEntries);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.courseCode || !newEntry.courseName || !newEntry.semester) return;

    try {
      const entry = {
        ...newEntry,
        userId: profile.uid
      };

      if (editingEntry) {
        await updateDocument('gradeEntries', editingEntry.id!, entry);
        setEditingEntry(null);
      } else {
        await addDocument('gradeEntries', entry);
      }
      
      setNewEntry({
        courseCode: '',
        courseName: '',
        grade: 'A',
        units: 3,
        semester: ''
      });
      setShowAddForm(false);
      await loadGradeEntries();
    } catch (error) {
      console.error('Error saving grade entry:', error);
    }
  };

  const handleEditEntry = (entry: GradeEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      courseCode: entry.courseCode,
      courseName: entry.courseName,
      grade: entry.grade,
      units: entry.units,
      semester: entry.semester
    });
    setShowAddForm(true);
  };

  const getSemesters = (): string[] => {
    const semesters = [...new Set(gradeEntries.map(entry => entry.semester))];
    return semesters.sort();
  };

  const currentGPA = calculateGPA(gradeEntries);
  const totalUnits = gradeEntries.reduce((sum, entry) => sum + entry.units, 0);
  const semesters = getSemesters();

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading GPA data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>🧮 GPA Calculator</h2>
        <p className="page-description">Track and calculate your academic performance.</p>
      </div>

      <div className="gpa-summary">
        <div className="gpa-card main-gpa">
          <h3>Current CGPA</h3>
          <div className="gpa-value">{currentGPA.toFixed(2)}</div>
          <p>{totalUnits} Total Credit Units</p>
        </div>
        
        <div className="gpa-stats">
          <div className="stat-item">
            <span className="stat-label">Total Courses</span>
            <span className="stat-value">{gradeEntries.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Semesters</span>
            <span className="stat-value">{semesters.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Class</span>
            <span className="stat-value">
              {currentGPA >= 4.5 ? 'First Class' :
               currentGPA >= 3.5 ? 'Second Class Upper' :
               currentGPA >= 2.4 ? 'Second Class Lower' :
               currentGPA >= 1.5 ? 'Third Class' : 'Pass'}
            </span>
          </div>
        </div>
      </div>

      <div className="page-actions">
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          + Add Course Grade
        </button>
      </div>

      {semesters.length > 0 && (
        <div className="semester-breakdown">
          <h3>Semester Breakdown</h3>
          {semesters.map(semester => {
            const semesterEntries = gradeEntries.filter(entry => entry.semester === semester);
            const semesterGPA = calculateSemesterGPA(semester);
            const semesterUnits = semesterEntries.reduce((sum, entry) => sum + entry.units, 0);

            return (
              <div key={semester} className="semester-card">
                <div className="semester-header">
                  <h4>{semester}</h4>
                  <div className="semester-stats">
                    <span className="semester-gpa">GPA: {semesterGPA.toFixed(2)}</span>
                    <span className="semester-units">{semesterUnits} Units</span>
                  </div>
                </div>
                
                <div className="courses-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Units</th>
                        <th>Grade</th>
                        <th>Points</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesterEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.courseCode}</td>
                          <td>{entry.courseName}</td>
                          <td>{entry.units}</td>
                          <td>
                            <span className={`grade-badge grade-${entry.grade.toLowerCase()}`}>
                              {entry.grade}
                            </span>
                          </td>
                          <td>{(gradeToPoint(entry.grade) * entry.units).toFixed(1)}</td>
                          <td>
                            <button 
                              onClick={() => handleEditEntry(entry)}
                              className="btn-secondary btn-sm"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {gradeEntries.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧮</div>
          <h3>No grades recorded yet</h3>
          <p>Add your course grades to start calculating your GPA.</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            Add Your First Grade
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingEntry ? 'Edit Course Grade' : 'Add Course Grade'}</h3>
            <form onSubmit={handleAddEntry}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={newEntry.courseCode}
                    onChange={(e) => setNewEntry({ ...newEntry, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., ECO 201"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Credit Units</label>
                  <select
                    value={newEntry.units}
                    onChange={(e) => setNewEntry({ ...newEntry, units: parseInt(e.target.value) })}
                  >
                    <option value={1}>1 Unit</option>
                    <option value={2}>2 Units</option>
                    <option value={3}>3 Units</option>
                    <option value={4}>4 Units</option>
                    <option value={5}>5 Units</option>
                    <option value={6}>6 Units</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  value={newEntry.courseName}
                  onChange={(e) => setNewEntry({ ...newEntry, courseName: e.target.value })}
                  placeholder="e.g., Microeconomic Theory"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="text"
                    value={newEntry.semester}
                    onChange={(e) => setNewEntry({ ...newEntry, semester: e.target.value })}
                    placeholder="e.g., 100 Level Harmattan 2023"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Grade</label>
                  <select
                    value={newEntry.grade}
                    onChange={(e) => setNewEntry({ ...newEntry, grade: e.target.value as any })}
                  >
                    <option value="A">A (5.0)</option>
                    <option value="B">B (4.0)</option>
                    <option value="C">C (3.0)</option>
                    <option value="D">D (2.0)</option>
                    <option value="E">E (1.0)</option>
                    <option value="F">F (0.0)</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingEntry(null);
                    setNewEntry({
                      courseCode: '',
                      courseName: '',
                      grade: 'A',
                      units: 3,
                      semester: ''
                    });
                  }} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingEntry ? 'Update Grade' : 'Add Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};