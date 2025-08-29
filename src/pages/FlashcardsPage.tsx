import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface Flashcard {
  front: string;
  back: string;
  id: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseName: string;
  cards: Flashcard[];
  createdBy: string;
  creatorName: string;
  createdAt: number;
  isPublic: boolean;
  tags: string[];
  studyStats: {
    totalStudies: number;
    averageScore: number;
  };
}

interface StudySession {
  id: string;
  setId: string;
  userId: string;
  startedAt: number;
  completedAt?: number;
  cardResults: {
    cardId: string;
    correct: boolean;
    timeSpent: number;
  }[];
  score: number;
}

interface FlashcardsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ profile, setRoute }) => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [studyingSet, setStudyingSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studySession, setStudySession] = useState<Partial<StudySession> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [newSet, setNewSet] = useState({
    title: '',
    description: '',
    courseCode: '',
    courseName: '',
    tags: '',
    isPublic: true,
    cards: [
      { front: '', back: '', id: '1' },
      { front: '', back: '', id: '2' }
    ]
  });

  useEffect(() => {
    loadFlashcardData();
  }, []);

  const loadFlashcardData = async () => {
    try {
      setLoading(true);
      const [setsData, usersData] = await Promise.all([
        getCollection('flashcardSets', 'createdAt'),
        getAllUsers()
      ]);
      
      setFlashcardSets(setsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading flashcard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSet.title || newSet.cards.filter(c => c.front && c.back).length < 2) return;

    try {
      const creatorUser = users.find(u => u.uid === profile.uid);
      
      await addDocument('flashcardSets', {
        ...newSet,
        createdBy: profile.uid,
        creatorName: creatorUser?.fullName || profile.fullName,
        cards: newSet.cards
          .filter(card => card.front.trim() && card.back.trim())
          .map(card => ({ ...card, id: Math.random().toString(36).substr(2, 9) })),
        tags: newSet.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        studyStats: {
          totalStudies: 0,
          averageScore: 0
        }
      });
      
      setNewSet({
        title: '',
        description: '',
        courseCode: '',
        courseName: '',
        tags: '',
        isPublic: true,
        cards: [
          { front: '', back: '', id: '1' },
          { front: '', back: '', id: '2' }
        ]
      });
      setShowCreateForm(false);
      await loadFlashcardData();
    } catch (error) {
      console.error('Error creating flashcard set:', error);
    }
  };

  const startStudySession = (set: FlashcardSet) => {
    setStudyingSet(set);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudySession({
      setId: set.id,
      userId: profile.uid,
      startedAt: Date.now(),
      cardResults: [],
      score: 0
    });
  };

  const markCard = (correct: boolean) => {
    if (!studyingSet || !studySession) return;

    const currentCard = studyingSet.cards[currentCardIndex];
    const timeSpent = Date.now() - (studySession.startedAt || 0);

    const newCardResults = [
      ...(studySession.cardResults || []),
      {
        cardId: currentCard.id,
        correct,
        timeSpent
      }
    ];

    const newScore = newCardResults.filter(r => r.correct).length;

    setStudySession({
      ...studySession,
      cardResults: newCardResults,
      score: newScore
    });

    // Move to next card or finish session
    if (currentCardIndex < studyingSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // End study session
      completeStudySession(newCardResults, newScore);
    }
  };

  const completeStudySession = async (cardResults: any[], finalScore: number) => {
    if (!studyingSet || !studySession) return;

    try {
      const sessionData = {
        ...studySession,
        completedAt: Date.now(),
        cardResults,
        score: finalScore
      };

      await addDocument('studySessions', sessionData);
      
      // Update set statistics
      const newTotalStudies = studyingSet.studyStats.totalStudies + 1;
      const newAverageScore = ((studyingSet.studyStats.averageScore * studyingSet.studyStats.totalStudies) + (finalScore / studyingSet.cards.length * 100)) / newTotalStudies;
      
      await updateDocument('flashcardSets', studyingSet.id, {
        studyStats: {
          totalStudies: newTotalStudies,
          averageScore: newAverageScore
        }
      });

      alert(`Study session complete! Score: ${finalScore}/${studyingSet.cards.length} (${Math.round(finalScore / studyingSet.cards.length * 100)}%)`);
      
      setStudyingSet(null);
      setStudySession(null);
      await loadFlashcardData();
    } catch (error) {
      console.error('Error completing study session:', error);
    }
  };

  const addCard = () => {
    setNewSet({
      ...newSet,
      cards: [
        ...newSet.cards,
        { front: '', back: '', id: Math.random().toString(36).substr(2, 9) }
      ]
    });
  };

  const removeCard = (index: number) => {
    if (newSet.cards.length > 2) {
      const newCards = newSet.cards.filter((_, i) => i !== index);
      setNewSet({ ...newSet, cards: newCards });
    }
  };

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const newCards = [...newSet.cards];
    newCards[index][field] = value;
    setNewSet({ ...newSet, cards: newCards });
  };

  const getFilteredSets = () => {
    let filtered = flashcardSets.filter(set => 
      set.isPublic || set.createdBy === profile.uid
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(set => 
        set.title.toLowerCase().includes(term) ||
        set.description.toLowerCase().includes(term) ||
        set.courseCode.toLowerCase().includes(term) ||
        set.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (courseFilter !== 'all') {
      filtered = filtered.filter(set => set.courseCode === courseFilter);
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  };

  const getCourses = () => {
    const courses = [...new Set(flashcardSets.map(s => s.courseCode))];
    return courses.sort();
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

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (studyingSet) {
    const currentCard = studyingSet.cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / studyingSet.cards.length) * 100;

    return (
      <div className="page">
        <div className="study-session">
          <div className="study-header">
            <h2>{studyingSet.title}</h2>
            <button 
              onClick={() => setStudyingSet(null)}
              className="btn-secondary"
            >
              End Session
            </button>
          </div>

          <div className="study-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>Card {currentCardIndex + 1} of {studyingSet.cards.length}</span>
          </div>

          <div className="flashcard-container">
            <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
              <div className="flashcard-front">
                <div className="card-content">
                  <div className="card-label">Question</div>
                  <div className="card-text">{currentCard.front}</div>
                </div>
              </div>
              
              <div className="flashcard-back">
                <div className="card-content">
                  <div className="card-label">Answer</div>
                  <div className="card-text">{currentCard.back}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="study-controls">
            {!showAnswer ? (
              <button 
                onClick={() => setShowAnswer(true)}
                className="btn-primary btn-large"
              >
                Show Answer
              </button>
            ) : (
              <div className="answer-feedback">
                <p>How well did you know this?</p>
                <div className="feedback-buttons">
                  <button 
                    onClick={() => markCard(false)}
                    className="btn-danger"
                  >
                    ❌ Didn't Know
                  </button>
                  <button 
                    onClick={() => markCard(true)}
                    className="btn-success"
                  >
                    ✅ Got It Right
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="study-stats">
            <div className="stat">
              <span className="stat-label">Correct:</span>
              <span className="stat-value">
                {studySession?.cardResults?.filter(r => r.correct).length || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Remaining:</span>
              <span className="stat-value">
                {studyingSet.cards.length - currentCardIndex - 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredSets = getFilteredSets();
  const courses = getCourses();

  return (
    <div className="page">
      <div className="page-header">
        <h2>🗂️ Flashcards</h2>
        <p className="page-description">Create and study with digital flashcards for effective learning.</p>
      </div>

      <div className="flashcards-controls">
        <div className="flashcards-filters">
          <input
            type="text"
            placeholder="Search flashcard sets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
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
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          + Create Flashcard Set
        </button>
      </div>

      <div className="flashcards-stats">
        <div className="stat-item">
          <span className="stat-label">Total Sets</span>
          <span className="stat-value">{flashcardSets.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Your Sets</span>
          <span className="stat-value">
            {flashcardSets.filter(s => s.createdBy === profile.uid).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Cards</span>
          <span className="stat-value">
            {flashcardSets.reduce((sum, set) => sum + set.cards.length, 0)}
          </span>
        </div>
      </div>

      {filteredSets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗂️</div>
          <h3>No flashcard sets found</h3>
          <p>Create your first flashcard set to start studying effectively.</p>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            Create First Set
          </button>
        </div>
      ) : (
        <div className="flashcards-grid">
          {filteredSets.map((set) => {
            const isOwner = set.createdBy === profile.uid;

            return (
              <div key={set.id} className="flashcard-set-card">
                <div className="set-header">
                  <h3 className="set-title">{set.title}</h3>
                  {isOwner && <span className="owner-badge">Your Set</span>}
                </div>

                <p className="set-description">{set.description}</p>

                <div className="set-meta">
                  <div className="course-info">
                    <span className="course-code">{set.courseCode}</span>
                    {set.courseName && (
                      <span className="course-name">{set.courseName}</span>
                    )}
                  </div>
                  
                  <div className="card-count">
                    {set.cards.length} cards
                  </div>
                </div>

                {set.tags.length > 0 && (
                  <div className="set-tags">
                    {set.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                    {set.tags.length > 3 && (
                      <span className="more-tags">+{set.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="set-stats">
                  <div className="stat-item">
                    <span className="stat-label">Studies:</span>
                    <span className="stat-value">{set.studyStats.totalStudies}</span>
                  </div>
                  {set.studyStats.totalStudies > 0 && (
                    <div className="stat-item">
                      <span className="stat-label">Avg Score:</span>
                      <span className="stat-value">{Math.round(set.studyStats.averageScore)}%</span>
                    </div>
                  )}
                </div>

                <div className="set-footer">
                  <div className="set-creator">
                    by {set.creatorName} • {formatTimeAgo(set.createdAt)}
                  </div>
                  
                  <div className="set-actions">
                    <button 
                      onClick={() => startStudySession(set)}
                      className="btn-primary btn-sm"
                    >
                      📚 Study
                    </button>
                    
                    <button 
                      onClick={() => {
                        // In a real app, you might open a preview or edit mode
                        alert('Flashcard preview would open here');
                      }}
                      className="btn-secondary btn-sm"
                    >
                      👁️ Preview
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content large-modal flashcard-creator" onClick={(e) => e.stopPropagation()}>
            <h3>Create Flashcard Set</h3>
            <form onSubmit={handleCreateSet}>
              <div className="form-row">
                <div className="form-group">
                  <label>Set Title</label>
                  <input
                    type="text"
                    value={newSet.title}
                    onChange={(e) => setNewSet({ ...newSet, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={newSet.courseCode}
                    onChange={(e) => setNewSet({ ...newSet, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., ECO 201"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newSet.description}
                  onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of this flashcard set..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={newSet.courseName}
                    onChange={(e) => setNewSet({ ...newSet, courseName: e.target.value })}
                    placeholder="e.g., Microeconomic Theory"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newSet.tags}
                    onChange={(e) => setNewSet({ ...newSet, tags: e.target.value })}
                    placeholder="economics, definitions, formulas"
                  />
                </div>
              </div>

              <div className="cards-section">
                <h4>Flashcards</h4>
                {newSet.cards.map((card, index) => (
                  <div key={card.id} className="card-editor">
                    <div className="card-header">
                      <span>Card {index + 1}</span>
                      {newSet.cards.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeCard(index)}
                          className="btn-danger btn-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="card-editor-row">
                      <div className="form-group">
                        <label>Front (Question)</label>
                        <textarea
                          value={card.front}
                          onChange={(e) => updateCard(index, 'front', e.target.value)}
                          rows={2}
                          placeholder="Enter question or term..."
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Back (Answer)</label>
                        <textarea
                          value={card.back}
                          onChange={(e) => updateCard(index, 'back', e.target.value)}
                          rows={2}
                          placeholder="Enter answer or definition..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addCard}
                  className="btn-secondary"
                >
                  + Add Card
                </button>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newSet.isPublic}
                    onChange={(e) => setNewSet({ ...newSet, isPublic: e.target.checked })}
                  />
                  Make this set public
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Flashcard Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};