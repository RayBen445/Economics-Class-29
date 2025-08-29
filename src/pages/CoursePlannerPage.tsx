import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument } from '../utils/firebase';
import { Route } from '../types';

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  level: number;
  semester: 'Harmattan' | 'Rain';
  prerequisites: string[];
  description: string;
  isElective: boolean;
}

interface CoursePlan {
  id: string;
  userId: string;
  level: number;
  semester: 'Harmattan' | 'Rain';
  courses: string[];
  totalUnits: number;
  status: 'planned' | 'registered' | 'completed';
}

interface CoursePlannerPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const CoursePlannerPage: React.FC<CoursePlannerPageProps> = ({ profile, setRoute }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursePlans, setCoursePlans] = useState<CoursePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(100);
  const [selectedSemester, setSelectedSemester] = useState<'Harmattan' | 'Rain'>('Harmattan');
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [planMode, setPlanMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string[]>([]);
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    units: 3,
    level: 100,
    semester: 'Harmattan' as const,
    prerequisites: [] as string[],
    description: '',
    isElective: false
  });

  const levels = [100, 200, 300, 400];
  const semesters: ('Harmattan' | 'Rain')[] = ['Harmattan', 'Rain'];

  useEffect(() => {
    loadCoursePlannerData();
  }, []);

  const loadCoursePlannerData = async () => {
    try {
      setLoading(true);
      const [coursesData, plansData] = await Promise.all([
        getCollection('courses'),
        getCollection('coursePlans')
      ]);
      
      setCourses(coursesData);
      setCoursePlans(plansData.filter((plan: any) => plan.userId === profile.uid));
    } catch (error) {
      console.error('Error loading course planner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.code || !newCourse.title) return;

    try {
      await addDocument('courses', newCourse);
      
      setNewCourse({
        code: '',
        title: '',
        units: 3,
        level: 100,
        semester: 'Harmattan',
        prerequisites: [],
        description: '',
        isElective: false
      });
      setShowAddCourseForm(false);
      await loadCoursePlannerData();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const savePlan = async () => {
    if (currentPlan.length === 0) return;

    try {
      const totalUnits = currentPlan.reduce((sum, courseId) => {
        const course = courses.find(c => c.id === courseId);
        return sum + (course?.units || 0);
      }, 0);

      const existingPlan = coursePlans.find(
        plan => plan.level === selectedLevel && plan.semester === selectedSemester
      );

      if (existingPlan) {
        await updateDocument('coursePlans', existingPlan.id, {
          courses: currentPlan,
          totalUnits,
          status: 'planned'
        });
      } else {
        await addDocument('coursePlans', {
          userId: profile.uid,
          level: selectedLevel,
          semester: selectedSemester,
          courses: currentPlan,
          totalUnits,
          status: 'planned'
        });
      }

      setPlanMode(false);
      setCurrentPlan([]);
      await loadCoursePlannerData();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const getAvailableCourses = () => {
    return courses.filter(course => 
      course.level === selectedLevel && 
      course.semester === selectedSemester
    );
  };

  const getPlannedCourses = () => {
    const plan = coursePlans.find(
      plan => plan.level === selectedLevel && plan.semester === selectedSemester
    );
    
    if (!plan) return [];
    
    return plan.courses.map(courseId => 
      courses.find(c => c.id === courseId)
    ).filter(Boolean) as Course[];
  };

  const toggleCourseInPlan = (courseId: string) => {
    if (currentPlan.includes(courseId)) {
      setCurrentPlan(currentPlan.filter(id => id !== courseId));
    } else {
      setCurrentPlan([...currentPlan, courseId]);
    }
  };

  const getTotalUnits = (courseList: string[]) => {
    return courseList.reduce((sum, courseId) => {
      const course = courses.find(c => c.id === courseId);
      return sum + (course?.units || 0);
    }, 0);
  };

  const checkPrerequisites = (course: Course) => {
    if (course.prerequisites.length === 0) return true;
    
    // Check if all prerequisites are in completed courses
    const completedCourses = coursePlans
      .filter(plan => plan.status === 'completed')
      .flatMap(plan => plan.courses);
    
    return course.prerequisites.every(prereq => 
      completedCourses.some(courseId => {
        const completedCourse = courses.find(c => c.id === courseId);
        return completedCourse?.code === prereq;
      })
    );
  };

  const startPlanning = () => {
    setPlanMode(true);
    const existingPlan = coursePlans.find(
      plan => plan.level === selectedLevel && plan.semester === selectedSemester
    );
    setCurrentPlan(existingPlan?.courses || []);
  };

  const getAcademicProgress = () => {
    const totalLevels = 4;
    const completedPlans = coursePlans.filter(plan => plan.status === 'completed');
    const totalSemesters = totalLevels * 2;
    const completedSemesters = completedPlans.length;
    
    return {
      percentage: Math.round((completedSemesters / totalSemesters) * 100),
      completedSemesters,
      totalSemesters,
      totalUnitsCompleted: completedPlans.reduce((sum, plan) => sum + plan.totalUnits, 0)
    };
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading course planner...</p>
        </div>
      </div>
    );
  }

  const availableCourses = getAvailableCourses();
  const plannedCourses = getPlannedCourses();
  const progress = getAcademicProgress();

  return (
    <div className="page">
      <div className="page-header">
        <h2>📋 Course Planner</h2>
        <p className="page-description">Plan your academic journey and track your progress.</p>
      </div>

      <div className="planner-progress">
        <div className="progress-card">
          <h3>Academic Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="progress-stats">
            <span>{progress.completedSemesters}/{progress.totalSemesters} semesters completed</span>
            <span>{progress.totalUnitsCompleted} total units earned</span>
          </div>
        </div>
      </div>

      <div className="planner-controls">
        <div className="semester-selector">
          <div className="selector-group">
            <label>Level:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value))}
              className="level-select"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level} Level</option>
              ))}
            </select>
          </div>
          
          <div className="selector-group">
            <label>Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as 'Harmattan' | 'Rain')}
              className="semester-select"
            >
              {semesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="planner-actions">
          {!planMode ? (
            <>
              <button onClick={startPlanning} className="btn-primary">
                {plannedCourses.length > 0 ? 'Edit Plan' : 'Start Planning'}
              </button>
              {profile.role === 'Admin' && (
                <button onClick={() => setShowAddCourseForm(true)} className="btn-secondary">
                  + Add Course
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={savePlan} className="btn-primary">
                Save Plan ({getTotalUnits(currentPlan)} units)
              </button>
              <button onClick={() => setPlanMode(false)} className="btn-secondary">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {planMode ? (
        <div className="course-selection">
          <h3>Select Courses for {selectedLevel} Level {selectedSemester} Semester</h3>
          <div className="courses-grid">
            {availableCourses.map((course) => {
              const isSelected = currentPlan.includes(course.id);
              const meetsPrereqs = checkPrerequisites(course);
              
              return (
                <div 
                  key={course.id} 
                  className={`course-card selectable ${isSelected ? 'selected' : ''} ${!meetsPrereqs ? 'disabled' : ''}`}
                  onClick={() => meetsPrereqs && toggleCourseInPlan(course.id)}
                >
                  <div className="course-header">
                    <div className="course-code">{course.code}</div>
                    <div className="course-units">{course.units} units</div>
                  </div>
                  <h4 className="course-title">{course.title}</h4>
                  <p className="course-description">{course.description}</p>
                  
                  {course.prerequisites.length > 0 && (
                    <div className="prerequisites">
                      <strong>Prerequisites:</strong> {course.prerequisites.join(', ')}
                    </div>
                  )}
                  
                  {course.isElective && (
                    <span className="elective-badge">Elective</span>
                  )}
                  
                  {!meetsPrereqs && (
                    <div className="prereq-warning">
                      Prerequisites not met
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="planned-courses">
          <h3>{selectedLevel} Level {selectedSemester} Semester</h3>
          
          {plannedCourses.length === 0 ? (
            <div className="empty-plan">
              <div className="empty-icon">📋</div>
              <p>No courses planned for this semester yet.</p>
              <button onClick={startPlanning} className="btn-primary">
                Start Planning
              </button>
            </div>
          ) : (
            <>
              <div className="plan-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Courses:</span>
                  <span className="summary-value">{plannedCourses.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Units:</span>
                  <span className="summary-value">
                    {plannedCourses.reduce((sum, course) => sum + course.units, 0)}
                  </span>
                </div>
              </div>
              
              <div className="courses-grid">
                {plannedCourses.map((course) => (
                  <div key={course.id} className="course-card planned">
                    <div className="course-header">
                      <div className="course-code">{course.code}</div>
                      <div className="course-units">{course.units} units</div>
                    </div>
                    <h4 className="course-title">{course.title}</h4>
                    <p className="course-description">{course.description}</p>
                    {course.isElective && (
                      <span className="elective-badge">Elective</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showAddCourseForm && profile.role === 'Admin' && (
        <div className="modal-overlay" onClick={() => setShowAddCourseForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Course</h3>
            <form onSubmit={handleAddCourse}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., ECO 201"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Units</label>
                  <select
                    value={newCourse.units}
                    onChange={(e) => setNewCourse({ ...newCourse, units: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map(unit => (
                      <option key={unit} value={unit}>{unit} Unit{unit > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Course Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="e.g., Microeconomic Theory"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: Number(e.target.value) })}
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level} Level</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value as 'Harmattan' | 'Rain' })}
                  >
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Course description..."
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newCourse.isElective}
                    onChange={(e) => setNewCourse({ ...newCourse, isElective: e.target.checked })}
                  />
                  This is an elective course
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddCourseForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};