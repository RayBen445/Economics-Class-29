import React, { useState, useEffect } from 'react';
import { UserProfile, addDocument, getCollection, updateDocument, getAllUsers } from '../utils/firebase';
import { Route } from '../types';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  category: string;
  organizer: string;
  organizerName: string;
  maxAttendees?: number;
  attendees: string[];
  tags: string[];
  image?: string;
  isPublic: boolean;
  requiresApproval: boolean;
  createdAt: number;
}

interface EventsPageProps {
  profile: UserProfile;
  setRoute: (route: Route) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ profile, setRoute }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    category: 'academic',
    maxAttendees: '',
    tags: '',
    isPublic: true,
    requiresApproval: false
  });

  const categories = [
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'social', label: 'Social', icon: '🎉' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'cultural', label: 'Cultural', icon: '🎭' },
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'workshop', label: 'Workshop', icon: '🔧' },
    { value: 'seminar', label: 'Seminar', icon: '🎤' },
    { value: 'other', label: 'Other', icon: '📅' }
  ];

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventsData, usersData] = await Promise.all([
        getCollection('events', 'date'),
        getAllUsers()
      ]);
      
      setEvents(eventsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) return;

    try {
      const organizerUser = users.find(u => u.uid === profile.uid);
      
      await addDocument('events', {
        ...newEvent,
        organizer: profile.uid,
        organizerName: organizerUser?.fullName || profile.fullName,
        attendees: [profile.uid], // Organizer is automatically attending
        tags: newEvent.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined
      });
      
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        endTime: '',
        location: '',
        category: 'academic',
        maxAttendees: '',
        tags: '',
        isPublic: true,
        requiresApproval: false
      });
      setShowCreateForm(false);
      await loadEventData();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleRSVP = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      const isAttending = event.attendees.includes(profile.uid);
      let newAttendees;

      if (isAttending) {
        newAttendees = event.attendees.filter(id => id !== profile.uid);
      } else {
        if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
          alert('This event is at capacity');
          return;
        }
        newAttendees = [...event.attendees, profile.uid];
      }

      await updateDocument('events', eventId, { attendees: newAttendees });
      await loadEventData();
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const getFilteredEvents = () => {
    let filtered = events.filter(event => event.isPublic || event.organizer === profile.uid);

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (dateFilter === 'today') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === today.toDateString();
      });
    } else if (dateFilter === 'tomorrow') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === tomorrow.toDateString();
      });
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      });
    } else if (dateFilter === 'upcoming') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      });
    }

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const isEventPast = (event: Event) => {
    const eventDateTime = new Date(`${event.date}T${event.endTime || event.time}`);
    return eventDateTime < new Date();
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventStart = new Date(`${event.date}T${event.time}`);
    const eventEnd = event.endTime ? new Date(`${event.date}T${event.endTime}`) : eventStart;

    if (now < eventStart) return 'upcoming';
    if (now >= eventStart && now <= eventEnd) return 'ongoing';
    return 'past';
  };

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.uid === userId);
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '📅';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    const status = getEventStatus(selectedEvent);
    const isAttending = selectedEvent.attendees.includes(profile.uid);
    const organizer = getUserById(selectedEvent.organizer);
    const attendeesList = selectedEvent.attendees.map(id => getUserById(id)).filter(Boolean);

    return (
      <div className="page">
        <div className="page-header">
          <button 
            onClick={() => setSelectedEvent(null)}
            className="btn-secondary"
          >
            ← Back to Events
          </button>
          <h2>{selectedEvent.title}</h2>
        </div>

        <div className="event-detail">
          <div className="event-header">
            <div className="event-meta">
              <span className="event-category">
                {getCategoryIcon(selectedEvent.category)} {categories.find(c => c.value === selectedEvent.category)?.label}
              </span>
              <span className={`event-status ${status}`}>
                {status === 'upcoming' ? 'Upcoming' : status === 'ongoing' ? 'Happening Now' : 'Past Event'}
              </span>
            </div>
            
            <div className="event-organizer">
              <strong>Organized by:</strong> {selectedEvent.organizerName}
            </div>
          </div>

          <div className="event-info">
            <div className="event-datetime">
              <div className="datetime-item">
                <strong>📅 Date:</strong> {formatEventDate(selectedEvent.date)}
              </div>
              <div className="datetime-item">
                <strong>🕐 Time:</strong> {formatTime(selectedEvent.time)}
                {selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
              </div>
              <div className="datetime-item">
                <strong>📍 Location:</strong> {selectedEvent.location}
              </div>
            </div>

            <div className="event-description">
              <h4>About This Event</h4>
              <p>{selectedEvent.description}</p>
            </div>

            {selectedEvent.tags.length > 0 && (
              <div className="event-tags">
                <h4>Tags</h4>
                <div className="tags">
                  {selectedEvent.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="event-attendance">
              <h4>Attendance</h4>
              <div className="attendance-info">
                <span className="attendance-count">
                  {selectedEvent.attendees.length} attending
                  {selectedEvent.maxAttendees && ` (${selectedEvent.maxAttendees} max)`}
                </span>
                
                {selectedEvent.maxAttendees && (
                  <div className="attendance-bar">
                    <div 
                      className="attendance-fill"
                      style={{ 
                        width: `${Math.min((selectedEvent.attendees.length / selectedEvent.maxAttendees) * 100, 100)}%` 
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="attendees-list">
                <h5>Attendees:</h5>
                <div className="attendees-grid">
                  {attendeesList.slice(0, 12).map((attendee) => (
                    <div key={attendee!.uid} className="attendee-item">
                      <div className="attendee-avatar">
                        {attendee!.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <span className="attendee-name">{attendee!.fullName}</span>
                    </div>
                  ))}
                  {attendeesList.length > 12 && (
                    <div className="more-attendees">
                      +{attendeesList.length - 12} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="event-actions">
            {status !== 'past' && selectedEvent.organizer !== profile.uid && (
              <button 
                onClick={() => handleRSVP(selectedEvent.id)}
                className={`btn ${isAttending ? 'btn-secondary' : 'btn-primary'}`}
                disabled={!isAttending && selectedEvent.maxAttendees && selectedEvent.attendees.length >= selectedEvent.maxAttendees}
              >
                {isAttending ? 'Cancel RSVP' : 'RSVP'}
              </button>
            )}
            
            <button 
              onClick={() => setRoute({ page: 'calendar' })}
              className="btn-secondary"
            >
              View in Calendar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <div className="page">
      <div className="page-header">
        <h2>🎉 Events</h2>
        <p className="page-description">Discover and participate in academic and social events.</p>
      </div>

      <div className="events-controls">
        <div className="events-filters">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          + Create Event
        </button>
      </div>

      <div className="events-stats">
        <div className="stat-item">
          <span className="stat-label">Total Events</span>
          <span className="stat-value">{events.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Upcoming</span>
          <span className="stat-value">
            {events.filter(e => getEventStatus(e) === 'upcoming').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Your Events</span>
          <span className="stat-value">
            {events.filter(e => e.attendees.includes(profile.uid)).length}
          </span>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>No events found</h3>
          <p>Be the first to create an event or adjust your filters.</p>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            Create First Event
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const isAttending = event.attendees.includes(profile.uid);
            const isOrganizer = event.organizer === profile.uid;

            return (
              <div 
                key={event.id} 
                className={`event-card ${status}`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="event-card-header">
                  <div className="event-category-icon">
                    {getCategoryIcon(event.category)}
                  </div>
                  <span className={`event-status-badge ${status}`}>
                    {status === 'upcoming' ? 'Upcoming' : status === 'ongoing' ? 'Live' : 'Past'}
                  </span>
                </div>

                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-details">
                  <div className="event-datetime">
                    <span className="event-date">
                      📅 {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="event-time">
                      🕐 {formatTime(event.time)}
                    </span>
                  </div>
                  
                  <div className="event-location">
                    📍 {event.location}
                  </div>
                </div>

                <div className="event-footer">
                  <div className="event-attendance-summary">
                    <span className="attendees-count">
                      👥 {event.attendees.length} attending
                    </span>
                    {event.maxAttendees && (
                      <span className="max-attendees">
                        (max {event.maxAttendees})
                      </span>
                    )}
                  </div>

                  <div className="event-indicators">
                    {isOrganizer && (
                      <span className="organizer-badge">Organizer</span>
                    )}
                    {isAttending && !isOrganizer && (
                      <span className="attending-badge">Attending</span>
                    )}
                  </div>
                </div>

                {event.tags.length > 0 && (
                  <div className="event-tags-preview">
                    {event.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="tag-preview">{tag}</span>
                    ))}
                    {event.tags.length > 2 && (
                      <span className="more-tags">+{event.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Event</h3>
            <form onSubmit={handleCreateEvent}>
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
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event venue or location"
                    required
                  />
                </div>
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
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time (optional)</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Max Attendees (optional)</label>
                  <input
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newEvent.tags}
                  onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                  placeholder="economics, networking, workshop"
                />
              </div>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newEvent.isPublic}
                    onChange={(e) => setNewEvent({ ...newEvent, isPublic: e.target.checked })}
                  />
                  Make this event public
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newEvent.requiresApproval}
                    onChange={(e) => setNewEvent({ ...newEvent, requiresApproval: e.target.checked })}
                  />
                  Require approval for attendance
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};