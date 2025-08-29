import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection } from '../utils/firebase';
import { Route } from '../types';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'academic' | 'personal' | 'deadline' | 'exam';
  createdBy: string;
  isPublic: boolean;
}

interface CalendarPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ profile, setRoute }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'personal' as const,
    isPublic: false
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventData = await getCollection('events', 'date');
      setEvents(eventData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    try {
      await addDocument('events', {
        ...newEvent,
        createdBy: profile.uid
      });
      
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'personal',
        isPublic: false
      });
      setShowAddForm(false);
      await loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const today = new Date();
  const days = getDaysInMonth(selectedDate);

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>📅 Calendar</h2>
        <p className="page-description">View and manage your academic calendar and events.</p>
      </div>

      <div className="calendar-controls">
        <div className="calendar-navigation">
          <button onClick={goToPreviousMonth} className="btn-secondary">
            ← Previous
          </button>
          <h3 className="current-month">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={goToNextMonth} className="btn-secondary">
            Next →
          </button>
        </div>

        <div className="calendar-actions">
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add Event
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
        </div>
        
        <div className="calendar-body">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            const isToday = day.toDateString() === today.toDateString();
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              >
                <div className="day-number">{day.getDate()}</div>
                <div className="day-events">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div 
                      key={i} 
                      className={`event-dot event-${event.type}`}
                      title={`${event.title} at ${event.time}`}
                    >
                      <span className="event-title">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="more-events">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="events-list">
        <h3>Upcoming Events</h3>
        {events.filter(e => new Date(e.date) >= new Date()).slice(0, 5).map((event) => (
          <div key={event.id} className={`event-card event-${event.type}`}>
            <div className="event-header">
              <h4>{event.title}</h4>
              <span className="event-type-badge">{event.type}</span>
            </div>
            <p className="event-description">{event.description}</p>
            <div className="event-meta">
              <span className="event-date">{event.date}</span>
              <span className="event-time">{event.time}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Event</h3>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                >
                  <option value="personal">Personal</option>
                  <option value="academic">Academic</option>
                  <option value="deadline">Deadline</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newEvent.isPublic}
                    onChange={(e) => setNewEvent({ ...newEvent, isPublic: e.target.checked })}
                  />
                  Make this event public
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};