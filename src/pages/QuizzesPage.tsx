import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  attempts: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: number;
  category: string;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: (number | null)[];
  score: number;
  totalPoints: number;
  startedAt: number;
  completedAt: number;
  timeSpent: number; // in seconds
}

interface QuizzesPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const QuizzesPage: React.FC<QuizzesPageProps> = ({ profile, setRoute }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showResults, setShowResults] = useState<QuizAttempt | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    courseCode: '',
    timeLimit: 30,
    attempts: 3,
    category: 'practice',
    isPublished: true,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        points: 1
      }
    ]
  });

  const categories = [
    { value: 'practice', label: 'Practice Quiz' },
    { value: 'exam', label: 'Exam' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'review', label: 'Review Quiz' }
  ];

  useEffect(() => {
    loadQuizData();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (takingQuiz && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [takingQuiz, timeRemaining]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const [quizzesData, attemptsData] = await Promise.all([
        getCollection('quizzes', 'createdAt'),
        getCollection('quizAttempts')
      ]);
      
      setQuizzes(quizzesData.filter((quiz: any) => quiz.isPublished));
      setAttempts(attemptsData.filter((attempt: any) => attempt.studentId === profile.uid));
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.title || newQuiz.questions.some(q => !q.question || q.options.some(opt => !opt))) return;

    try {
      await addDocument('quizzes', {
        ...newQuiz,
        createdBy: profile.uid
      });
      
      setNewQuiz({
        title: '',
        description: '',
        courseCode: '',
        timeLimit: 30,
        attempts: 3,
        category: 'practice',
        isPublished: true,
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: '',
            points: 1
          }
        ]
      });
      setShowCreateForm(false);
      await loadQuizData();
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setTakingQuiz(quiz);
    setQuizStartTime(Date.now());
    setCurrentQuestion(0);
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < (takingQuiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!takingQuiz) return;

    try {
      let score = 0;
      let totalPoints = 0;

      takingQuiz.questions.forEach((question, index) => {
        totalPoints += question.points;
        if (userAnswers[index] === question.correctAnswer) {
          score += question.points;
        }
      });

      const attempt: Omit<QuizAttempt, 'id'> = {
        quizId: takingQuiz.id,
        studentId: profile.uid,
        answers: userAnswers,
        score,
        totalPoints,
        startedAt: quizStartTime,
        completedAt: Date.now(),
        timeSpent: Math.round((Date.now() - quizStartTime) / 1000)
      };

      await addDocument('quizAttempts', attempt);
      
      setShowResults({ ...attempt, id: 'temp' });
      setTakingQuiz(null);
      setUserAnswers([]);
      setCurrentQuestion(0);
      await loadQuizData();
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          points: 1
        }
      ]
    });
  };

  const updateQuestion = (questionIndex: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...newQuiz.questions];
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], [field]: value };
    setNewQuiz({ ...newQuiz, questions: newQuestions });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...newQuiz.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setNewQuiz({ ...newQuiz, questions: newQuestions });
  };

  const removeQuestion = (questionIndex: number) => {
    if (newQuiz.questions.length > 1) {
      const newQuestions = newQuiz.questions.filter((_, index) => index !== questionIndex);
      setNewQuiz({ ...newQuiz, questions: newQuestions });
    }
  };

  const getQuizStats = (quiz: Quiz) => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
    const averageScore = quizAttempts.length > 0 
      ? quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalPoints * 100), 0) / quizAttempts.length
      : 0;
    
    return {
      attempts: quizAttempts.length,
      maxAttempts: quiz.attempts,
      averageScore: Math.round(averageScore),
      bestScore: quizAttempts.length > 0 
        ? Math.max(...quizAttempts.map(attempt => attempt.score / attempt.totalPoints * 100))
        : 0
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredQuizzes = () => {
    let filtered = quizzes;
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === categoryFilter);
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const quiz = quizzes.find(q => q.id === showResults.quizId);
    const percentage = Math.round((showResults.score / showResults.totalPoints) * 100);

    return (
      <div className="page">
        <div className="page-header">
          <h2>Quiz Results</h2>
        </div>

        <div className="quiz-results">
          <div className="results-header">
            <h3>{quiz?.title}</h3>
            <div className="score-display">
              <div className="score-circle">
                <span className="score">{percentage}%</span>
              </div>
              <div className="score-details">
                <p>{showResults.score}/{showResults.totalPoints} points</p>
                <p>Time: {formatTime(showResults.timeSpent)}</p>
              </div>
            </div>
          </div>

          <div className="results-breakdown">
            <h4>Question Review</h4>
            {quiz?.questions.map((question, index) => {
              const userAnswer = showResults.answers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div key={index} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className={`result-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  <p className="question-text">{question.question}</p>
                  
                  <div className="answer-options">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`option ${
                          optIndex === question.correctAnswer ? 'correct-answer' : ''
                        } ${
                          optIndex === userAnswer && optIndex !== question.correctAnswer ? 'user-wrong' : ''
                        } ${
                          optIndex === userAnswer && optIndex === question.correctAnswer ? 'user-correct' : ''
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button onClick={() => setShowResults(null)} className="btn-primary">
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (takingQuiz) {
    const question = takingQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / takingQuiz.questions.length) * 100;

    return (
      <div className="page">
        <div className="quiz-taking">
          <div className="quiz-header">
            <h2>{takingQuiz.title}</h2>
            <div className="quiz-timer">
              Time: {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="quiz-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>Question {currentQuestion + 1} of {takingQuiz.questions.length}</span>
          </div>

          <div className="question-container">
            <h3>Q{currentQuestion + 1}. {question.question}</h3>
            <div className="question-points">({question.points} point{question.points !== 1 ? 's' : ''})</div>
            
            <div className="answer-options">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${userAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button 
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              className="btn-secondary"
            >
              Previous
            </button>
            
            <div className="question-indicators">
              {takingQuiz.questions.map((_, index) => (
                <button
                  key={index}
                  className={`question-indicator ${
                    index === currentQuestion ? 'current' : ''
                  } ${
                    userAnswers[index] !== null ? 'answered' : ''
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === takingQuiz.questions.length - 1 ? (
              <button onClick={handleSubmitQuiz} className="btn-primary">
                Submit Quiz
              </button>
            ) : (
              <button onClick={goToNextQuestion} className="btn-primary">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filteredQuizzes = getFilteredQuizzes();

  return (
    <div className="page">
      <div className="page-header">
        <h2>🧠 Quizzes</h2>
        <p className="page-description">Test your knowledge with interactive quizzes.</p>
      </div>

      <div className="quizzes-controls">
        <div className="quizzes-filters">
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
        </div>

        {(profile.role === 'Admin' || profile.role === 'Class President') && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            + Create Quiz
          </button>
        )}
      </div>

      <div className="quizzes-stats">
        <div className="stat-item">
          <span className="stat-label">Available Quizzes</span>
          <span className="stat-value">{quizzes.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{attempts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">
            {attempts.length > 0 
              ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalPoints * 100), 0) / attempts.length)
              : 0}%
          </span>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧠</div>
          <h3>No quizzes available</h3>
          <p>Check back later for new quizzes to test your knowledge.</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz) => {
            const stats = getQuizStats(quiz);
            const canTakeQuiz = stats.attempts < stats.maxAttempts;

            return (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-header">
                  <h3 className="quiz-title">{quiz.title}</h3>
                  <span className="quiz-category">
                    {categories.find(c => c.value === quiz.category)?.label}
                  </span>
                </div>

                <p className="quiz-description">{quiz.description}</p>

                <div className="quiz-meta">
                  <div className="quiz-info">
                    <span>📋 {quiz.questions.length} questions</span>
                    <span>⏱️ {quiz.timeLimit} minutes</span>
                    <span>🎯 {quiz.courseCode}</span>
                  </div>
                </div>

                <div className="quiz-stats">
                  <div className="stat">
                    <span className="stat-label">Attempts:</span>
                    <span className="stat-value">{stats.attempts}/{stats.maxAttempts}</span>
                  </div>
                  {stats.attempts > 0 && (
                    <div className="stat">
                      <span className="stat-label">Best Score:</span>
                      <span className="stat-value">{Math.round(stats.bestScore)}%</span>
                    </div>
                  )}
                </div>

                <div className="quiz-actions">
                  {canTakeQuiz ? (
                    <button 
                      onClick={() => startQuiz(quiz)}
                      className="btn-primary"
                    >
                      {stats.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </button>
                  ) : (
                    <span className="attempts-exhausted">No attempts remaining</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content large-modal quiz-creator" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Quiz</h3>
            <form onSubmit={handleCreateQuiz}>
              <div className="form-row">
                <div className="form-group">
                  <label>Quiz Title</label>
                  <input
                    type="text"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={newQuiz.courseCode}
                    onChange={(e) => setNewQuiz({ ...newQuiz, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., ECO 201"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newQuiz.category}
                    onChange={(e) => setNewQuiz({ ...newQuiz, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={newQuiz.timeLimit}
                    onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: Number(e.target.value) })}
                    min="5"
                    max="180"
                  />
                </div>
                
                <div className="form-group">
                  <label>Max Attempts</label>
                  <input
                    type="number"
                    value={newQuiz.attempts}
                    onChange={(e) => setNewQuiz({ ...newQuiz, attempts: Number(e.target.value) })}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="questions-section">
                <h4>Questions</h4>
                {newQuiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="question-editor">
                    <div className="question-header">
                      <span>Question {qIndex + 1}</span>
                      {newQuiz.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="btn-danger btn-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>Question Text</label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        rows={2}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Answer Options</label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="option-input">
                          <span className="option-letter">{String.fromCharCode(65 + oIndex)}</span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                            required
                          />
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          />
                          <label>Correct</label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))}
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Explanation (optional)</label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                        rows={2}
                        placeholder="Explain the correct answer..."
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn-secondary"
                >
                  + Add Question
                </button>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};