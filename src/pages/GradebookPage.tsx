import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument } from '../utils/firebase';
import { Route } from '../types';

interface Grade {
  id: string;
  studentId: string;
  courseCode: string;
  courseName: string;
  assessmentType: 'Quiz' | 'Assignment' | 'Test' | 'Exam' | 'Project' | 'Participation' | 'Other';
  assessmentName: string;
  score: number;
  maxScore: number;
  weight: number; // Percentage weight of this assessment
  gradedAt: number;
  semester: string;
  level: number;
  feedback?: string;
  gradedBy?: string;
}

interface CourseGrades {
  courseCode: string;
  courseName: string;
  level: number;
  semester: string;
  grades: Grade[];
  totalWeightedScore: number;
  totalWeight: number;
  finalGrade: string;
  finalScore: number;
}

interface GradebookPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const GradebookPage: React.FC<GradebookPageProps> = ({ profile, setRoute }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [newGrade, setNewGrade] = useState({
    courseCode: '',
    courseName: '',
    assessmentType: 'Quiz' as const,
    assessmentName: '',
    score: 0,
    maxScore: 100,
    weight: 10,
    semester: '',
    level: 100,
    feedback: ''
  });

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const gradesData = await getCollection('grades');
      const userGrades = gradesData.filter((grade: any) => grade.studentId === profile.uid);
      setGrades(userGrades);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrade.courseCode || !newGrade.assessmentName || !newGrade.semester) return;

    try {
      await addDocument('grades', {
        ...newGrade,
        studentId: profile.uid,
        gradedBy: profile.uid // In a real system, this would be the instructor
      });
      
      setNewGrade({
        courseCode: '',
        courseName: '',
        assessmentType: 'Quiz',
        assessmentName: '',
        score: 0,
        maxScore: 100,
        weight: 10,
        semester: '',
        level: 100,
        feedback: ''
      });
      setShowAddForm(false);
      await loadGrades();
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  const calculateFinalGrade = (score: number): string => {
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 45) return 'D';
    if (score >= 40) return 'E';
    return 'F';
  };

  const getGradePoint = (grade: string): number => {
    const gradePoints: { [key: string]: number } = {
      'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0
    };
    return gradePoints[grade] || 0;
  };

  const groupGradesByCourse = (): CourseGrades[] => {
    const courseMap = new Map<string, Grade[]>();
    
    // Filter grades based on selected semester and level
    let filteredGrades = grades;
    if (selectedSemester !== 'all') {
      filteredGrades = filteredGrades.filter(grade => grade.semester === selectedSemester);
    }
    if (selectedLevel !== 'all') {
      filteredGrades = filteredGrades.filter(grade => grade.level.toString() === selectedLevel);
    }

    filteredGrades.forEach(grade => {
      const key = `${grade.courseCode}-${grade.semester}`;
      if (!courseMap.has(key)) {
        courseMap.set(key, []);
      }
      courseMap.get(key)!.push(grade);
    });

    return Array.from(courseMap.entries()).map(([key, courseGrades]) => {
      const firstGrade = courseGrades[0];
      let totalWeightedScore = 0;
      let totalWeight = 0;

      courseGrades.forEach(grade => {
        const percentage = (grade.score / grade.maxScore) * 100;
        totalWeightedScore += percentage * (grade.weight / 100);
        totalWeight += grade.weight;
      });

      // Normalize if total weight is not 100%
      const finalScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
      const finalGrade = calculateFinalGrade(finalScore);

      return {
        courseCode: firstGrade.courseCode,
        courseName: firstGrade.courseName,
        level: firstGrade.level,
        semester: firstGrade.semester,
        grades: courseGrades,
        totalWeightedScore,
        totalWeight,
        finalGrade,
        finalScore
      };
    });
  };

  const calculateOverallGPA = (): number => {
    const courseGrades = groupGradesByCourse();
    if (courseGrades.length === 0) return 0;

    const totalPoints = courseGrades.reduce((sum, course) => {
      return sum + getGradePoint(course.finalGrade);
    }, 0);

    return totalPoints / courseGrades.length;
  };

  const getSemesters = (): string[] => {
    const semesters = [...new Set(grades.map(grade => grade.semester))];
    return semesters.sort();
  };

  const getLevels = (): string[] => {
    const levels = [...new Set(grades.map(grade => grade.level.toString()))];
    return levels.sort();
  };

  const getAssessmentTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'Quiz': '#3498db',
      'Assignment': '#2ecc71',
      'Test': '#f39c12',
      'Exam': '#e74c3c',
      'Project': '#9b59b6',
      'Participation': '#1abc9c',
      'Other': '#95a5a6'
    };
    return colors[type] || '#95a5a6';
  };

  const getGradeColor = (grade: string): string => {
    const colors: { [key: string]: string } = {
      'A': '#2ecc71', 'B': '#3498db', 'C': '#f39c12', 
      'D': '#e67e22', 'E': '#e74c3c', 'F': '#c0392b'
    };
    return colors[grade] || '#95a5a6';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading gradebook...</p>
        </div>
      </div>
    );
  }

  const courseGrades = groupGradesByCourse();
  const overallGPA = calculateOverallGPA();
  const semesters = getSemesters();
  const levels = getLevels();

  return (
    <div className="page">
      <div className="page-header">
        <h2>📊 Gradebook</h2>
        <p className="page-description">Track your academic performance and grades across all courses.</p>
      </div>

      <div className="gradebook-controls">
        <div className="gradebook-filters">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Semesters</option>
            {semesters.map(semester => (
              <option key={semester} value={semester}>{semester}</option>
            ))}
          </select>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level} Level</option>
            ))}
          </select>
          
          <div className="view-toggle">
            <button 
              className={viewMode === 'overview' ? 'active' : ''}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
            <button 
              className={viewMode === 'detailed' ? 'active' : ''}
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </button>
          </div>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          + Add Grade
        </button>
      </div>

      <div className="gradebook-summary">
        <div className="summary-card main-gpa">
          <h3>Overall GPA</h3>
          <div className="gpa-value">{overallGPA.toFixed(2)}</div>
          <p>{courseGrades.length} courses</p>
        </div>
        
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Assessments</span>
            <span className="stat-value">{grades.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Score</span>
            <span className="stat-value">
              {grades.length > 0 
                ? Math.round(grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0) / grades.length)
                : 0}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Class Standing</span>
            <span className="stat-value">
              {overallGPA >= 4.5 ? 'First Class' :
               overallGPA >= 3.5 ? 'Second Upper' :
               overallGPA >= 2.4 ? 'Second Lower' :
               overallGPA >= 1.5 ? 'Third Class' : 'Pass'}
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <div className="courses-overview">
          <h3>Course Performance</h3>
          {courseGrades.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h4>No grades recorded yet</h4>
              <p>Start adding your grades to track your academic performance.</p>
              <button onClick={() => setShowAddForm(true)} className="btn-primary">
                Add Your First Grade
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {courseGrades.map((course, index) => (
                <div key={index} className="course-grade-card">
                  <div className="course-header">
                    <h4>{course.courseCode}</h4>
                    <span 
                      className="final-grade-badge"
                      style={{ backgroundColor: getGradeColor(course.finalGrade) }}
                    >
                      {course.finalGrade}
                    </span>
                  </div>
                  
                  <h5 className="course-name">{course.courseName}</h5>
                  <div className="course-meta">
                    <span>{course.level} Level • {course.semester}</span>
                  </div>
                  
                  <div className="course-score">
                    <div className="score-percentage">{Math.round(course.finalScore)}%</div>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${Math.min(course.finalScore, 100)}%`,
                          backgroundColor: getGradeColor(course.finalGrade)
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="assessment-count">
                    {course.grades.length} assessment{course.grades.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="detailed-grades">
          <h3>Detailed Grade Breakdown</h3>
          {courseGrades.map((course, courseIndex) => (
            <div key={courseIndex} className="course-detail-section">
              <div className="course-detail-header">
                <div className="course-info">
                  <h4>{course.courseCode} - {course.courseName}</h4>
                  <span className="course-meta">{course.level} Level • {course.semester}</span>
                </div>
                <div className="course-final">
                  <span className="final-score">{Math.round(course.finalScore)}%</span>
                  <span 
                    className="final-grade"
                    style={{ color: getGradeColor(course.finalGrade) }}
                  >
                    Grade: {course.finalGrade}
                  </span>
                </div>
              </div>
              
              <div className="assessments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Type</th>
                      <th>Score</th>
                      <th>Weight</th>
                      <th>Percentage</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.grades.map((grade) => {
                      const percentage = (grade.score / grade.maxScore) * 100;
                      return (
                        <tr key={grade.id}>
                          <td>{grade.assessmentName}</td>
                          <td>
                            <span 
                              className="assessment-type-badge"
                              style={{ backgroundColor: getAssessmentTypeColor(grade.assessmentType) }}
                            >
                              {grade.assessmentType}
                            </span>
                          </td>
                          <td>{grade.score}/{grade.maxScore}</td>
                          <td>{grade.weight}%</td>
                          <td>{Math.round(percentage)}%</td>
                          <td>{new Date(grade.gradedAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Grade Entry</h3>
            <form onSubmit={handleAddGrade}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={newGrade.courseCode}
                    onChange={(e) => setNewGrade({ ...newGrade, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., ECO 201"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={newGrade.courseName}
                    onChange={(e) => setNewGrade({ ...newGrade, courseName: e.target.value })}
                    placeholder="e.g., Microeconomic Theory"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Assessment Type</label>
                  <select
                    value={newGrade.assessmentType}
                    onChange={(e) => setNewGrade({ ...newGrade, assessmentType: e.target.value as any })}
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Test">Test</option>
                    <option value="Exam">Exam</option>
                    <option value="Project">Project</option>
                    <option value="Participation">Participation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Assessment Name</label>
                  <input
                    type="text"
                    value={newGrade.assessmentName}
                    onChange={(e) => setNewGrade({ ...newGrade, assessmentName: e.target.value })}
                    placeholder="e.g., Midterm Exam"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Score</label>
                  <input
                    type="number"
                    value={newGrade.score}
                    onChange={(e) => setNewGrade({ ...newGrade, score: Number(e.target.value) })}
                    min="0"
                    max={newGrade.maxScore}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Max Score</label>
                  <input
                    type="number"
                    value={newGrade.maxScore}
                    onChange={(e) => setNewGrade({ ...newGrade, maxScore: Number(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Weight (%)</label>
                  <input
                    type="number"
                    value={newGrade.weight}
                    onChange={(e) => setNewGrade({ ...newGrade, weight: Number(e.target.value) })}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={newGrade.level}
                    onChange={(e) => setNewGrade({ ...newGrade, level: Number(e.target.value) })}
                  >
                    <option value={100}>100 Level</option>
                    <option value={200}>200 Level</option>
                    <option value={300}>300 Level</option>
                    <option value={400}>400 Level</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="text"
                    value={newGrade.semester}
                    onChange={(e) => setNewGrade({ ...newGrade, semester: e.target.value })}
                    placeholder="e.g., 100 Level Harmattan 2023"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Feedback (optional)</label>
                <textarea
                  value={newGrade.feedback}
                  onChange={(e) => setNewGrade({ ...newGrade, feedback: e.target.value })}
                  rows={2}
                  placeholder="Any feedback or notes about this assessment..."
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};